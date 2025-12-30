import admin from "firebase-admin";
import { db, pushSubscriptions } from "@repo/db";
import { eq, and, isNotNull } from "drizzle-orm";

// ==================
// Firebase Admin Initialization
// ==================

function getFirebaseAdmin() {
    if (admin.apps.length === 0) {
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

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Get all active FCM tokens for a user
 */
export async function getUserPushTokens(userId: string): Promise<string[]> {
    const subscriptions = await db.query.pushSubscriptions.findMany({
        where: and(
            eq(pushSubscriptions.userId, userId),
            eq(pushSubscriptions.isActive, true),
            isNotNull(pushSubscriptions.fcmToken)
        ),
    });

    return subscriptions
        .filter((sub: { fcmToken: string | null; isActive: boolean }) => sub.fcmToken && sub.fcmToken.length > 0)
        .map((sub: { fcmToken: string | null }) => sub.fcmToken as string);
}

/**
 * Send push notification to a specific user via FCM
 */
export async function sendPushNotification(
    userId: string,
    notification: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        const firebaseAdmin = getFirebaseAdmin();
        if (!firebaseAdmin) {
            console.log("Firebase not configured, skipping push notification");
            return { success: false, error: "Firebase not configured" };
        }

        const tokens = await getUserPushTokens(userId);

        if (tokens.length === 0) {
            console.log(`No push tokens found for user ${userId}`);
            return { success: false, error: "No push tokens registered" };
        }

        console.log(`📱 Sending FCM push to ${tokens.length} token(s)`);

        // Convert data values to strings (FCM requires string values)
        const stringData: Record<string, string> = {};
        if (notification.data) {
            for (const [key, value] of Object.entries(notification.data)) {
                stringData[key] = String(value);
            }
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: stringData,
            tokens,
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

        // Handle failed tokens
        if (response.failureCount > 0) {
            const tokensToDeactivate: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        const token = tokens[idx];
                        if (token) {
                            tokensToDeactivate.push(token);
                        }
                    }
                    console.error(`❌ FCM error for token:`, resp.error?.message);
                }
            });

            // Deactivate invalid tokens
            for (const token of tokensToDeactivate) {
                await db
                    .update(pushSubscriptions)
                    .set({ isActive: false })
                    .where(eq(pushSubscriptions.fcmToken, token));
            }
        }

        console.log(`📬 FCM: ${response.successCount} success, ${response.failureCount} failed`);
        return { 
            success: response.successCount > 0, 
            error: response.failureCount > 0 ? "Some notifications failed" : undefined 
        };
    } catch (error) {
        console.error("❌ Error sending FCM notification:", error);
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
