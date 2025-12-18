import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { sendPushNotification, getUserPushTokens } from "@/lib/notifications";

/**
 * POST /api/test-notification
 * 
 * Test endpoint to verify push notification delivery
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Get user's push tokens first
        const tokens = await getUserPushTokens(userId);
        console.log(`📱 Found ${tokens.length} push token(s) for user ${userId}:`, tokens);

        if (tokens.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No push tokens found for this user",
                userId,
            });
        }

        // Send test notification
        const result = await sendPushNotification(userId, {
            title: "🔔 Test Notification",
            body: "This is a test notification from Zinu Rooms!",
            data: {
                type: "TEST",
                timestamp: new Date().toISOString(),
            },
        });

        console.log(`📬 Notification result for user ${userId}:`, result);

        return NextResponse.json({
            success: result.success,
            message: result.success
                ? "Test notification sent successfully!"
                : result.error,
            userId,
            tokensFound: tokens.length,
        });
    } catch (error) {
        console.error("Error sending test notification:", error);
        return NextResponse.json(
            { error: "Failed to send test notification" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/test-notification
 * 
 * Check if user has registered push tokens
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const tokens = await getUserPushTokens(userId);

        return NextResponse.json({
            userId,
            tokensCount: tokens.length,
            tokens: tokens, // For debugging
            hasTokens: tokens.length > 0,
        });
    } catch (error) {
        console.error("Error checking push tokens:", error);
        return NextResponse.json(
            { error: "Failed to check push tokens" },
            { status: 500 }
        );
    }
}
