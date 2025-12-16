"use server";

import { db, pushSubscriptions, users, hotels, type PushSubscription, type Hotel } from "@repo/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================
// Types
// ==================

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    tag?: string;
}

interface BroadcastResult {
    success: boolean;
    sent: number;
    failed: number;
    error?: string;
}

// ==================
// Get Functions
// ==================

/**
 * Get notification stats
 */
export async function getNotificationStats() {
    const subscriptions = await db.query.pushSubscriptions.findMany();
    const activeSubscriptions = subscriptions.filter((s: PushSubscription) => s.isActive).length;

    // Get unique users with subscriptions
    const uniqueUserIds = [...new Set(subscriptions.map((s: PushSubscription) => s.userId))];

    return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        uniqueUsers: uniqueUserIds.length,
    };
}

/**
 * Get all hotel owners with push subscriptions
 */
export async function getHotelOwnersWithSubscriptions() {
    // Get all hotel owner IDs
    const allHotels = await db.query.hotels.findMany({
        with: {
            owner: true,
        },
    });

    const ownerIds = [...new Set(allHotels.map((h: Hotel) => h.ownerId))] as string[];

    // Get subscriptions for hotel owners
    const subscriptions = await db.query.pushSubscriptions.findMany({
        where: and(
            inArray(pushSubscriptions.userId, ownerIds),
            eq(pushSubscriptions.isActive, true)
        ),
    });

    return subscriptions;
}

/**
 * Get recent broadcasts (from activity log)
 */
export async function getRecentBroadcasts(limit: number = 10) {
    // For now, we'll return a placeholder since we don't have a broadcasts table
    // In a production app, you'd create a broadcasts table to track these
    return [];
}

// ==================
// Send Functions
// ==================

/**
 * Send a push notification to a specific subscription
 */
async function sendPushToSubscription(
    subscription: {
        endpoint: string;
        p256dh: string;
        auth: string;
    },
    payload: NotificationPayload
): Promise<boolean> {
    try {
        // Check for VAPID keys
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT;

        if (!vapidPrivateKey || !vapidPublicKey || !vapidSubject) {
            console.warn("VAPID keys not configured");
            return false;
        }

        // Dynamic import to avoid issues if web-push isn't installed
        const webpush = await import("web-push");

        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.p256dh,
                    auth: subscription.auth,
                },
            },
            JSON.stringify(payload)
        );

        return true;
    } catch (error) {
        console.error("Push notification error:", error);
        return false;
    }
}

/**
 * Broadcast notification to all hotel owners
 */
export async function broadcastToAllPartners(
    payload: NotificationPayload
): Promise<BroadcastResult> {
    try {
        const subscriptions = await getHotelOwnersWithSubscriptions();

        if (subscriptions.length === 0) {
            return { success: true, sent: 0, failed: 0, error: "No active subscriptions found" };
        }

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            // Skip invalid subscriptions
            if (!sub.endpoint || !sub.p256dh || !sub.auth) {
                continue;
            }

            const success = await sendPushToSubscription(
                {
                    endpoint: sub.endpoint,
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
                payload
            );

            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        revalidatePath("/notifications");
        return { success: true, sent, failed };
    } catch (error) {
        console.error("Broadcast error:", error);
        return { success: false, sent: 0, failed: 0, error: "Failed to broadcast" };
    }
}

/**
 * Send notification to a specific hotel owner
 */
export async function sendToHotelOwner(
    ownerId: string,
    payload: NotificationPayload
): Promise<BroadcastResult> {
    try {
        const subscriptions = await db.query.pushSubscriptions.findMany({
            where: and(
                eq(pushSubscriptions.userId, ownerId),
                eq(pushSubscriptions.isActive, true)
            ),
        });

        if (subscriptions.length === 0) {
            return { success: false, sent: 0, failed: 0, error: "No subscriptions for this user" };
        }

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            // Skip invalid subscriptions
            if (!sub.endpoint || !sub.p256dh || !sub.auth) {
                continue;
            }

            const success = await sendPushToSubscription(
                {
                    endpoint: sub.endpoint,
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
                payload
            );

            if (success) {
                sent++;
            } else {
                failed++;
            }
        }

        return { success: true, sent, failed };
    } catch (error) {
        console.error("Send error:", error);
        return { success: false, sent: 0, failed: 0, error: "Failed to send notification" };
    }
}

/**
 * Test notification (send to all admin's own subscriptions)
 */
export async function sendTestNotification(): Promise<BroadcastResult> {
    return broadcastToAllPartners({
        title: "🔔 Test Notification",
        body: "This is a test notification from the admin panel.",
        icon: "/icon-192x192.png",
        tag: "test",
    });
}

// ==================
// Expo Push Notifications (Mobile App)
// ==================

import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

const expo = new Expo();

/**
 * Broadcast notification to ALL mobile app users
 */
export async function broadcastToAllMobileUsers(
    payload: { title: string; body: string; data?: Record<string, unknown> }
): Promise<BroadcastResult> {
    try {
        // Get all active Expo push tokens
        const subscriptions = await db.query.pushSubscriptions.findMany({
            where: eq(pushSubscriptions.isActive, true),
        });

        // Filter only valid Expo tokens
        const validTokens = subscriptions
            .filter((sub: PushSubscription) => sub.expoPushToken && Expo.isExpoPushToken(sub.expoPushToken))
            .map((sub: PushSubscription) => sub.expoPushToken);

        if (validTokens.length === 0) {
            return { success: false, sent: 0, failed: 0, error: "No mobile devices registered" };
        }

        // Create messages
        const messages: ExpoPushMessage[] = validTokens.map((token: string) => ({
            to: token,
            sound: "default" as const,
            title: payload.title,
            body: payload.body,
            data: payload.data,
        }));

        // Send in chunks
        const chunks = expo.chunkPushNotifications(messages);
        let sent = 0;
        let failed = 0;

        for (const chunk of chunks) {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            tickets.forEach((ticket: ExpoPushTicket) => {
                if (ticket.status === "ok") {
                    sent++;
                } else {
                    failed++;
                }
            });
        }

        console.log(`Broadcast sent: ${sent} success, ${failed} failed`);
        revalidatePath("/notifications");
        return { success: true, sent, failed };
    } catch (error) {
        console.error("Mobile broadcast error:", error);
        return { success: false, sent: 0, failed: 0, error: "Failed to send mobile notifications" };
    }
}

/**
 * Send promotional/offer notification to all mobile users
 */
export async function sendOfferNotification(
    title: string,
    body: string,
    offerUrl?: string
): Promise<BroadcastResult> {
    return broadcastToAllMobileUsers({
        title,
        body,
        data: {
            type: "OFFER",
            url: offerUrl,
        },
    });
}
