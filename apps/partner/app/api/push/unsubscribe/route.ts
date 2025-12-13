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
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json(
                { error: "Endpoint required" },
                { status: 400 }
            );
        }

        // Delete the subscription
        await db
            .delete(pushSubscriptions)
            .where(
                and(
                    eq(pushSubscriptions.userId, session.user.id),
                    eq(pushSubscriptions.endpoint, endpoint)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Unsubscribed successfully",
        });
    } catch (error) {
        console.error("Error unsubscribing from push:", error);
        return NextResponse.json(
            { error: "Failed to unsubscribe" },
            { status: 500 }
        );
    }
}
