import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { db, pushSubscriptions } from "@repo/db";
import { eq } from "drizzle-orm";

// Create a new Expo SDK client
const expo = new Expo();

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
}

/**
 * Get all active push tokens for a user
 */
export async function getUserPushTokens(userId: string): Promise<string[]> {
    const subscriptions = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.userId, userId),
    });

    return subscriptions
        .filter((sub: { isActive: boolean; expoPushToken: string }) => sub.isActive && Expo.isExpoPushToken(sub.expoPushToken))
        .map((sub: { expoPushToken: string }) => sub.expoPushToken);
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
    userId: string,
    notification: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const tokens = await getUserPushTokens(userId);

        if (tokens.length === 0) {
            console.log(`No push tokens found for user ${userId}`);
            return { success: false, error: "No push tokens registered" };
        }

        console.log(`📱 Sending push to ${tokens.length} token(s):`, tokens);
        console.log(`📱 Notification payload:`, notification);

        const messages: ExpoPushMessage[] = tokens.map((token) => ({
            to: token,
            sound: "default" as const,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            priority: "high" as const,
        }));

        console.log(`📱 Messages to send:`, JSON.stringify(messages, null, 2));

        // Send notifications in chunks (Expo recommends this for batch sending)
        const chunks = expo.chunkPushNotifications(messages);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
            console.log(`📱 Sending chunk of ${chunk.length} message(s)...`);
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(`📱 Received tickets:`, JSON.stringify(ticketChunk, null, 2));
            tickets.push(...ticketChunk);
        }

        // Log all ticket results
        let hasError = false;
        tickets.forEach((ticket, index) => {
            if (ticket.status === "error") {
                hasError = true;
                console.error(
                    `❌ Push notification error for token ${tokens[index]}:`,
                    ticket.message,
                    ticket.details
                );
            } else {
                console.log(`✅ Push notification queued successfully:`, ticket);
            }
        });

        console.log(`📬 Sent ${tickets.length} push notification(s) to user ${userId}`);
        return { success: !hasError, error: hasError ? "Some notifications failed" : undefined };
    } catch (error) {
        console.error("❌ Error sending push notification:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send booking confirmation notification
 */
export async function sendBookingConfirmation(
    userId: string,
    booking: {
        id: string;
        guestName: string;
        checkIn: string;
        checkOut: string;
    },
    hotelName?: string
): Promise<void> {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });

    await sendPushNotification(userId, {
        title: "🎉 Booking Confirmed!",
        body: `${hotelName || "Your room"} is booked for ${checkInDate}. See you soon!`,
        data: {
            type: "BOOKING_CONFIRMED",
            bookingId: booking.id,
        },
    });
}

/**
 * Send booking cancellation notification
 */
export async function sendBookingCancellation(
    userId: string,
    booking: {
        id: string;
        guestName: string;
    },
    refundAmount?: number
): Promise<void> {
    const refundText = refundAmount
        ? ` ৳${refundAmount} refunded to wallet.`
        : "";

    await sendPushNotification(userId, {
        title: "Booking Cancelled",
        body: `Your booking has been cancelled.${refundText}`,
        data: {
            type: "BOOKING_CANCELLED",
            bookingId: booking.id,
        },
    });
}

/**
 * Send check-in reminder notification (for scheduled jobs)
 */
export async function sendCheckInReminder(
    userId: string,
    booking: {
        id: string;
        guestName: string;
        checkIn: string;
    },
    hotelName?: string
): Promise<void> {
    await sendPushNotification(userId, {
        title: "Check-in Tomorrow! 🏨",
        body: `Don't forget your check-in at ${hotelName || "your hotel"} tomorrow.`,
        data: {
            type: "CHECK_IN_REMINDER",
            bookingId: booking.id,
        },
    });
}
