"use server";

import { db, pushSubscriptions, type PushSubscription, type Hotel } from "@repo/db";
import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import admin from "firebase-admin";

// ==================
// Firebase Admin Initialization
// ==================

// Initialize Firebase Admin if not already initialized
function getFirebaseAdmin() {
    if (admin.apps.length === 0) {
        // Check for required environment variables
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            console.warn("Firebase Admin credentials not configured");
            return null;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }
    return admin;
}

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
    const mobileSubscriptions = subscriptions.filter((s: PushSubscription) => s.fcmToken && s.isActive).length;

    // Get unique users with subscriptions
    const uniqueUserIds = [...new Set(subscriptions.map((s: PushSubscription) => s.userId))];

    return {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        mobileSubscriptions,
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
export async function getRecentBroadcasts(_limit: number = 10) {
    // For now, we'll return a placeholder since we don't have a broadcasts table
    // In a production app, you'd create a broadcasts table to track these
    return [];
}

// ==================
// Send Functions
// ==================

/**
 * Send a push notification to a specific subscription (Web Push)
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
 * Broadcast notification to all hotel owners (Web Push)
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
// Firebase Cloud Messaging (FCM) - For Flutter Mobile App
// ==================

/**
 * Broadcast notification to ALL mobile app users via FCM
 */
export async function broadcastToAllMobileUsers(
    payload: { title: string; body: string; data?: Record<string, string> }
): Promise<BroadcastResult> {
    try {
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return { success: false, sent: 0, failed: 0, error: "Firebase not configured" };
        }

        // Get all active FCM tokens
        const subscriptions = await db.query.pushSubscriptions.findMany({
            where: and(
                eq(pushSubscriptions.isActive, true),
                isNotNull(pushSubscriptions.fcmToken)
            ),
        });

        // Filter only valid FCM tokens
        const validTokens = subscriptions
            .filter((sub: PushSubscription) => sub.fcmToken && sub.fcmToken.length > 0)
            .map((sub: PushSubscription) => sub.fcmToken as string);

        if (validTokens.length === 0) {
            return { success: false, sent: 0, failed: 0, error: "No mobile devices registered" };
        }

        console.log(`Sending FCM to ${validTokens.length} devices...`);

        // Send to all devices using sendEachForMulticast
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: validTokens,
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

        const sent = response.successCount;
        const failed = response.failureCount;

        // Handle failed tokens - mark them as inactive
        if (response.failureCount > 0) {
            const tokensToDeactivate: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    // Deactivate invalid/unregistered tokens
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        tokensToDeactivate.push(validTokens[idx]);
                    }
                }
            });

            // Deactivate invalid tokens
            if (tokensToDeactivate.length > 0) {
                for (const token of tokensToDeactivate) {
                    await db
                        .update(pushSubscriptions)
                        .set({ isActive: false })
                        .where(eq(pushSubscriptions.fcmToken, token));
                }
                console.log(`Deactivated ${tokensToDeactivate.length} invalid tokens`);
            }
        }

        console.log(`FCM Broadcast: ${sent} success, ${failed} failed`);
        revalidatePath("/notifications");
        return { success: true, sent, failed };
    } catch (error) {
        console.error("FCM broadcast error:", error);
        return { success: false, sent: 0, failed: 0, error: "Failed to send mobile notifications" };
    }
}

/**
 * Send notification to a specific user via FCM
 */
export async function sendToUserMobile(
    userId: string,
    payload: { title: string; body: string; data?: Record<string, string> }
): Promise<BroadcastResult> {
    try {
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            return { success: false, sent: 0, failed: 0, error: "Firebase not configured" };
        }

        // Get user's FCM tokens
        const subscriptions = await db.query.pushSubscriptions.findMany({
            where: and(
                eq(pushSubscriptions.userId, userId),
                eq(pushSubscriptions.isActive, true),
                isNotNull(pushSubscriptions.fcmToken)
            ),
        });

        const tokens = subscriptions
            .filter((sub: PushSubscription) => sub.fcmToken)
            .map((sub: PushSubscription) => sub.fcmToken as string);

        if (tokens.length === 0) {
            return { success: false, sent: 0, failed: 0, error: "User has no registered devices" };
        }

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens,
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

        return {
            success: true,
            sent: response.successCount,
            failed: response.failureCount,
        };
    } catch (error) {
        console.error("FCM send error:", error);
        return { success: false, sent: 0, failed: 0, error: "Failed to send notification" };
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
            url: offerUrl || "",
        },
    });
}
