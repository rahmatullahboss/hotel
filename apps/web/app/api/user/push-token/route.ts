import { NextRequest, NextResponse } from "next/server";
import { db, pushSubscriptions, users } from "@repo/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";

// Helper to get user ID from request
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    // Try session auth first
    const session = await auth();
    if (session?.user?.id) {
        return session.user.id;
    }

    // Try Bearer token for mobile app
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        // Token is the user ID for mobile auth
        const user = await db.query.users.findFirst({
            where: eq(users.id, token),
        });
        if (user) {
            return user.id;
        }
    }

    return null;
}

// POST - Register Expo push token
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { expoPushToken, platform } = body;

        if (!expoPushToken) {
            return NextResponse.json(
                { error: "Expo push token is required" },
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
                eq(pushSubscriptions.expoPushToken, expoPushToken)
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

        // Create new subscription
        await db.insert(pushSubscriptions).values({
            userId,
            expoPushToken,
            platform,
        });

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

// DELETE - Unregister Expo push token
export async function DELETE(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { expoPushToken } = body;

        if (!expoPushToken) {
            return NextResponse.json(
                { error: "Expo push token is required" },
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
                    eq(pushSubscriptions.expoPushToken, expoPushToken)
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
