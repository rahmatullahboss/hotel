import { NextRequest, NextResponse } from "next/server";
import { db, pushSubscriptions } from "@repo/db";
import { eq, and } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

// POST - Register FCM push token
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        // Support both fcmToken (new) and expoPushToken (legacy) for backward compatibility
        const fcmToken = body.fcmToken || body.expoPushToken;
        const { platform } = body;

        if (!fcmToken) {
            return NextResponse.json(
                { error: "FCM token is required" },
                { status: 400 }
            );
        }

        if (!platform || !["ios", "android"].includes(platform)) {
            return NextResponse.json(
                { error: "Platform must be 'ios' or 'android'" },
                { status: 400 }
            );
        }

        // Check if this token already exists for this user
        const existing = await db.query.pushSubscriptions.findFirst({
            where: and(
                eq(pushSubscriptions.userId, userId),
                eq(pushSubscriptions.fcmToken, fcmToken)
            ),
        });

        if (existing) {
            // Update existing subscription to ensure it's active
            await db
                .update(pushSubscriptions)
                .set({ isActive: true, platform })
                .where(eq(pushSubscriptions.id, existing.id));

            return NextResponse.json({
                success: true,
                message: "Push token already registered",
            });
        }

        // Create new subscription with FCM token
        await db.insert(pushSubscriptions).values({
            userId,
            fcmToken,
            platform,
        });

        console.log(`[FCM] Registered token for user ${userId} on ${platform}`);

        return NextResponse.json({
            success: true,
            message: "Push token registered successfully",
        });
    } catch (error) {
        console.error("Error registering push token:", error);
        return NextResponse.json(
            { error: "Failed to register push token" },
            { status: 500 }
        );
    }
}

// DELETE - Unregister FCM push token
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        // Support both fcmToken (new) and expoPushToken (legacy)
        const fcmToken = body.fcmToken || body.expoPushToken;

        if (!fcmToken) {
            return NextResponse.json(
                { error: "FCM token is required" },
                { status: 400 }
            );
        }

        // Deactivate the subscription (soft delete)
        await db
            .update(pushSubscriptions)
            .set({ isActive: false })
            .where(
                and(
                    eq(pushSubscriptions.userId, userId),
                    eq(pushSubscriptions.fcmToken, fcmToken)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Push token unregistered successfully",
        });
    } catch (error) {
        console.error("Error unregistering push token:", error);
        return NextResponse.json(
            { error: "Failed to unregister push token" },
            { status: 500 }
        );
    }
}
