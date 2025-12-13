/**
 * Push Notifications Service
 * 
 * Uses the Web Push API to send notifications to subscribed devices.
 * Requires VAPID keys to be set in environment variables.
 */

import webpush from "web-push";
import { db, pushSubscriptions, notificationPreferences, users, hotels } from "@repo/db";
import { eq, and } from "drizzle-orm";

// ==================
// Types
// ==================

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

export interface SubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

export type NotificationType =
    | "newBooking"
    | "cancellation"
    | "checkInReminder"
    | "paymentReceived"
    | "lowInventory"
    | "bookingConfirmation"
    | "checkInInstructions"
    | "promotions";

// ==================
// Configuration
// ==================

let initialized = false;

function initializeWebPush(): void {
    if (initialized) return;

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn("VAPID keys not configured. Push notifications will be disabled.");
        return;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    initialized = true;
}

// ==================
// Subscription Management
// ==================

/**
 * Subscribe a user to push notifications
 */
export async function subscribeUser(
    userId: string,
    subscription: SubscriptionData,
    deviceName?: string
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
        // Check if this endpoint already exists
        const existing = await db.query.pushSubscriptions.findFirst({
            where: and(
                eq(pushSubscriptions.userId, userId),
                eq(pushSubscriptions.endpoint, subscription.endpoint)
            ),
        });

        if (existing) {
            // Update existing subscription
            await db
                .update(pushSubscriptions)
                .set({
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                    isActive: true,
                    deviceName,
                })
                .where(eq(pushSubscriptions.id, existing.id));

            return { success: true, subscriptionId: existing.id };
        }

        // Create new subscription
        const [newSub] = await db
            .insert(pushSubscriptions)
            .values({
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                deviceName,
            })
            .returning({ id: pushSubscriptions.id });

        // Create default notification preferences if not exists
        const existingPrefs = await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.userId, userId),
        });

        if (!existingPrefs) {
            await db.insert(notificationPreferences).values({ userId });
        }

        return { success: true, subscriptionId: newSub?.id };
    } catch (error) {
        console.error("Error subscribing user:", error);
        return { success: false, error: "Failed to subscribe" };
    }
}

/**
 * Unsubscribe a user from push notifications
 */
export async function unsubscribeUser(
    userId: string,
    endpoint: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .delete(pushSubscriptions)
            .where(
                and(
                    eq(pushSubscriptions.userId, userId),
                    eq(pushSubscriptions.endpoint, endpoint)
                )
            );

        return { success: true };
    } catch (error) {
        console.error("Error unsubscribing user:", error);
        return { success: false, error: "Failed to unsubscribe" };
    }
}

/**
 * Get all active subscriptions for a user
 */
export async function getUserSubscriptions(userId: string) {
    return db.query.pushSubscriptions.findMany({
        where: and(
            eq(pushSubscriptions.userId, userId),
            eq(pushSubscriptions.isActive, true)
        ),
    });
}

// ==================
// Notification Preferences
// ==================

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: string) {
    let prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId),
    });

    if (!prefs) {
        // Create defaults
        const [newPrefs] = await db
            .insert(notificationPreferences)
            .values({ userId })
            .returning();
        prefs = newPrefs;
    }

    return prefs;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
    userId: string,
    updates: Partial<{
        newBooking: boolean;
        cancellation: boolean;
        checkInReminder: boolean;
        paymentReceived: boolean;
        lowInventory: boolean;
        bookingConfirmation: boolean;
        checkInInstructions: boolean;
        promotions: boolean;
    }>
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(notificationPreferences)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(notificationPreferences.userId, userId));

        return { success: true };
    } catch (error) {
        console.error("Error updating preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
}

// ==================
// Send Notifications
// ==================

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification(
    userId: string,
    payload: PushPayload,
    notificationType?: NotificationType
): Promise<{ success: boolean; sent: number; error?: string }> {
    initializeWebPush();

    if (!initialized) {
        return { success: false, sent: 0, error: "Push notifications not configured" };
    }

    try {
        // Check user preferences if notification type specified
        if (notificationType) {
            const prefs = await getNotificationPreferences(userId);
            if (prefs && !prefs[notificationType]) {
                return { success: true, sent: 0 }; // User has disabled this type
            }
        }

        // Get all active subscriptions
        const subscriptions = await getUserSubscriptions(userId);

        if (subscriptions.length === 0) {
            return { success: true, sent: 0 };
        }

        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/icon-192.png",
            badge: payload.badge || "/badge-72.png",
            url: payload.url || "/",
            tag: payload.tag,
            data: payload.data,
        });

        let sent = 0;
        const failedEndpoints: string[] = [];

        // Send to all subscriptions
        await Promise.all(
            subscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.p256dh,
                                auth: sub.auth,
                            },
                        },
                        notificationPayload
                    );
                    sent++;
                } catch (error: unknown) {
                    const webPushError = error as { statusCode?: number };
                    // Handle expired or invalid subscriptions
                    if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
                        failedEndpoints.push(sub.endpoint);
                    }
                    console.error("Error sending to subscription:", sub.id, error);
                }
            })
        );

        // Clean up invalid subscriptions
        if (failedEndpoints.length > 0) {
            for (const endpoint of failedEndpoints) {
                await db
                    .update(pushSubscriptions)
                    .set({ isActive: false })
                    .where(
                        and(
                            eq(pushSubscriptions.userId, userId),
                            eq(pushSubscriptions.endpoint, endpoint)
                        )
                    );
            }
        }

        return { success: true, sent };
    } catch (error) {
        console.error("Error sending push notification:", error);
        return { success: false, sent: 0, error: "Failed to send notification" };
    }
}

