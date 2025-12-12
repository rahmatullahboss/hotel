"use server";

import { db } from "@repo/db";
import { bookings, users, roomInventory, activityLog } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { getPartnerHotel } from "./dashboard";

/**
 * Mark a booking as No-Show
 * This is called when a guest with a confirmed booking doesn't show up
 * 
 * Effects:
 * - Status changed to CANCELLED with reason "NO_SHOW"
 * - Advance payment is forfeited (50% to hotel, 50% to platform)
 * - Customer's trust score is reduced
 * - Room inventory is released
 */
export async function markAsNoShow(
    bookingId: string,
    hotelId: string
): Promise<{ success: boolean; error?: string; refundAmount?: number }> {
    try {
        const session = await auth();
        const hotel = await getPartnerHotel();

        if (!hotel || hotel.id !== hotelId) {
            return { success: false, error: "Unauthorized" };
        }

        // Get the booking
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        // Only confirmed bookings can be marked as no-show
        if (booking.status !== "CONFIRMED") {
            return { success: false, error: "Only confirmed bookings can be marked as no-show" };
        }

        // Check if today is >= check-in date
        const today = new Date().toISOString().split("T")[0]!;
        if (booking.checkIn > today) {
            return { success: false, error: "Cannot mark as no-show before check-in date" };
        }

        // Get the advance payment (booking fee)
        const advancePaid = Number(booking.bookingFee || 0);

        // Calculate split: 50% to hotel, 50% platform keeps
        const hotelShare = Math.floor(advancePaid * 0.5);

        // Update booking status
        await db
            .update(bookings)
            .set({
                status: "CANCELLED",
                cancellationReason: "NO_SHOW",
                cancelledAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));

        // Note: Hotel's share of forfeited advance (hotelShare) is recorded in activity log
        // and will be reconciled during payout processing

        // Update customer trust score if they have an account
        if (booking.userId) {
            const user = await db.query.users.findFirst({
                where: eq(users.id, booking.userId),
            });

            if (user) {
                const newTrustScore = Math.max(0, (user.trustScore || 100) - 15); // Reduce by 15 points
                const newLateCancellations = (user.lateCancellationCount || 0) + 1;

                // Disable Pay at Hotel after 3 no-shows
                const payAtHotelAllowed = newLateCancellations < 3;

                await db
                    .update(users)
                    .set({
                        trustScore: newTrustScore,
                        lateCancellationCount: newLateCancellations,
                        payAtHotelAllowed,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, booking.userId));
            }
        }

        // Release room inventory
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const dates: string[] = [];
        const current = new Date(checkInDate);
        while (current < checkOutDate) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, booking.roomId),
                    eq(roomInventory.date, date)
                ),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "AVAILABLE", updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            }
        }

        // Log activity
        await db.insert(activityLog).values({
            type: "BOOKING_CANCELLED",
            actorId: session?.user?.id,
            hotelId: hotelId,
            bookingId: bookingId,
            description: `Booking marked as NO-SHOW for ${booking.guestName}`,
            metadata: {
                guestName: booking.guestName,
                guestPhone: booking.guestPhone,
                advanceForfeited: advancePaid,
                hotelShare,
                platformShare: advancePaid - hotelShare,
                reason: "NO_SHOW",
            },
        });

        revalidatePath("/");
        revalidatePath("/bookings");
        revalidatePath("/inventory");

        return {
            success: true,
            refundAmount: 0, // No refund for no-show
        };
    } catch (error) {
        console.error("Error marking booking as no-show:", error);
        return { success: false, error: "Failed to mark as no-show" };
    }
}
