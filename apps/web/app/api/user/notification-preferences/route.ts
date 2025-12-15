import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationPreferences } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

// GET - Fetch notification preferences
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create notification preferences
        let prefs = await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.userId, userId),
        });

        if (!prefs) {
            const [newPrefs] = await db
                .insert(notificationPreferences)
                .values({ userId })
                .returning();
            prefs = newPrefs!;
        }

        return NextResponse.json({
            bookingConfirmation: prefs.bookingConfirmation,
            checkInInstructions: prefs.checkInInstructions,
            promotions: prefs.promotions,
        });
    } catch (error) {
        console.error("Error getting notification preferences:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { bookingConfirmation, checkInInstructions, promotions } = body;

        // Make sure preferences exist
        let prefs = await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.userId, userId),
        });

        if (!prefs) {
            const [newPrefs] = await db
                .insert(notificationPreferences)
                .values({ userId })
                .returning();
            prefs = newPrefs!;
        }

        // Update preferences
        const updateData: Record<string, boolean> = {};
        if (typeof bookingConfirmation === "boolean") {
            updateData.bookingConfirmation = bookingConfirmation;
        }
        if (typeof checkInInstructions === "boolean") {
            updateData.checkInInstructions = checkInInstructions;
        }
        if (typeof promotions === "boolean") {
            updateData.promotions = promotions;
        }

        if (Object.keys(updateData).length > 0) {
            await db
                .update(notificationPreferences)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(notificationPreferences.userId, userId));
        }

        // Fetch updated preferences
        const updated = await db.query.notificationPreferences.findFirst({
            where: eq(notificationPreferences.userId, userId),
        });

        return NextResponse.json({
            bookingConfirmation: updated?.bookingConfirmation ?? true,
            checkInInstructions: updated?.checkInInstructions ?? true,
            promotions: updated?.promotions ?? true,
        });
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
