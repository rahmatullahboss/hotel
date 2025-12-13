import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db, pushSubscriptions } from "@repo/db";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { subscription, deviceName } = body;

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json(
                { error: "Invalid subscription data" },
                { status: 400 }
            );
        }

        // Check if this endpoint already exists for this user
        const existing = await db.query.pushSubscriptions.findFirst({
            where: and(
                eq(pushSubscriptions.userId, session.user.id),
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
                    deviceName: deviceName || existing.deviceName,
                })
                .where(eq(pushSubscriptions.id, existing.id));

            return NextResponse.json({
                success: true,
                message: "Subscription updated",
                subscriptionId: existing.id,
            });
        }

        // Create new subscription
        const [newSub] = await db
            .insert(pushSubscriptions)
            .values({
                userId: session.user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                deviceName,
            })
            .returning({ id: pushSubscriptions.id });

        return NextResponse.json({
            success: true,
            message: "Subscription created",
            subscriptionId: newSub?.id,
        });
    } catch (error) {
        console.error("Error subscribing to push:", error);
        return NextResponse.json(
            { error: "Failed to subscribe" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Delete all subscriptions for this user
        await db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, session.user.id));

        return NextResponse.json({
            success: true,
            message: "All subscriptions removed",
        });
    } catch (error) {
        console.error("Error removing subscriptions:", error);
        return NextResponse.json(
            { error: "Failed to remove subscriptions" },
            { status: 500 }
        );
    }
}
