"use server";

import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

// Types for Guest Communication
export interface MessageTemplate {
    id: string;
    name: string;
    type: "PRE_ARRIVAL" | "WELCOME" | "POST_STAY" | "CUSTOM";
    subject: string;
    body: string;
    isActive: boolean;
    sendTiming: number; // hours before/after event
}

export interface AutomationSettings {
    preArrivalEnabled: boolean;
    preArrivalHours: number;
    welcomeMessageEnabled: boolean;
    postStayEnabled: boolean;
    postStayHours: number;
}

export interface GuestMessage {
    id: string;
    bookingId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    type: "PRE_ARRIVAL" | "WELCOME" | "POST_STAY" | "CUSTOM";
    subject: string;
    status: "PENDING" | "SENT" | "FAILED";
    sentAt: Date | null;
    createdAt: Date;
}

// Default message templates
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
    {
        id: "pre-arrival",
        name: "Pre-Arrival Message",
        type: "PRE_ARRIVAL",
        subject: "Your stay at {hotelName} is coming up!",
        body: `Dear {guestName},

We're excited to welcome you to {hotelName} on {checkInDate}! 

Here are some details about your upcoming stay:
- Check-in: {checkInDate} from 2:00 PM
- Check-out: {checkOutDate} by 12:00 PM
- Room: {roomType}

If you have any special requests or need early check-in, please let us know.

See you soon!
{hotelName} Team`,
        isActive: true,
        sendTiming: 24, // 24 hours before check-in
    },
    {
        id: "welcome",
        name: "Welcome Message",
        type: "WELCOME",
        subject: "Welcome to {hotelName}!",
        body: `Dear {guestName},

Welcome to {hotelName}! We hope you have a wonderful stay.

Wi-Fi: {wifiNetwork}
Password: {wifiPassword}

Need anything? Contact us at the front desk or call {frontDeskPhone}.

Enjoy your stay!`,
        isActive: true,
        sendTiming: 0, // On check-in
    },
    {
        id: "post-stay",
        name: "Post-Stay Feedback",
        type: "POST_STAY",
        subject: "Thank you for staying at {hotelName}!",
        body: `Dear {guestName},

Thank you for choosing {hotelName}! We hope you had a wonderful stay.

We'd love to hear your feedback. Please take a moment to rate your experience:

[Rate Your Stay]

Your feedback helps us improve and serve you better.

We hope to see you again soon!
{hotelName} Team`,
        isActive: true,
        sendTiming: 2, // 2 hours after check-out
    },
];

/**
 * Get automation settings for a hotel
 */
export async function getAutomationSettings(): Promise<AutomationSettings> {
    const session = await auth();
    if (!session?.user?.email) {
        return {
            preArrivalEnabled: false,
            preArrivalHours: 24,
            welcomeMessageEnabled: false,
            postStayEnabled: false,
            postStayHours: 2,
        };
    }

    // In a real implementation, this would fetch from a settings table
    // For now, return default settings
    return {
        preArrivalEnabled: true,
        preArrivalHours: 24,
        welcomeMessageEnabled: true,
        postStayEnabled: true,
        postStayHours: 2,
    };
}

/**
 * Update automation settings
 */
export async function updateAutomationSettings(
    settings: AutomationSettings
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    // In a real implementation, this would save to a settings table
    console.log("Updating automation settings:", settings);
    
    revalidatePath("/messaging");
    return { success: true };
}

/**
 * Get message templates
 */
export async function getMessageTemplates(): Promise<MessageTemplate[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // Return default templates (in real impl, fetch from DB)
    return DEFAULT_TEMPLATES;
}

/**
 * Update a message template
 */
export async function updateMessageTemplate(
    templateId: string,
    updates: Partial<MessageTemplate>
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Updating template:", templateId, updates);
    
    revalidatePath("/messaging");
    return { success: true };
}

/**
 * Get recent guest messages (sent/pending)
 */
export async function getRecentMessages(limit: number = 20): Promise<GuestMessage[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // In real implementation, fetch from a messages table
    // For now, generate sample data based on recent bookings
    const recentBookings = await db
        .select()
        .from(bookings)
        .orderBy(desc(bookings.createdAt))
        .limit(limit);

    return recentBookings.map((booking) => ({
        id: `msg-${booking.id}`,
        bookingId: booking.id,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        type: "PRE_ARRIVAL" as const,
        subject: `Your stay is coming up!`,
        status: booking.status === "CHECKED_IN" ? "SENT" as const : "PENDING" as const,
        sentAt: booking.status === "CHECKED_IN" ? booking.updatedAt : null,
        createdAt: booking.createdAt,
    }));
}

/**
 * Send a custom message to a guest
 */
export async function sendCustomMessage(
    bookingId: string,
    subject: string,
    message: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    // Find booking
    const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
    });

    if (!booking) {
        return { success: false, error: "Booking not found" };
    }

    // In real implementation:
    // 1. Send email via Resend/SendGrid
    // 2. Send SMS via Twilio
    // 3. Log to messages table

    console.log("Sending custom message to:", booking.guestEmail, {
        subject,
        message,
    });

    revalidatePath("/messaging");
    return { success: true };
}

/**
 * Get upcoming check-ins for pre-arrival messaging
 */
export async function getUpcomingCheckInsForMessaging(): Promise<{
    bookingId: string;
    guestName: string;
    guestEmail: string;
    checkIn: Date;
    hoursUntilCheckIn: number;
}[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const nowStr = now.toISOString().split("T")[0] || "";
    const next48Str = next48Hours.toISOString().split("T")[0] || "";

    const upcoming = await db
        .select()
        .from(bookings)
        .where(
            and(
                gte(bookings.checkIn, nowStr),
                lte(bookings.checkIn, next48Str),
                eq(bookings.status, "CONFIRMED")
            )
        );

    return upcoming.map((booking) => {
        const checkInDate = new Date(booking.checkIn);
        const hoursUntil = Math.max(0, (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        return {
            bookingId: booking.id,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            checkIn: checkInDate,
            hoursUntilCheckIn: Math.round(hoursUntil),
        };
    });
}
