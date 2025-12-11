"use server";

import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq, lt, and, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Cancel all expired pending bookings
 * This should be called periodically (every 5 minutes recommended)
 * 
 * Expired bookings are those with:
 * - status = PENDING
 * - bookingFeeStatus = PENDING  
 * - expiresAt < now
 */
export async function cancelExpiredBookings(): Promise<{
    success: boolean;
    cancelledCount: number;
    error?: string;
}> {
    try {
        const now = new Date();

        // Find all expired pending bookings
        const expiredBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.status, "PENDING"),
                eq(bookings.bookingFeeStatus, "PENDING"),
                isNotNull(bookings.expiresAt),
                lt(bookings.expiresAt, now)
            ),
        });

        if (expiredBookings.length === 0) {
            return { success: true, cancelledCount: 0 };
        }

        // Cancel each expired booking
        for (const booking of expiredBookings) {
            await db
                .update(bookings)
                .set({
                    status: "CANCELLED",
                    cancellationReason: "Payment not completed within 20 minutes",
                    cancelledAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));
        }

        revalidatePath("/bookings");

        console.log(`Cancelled ${expiredBookings.length} expired bookings`);
        return { success: true, cancelledCount: expiredBookings.length };
    } catch (error) {
        console.error("Error cancelling expired bookings:", error);
        return {
            success: false,
            cancelledCount: 0,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