/**
 * Send notification to hotel owner/staff when a new booking is received
 */
export async function notifyNewBooking(booking: {
    id: string;
    guestName: string;
    hotelId: string;
    roomNumber: string;
    checkIn: string;
    totalAmount: number;
}): Promise<void> {
    try {
        // Get hotel owner
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, booking.hotelId),
            with: { owner: true },
        });

        if (!hotel?.ownerId) return;

        await sendPushNotification(
            hotel.ownerId,
            {
                title: "🎉 New Booking Received!",
                body: `${booking.guestName} booked Room ${booking.roomNumber} for ${booking.checkIn}. Total: ৳${booking.totalAmount}`,
                url: `/bookings?highlight=${booking.id}`,
                tag: `booking-${booking.id}`,
            },
            "newBooking"
        );
    } catch (error) {
        console.error("Error notifying new booking:", error);
    }
}

/**
 * Send notification when a booking is cancelled
 */
export async function notifyCancellation(booking: {
    id: string;
    guestName: string;
    hotelId: string;
    roomNumber: string;
    checkIn: string;
}): Promise<void> {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, booking.hotelId),
        });

        if (!hotel?.ownerId) return;

        await sendPushNotification(
            hotel.ownerId,
            {
                title: "❌ Booking Cancelled",
                body: `${booking.guestName}'s booking for Room ${booking.roomNumber} on ${booking.checkIn} was cancelled.`,
                url: `/bookings?status=CANCELLED`,
                tag: `cancel-${booking.id}`,
            },
            "cancellation"
        );
    } catch (error) {
        console.error("Error notifying cancellation:", error);
    }
}

/**
 * Send check-in reminder to hotel staff
 */
export async function notifyCheckInReminder(booking: {
    id: string;
    guestName: string;
    hotelId: string;
    roomNumber: string;
    expectedTime: string;
}): Promise<void> {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, booking.hotelId),
        });

        if (!hotel?.ownerId) return;

        await sendPushNotification(
            hotel.ownerId,
            {
                title: "⏰ Check-in Reminder",
                body: `${booking.guestName} is expected to arrive at ${booking.expectedTime} for Room ${booking.roomNumber}.`,
                url: `/scanner?bookingId=${booking.id}`,
                tag: `checkin-${booking.id}`,
            },
            "checkInReminder"
        );
    } catch (error) {
        console.error("Error notifying check-in reminder:", error);
    }
}

/**
 * Send notification when payment is received
 */
export async function notifyPaymentReceived(payment: {
    hotelId: string;
    guestName: string;
    amount: number;
    bookingId: string;
}): Promise<void> {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, payment.hotelId),
        });

        if (!hotel?.ownerId) return;

        await sendPushNotification(
            hotel.ownerId,
            {
                title: "💰 Payment Received",
                body: `Received ৳${payment.amount.toLocaleString()} from ${payment.guestName}.`,
                url: `/earnings`,
                tag: `payment-${payment.bookingId}`,
            },
            "paymentReceived"
        );
    } catch (error) {
        console.error("Error notifying payment:", error);
    }
}

// ==================
// VAPID Key Generation Helper
// ==================

/**
 * Generate new VAPID keys (run once during setup)
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
    return webpush.generateVAPIDKeys();
}

export { webpush };
