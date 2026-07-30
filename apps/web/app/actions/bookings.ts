"use server";

import { auth } from "@/auth";
import { db } from "@repo/db";
import { bookings, rooms, hotels, wallets, walletTransactions } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendBookingCancellation } from "@/lib/notifications";
import { pushRealtimeEvent } from "@/lib/realtime";
import {
    createBookingForUser,
    type BookingResult,
    type CreateBookingInput,
} from "@/lib/booking-creation-service";

export type { BookingResult, CreateBookingInput };

export async function createBooking(
    input: CreateBookingInput,
): Promise<BookingResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: "User must be logged in to make a booking.",
        };
    }

    return createBookingForUser(input, {
        userId: session.user.id,
        source: "WEB",
    });
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string) {
    try {
        const userBookings = await db
            .select({
                id: bookings.id,
                checkIn: bookings.checkIn,
                checkOut: bookings.checkOut,
                status: bookings.status,
                totalAmount: bookings.totalAmount,
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
                guestName: bookings.guestName,
                qrCode: bookings.qrCode,
                hotelName: hotels.name,
                hotelLocation: hotels.address,
                hotelImage: hotels.coverImage,
                roomName: rooms.name,
            })
            .from(bookings)
            .leftJoin(hotels, eq(hotels.id, bookings.hotelId))
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(eq(bookings.userId, userId))
            .orderBy(desc(bookings.createdAt));

        return userBookings;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
}

/**
 * Cancel a booking with time-based policy enforcement
 * 
 * Pay at Hotel: Free cancellation up to 2 hours before check-in (2PM)
 *   - Late cancellation: Trust score -10, may lose Pay at Hotel privilege
 * 
 * Partial Payment: Free cancellation 24+ hours before check-in → refund to wallet
 *   - Late cancellation (<24h): Token money forfeited
 */
export async function cancelBooking(
    bookingId: string,
    userId: string,
    reason: string
): Promise<BookingResult & { refundAmount?: number; isLate?: boolean }> {
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.userId !== userId) {
            return { success: false, error: "Not authorized" };
        }

        if (booking.status === "CANCELLED") {
            return { success: false, error: "Booking already cancelled" };
        }

        if (booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT") {
            return { success: false, error: "Cannot cancel completed booking" };
        }

        // Calculate time until check-in (assume 2PM check-in)
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setHours(14, 0, 0, 0); // 2PM check-in time
        const now = new Date();
        const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        let isLateCancellation = false;
        let isVeryLateCancellation = false;
        let refundAmount = 0;
        const bookingFee = Number(booking.bookingFee) || 0;

        // Cancellation policy:
        // - > 24 hours before check-in: Full refund
        // - 2-24 hours before check-in: Forfeit 20% advance, refund excess
        // - < 2 hours before check-in: ALL forfeited (no refund)
        isLateCancellation = hoursUntilCheckIn < 24;
        isVeryLateCancellation = hoursUntilCheckIn < 2;

        // Handle refund for partial payment bookings
        const walletAmountUsed = Number(booking.walletAmountUsed) || 0;
        const advanceAmount = Number(booking.amountDueNow) || 0;

        if (booking.bookingFeeStatus === "PAID" && (bookingFee > 0 || walletAmountUsed > 0)) {
            if (isVeryLateCancellation) {
                // Very late cancellation (< 2 hours): ALL forfeited, no refund
                refundAmount = 0;
            } else if (!isLateCancellation) {
                // Early cancellation (> 24 hours): Full refund of wallet amount used
                refundAmount = walletAmountUsed > 0 ? walletAmountUsed : bookingFee;

                const wallet = await db.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet && refundAmount > 0) {
                    // Credit wallet
                    await db
                        .update(wallets)
                        .set({
                            balance: (Number(wallet.balance) + refundAmount).toString(),
                            updatedAt: new Date(),
                        })
                        .where(eq(wallets.id, wallet.id));

                    // Record refund transaction
                    await db.insert(walletTransactions).values({
                        walletId: wallet.id,
                        type: "CREDIT",
                        amount: refundAmount.toString(),
                        reason: "REFUND",
                        bookingId: booking.id,
                        description: `Booking cancellation refund`,
                    });
                }
            } else if (walletAmountUsed > advanceAmount) {
                // Late cancellation (2-24 hours): Forfeit 20% advance, refund excess wallet balance
                refundAmount = walletAmountUsed - advanceAmount;

                const wallet = await db.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet && refundAmount > 0) {
                    // Credit excess back to wallet
                    await db
                        .update(wallets)
                        .set({
                            balance: (Number(wallet.balance) + refundAmount).toString(),
                            updatedAt: new Date(),
                        })
                        .where(eq(wallets.id, wallet.id));

                    // Record partial refund transaction
                    await db.insert(walletTransactions).values({
                        walletId: wallet.id,
                        type: "CREDIT",
                        amount: refundAmount.toString(),
                        reason: "REFUND",
                        bookingId: booking.id,
                        description: `Partial refund (20% advance forfeited)`,
                    });
                }
            }
            // If walletAmountUsed <= advanceAmount and 2-24h late cancellation, no refund (20% forfeited)
        }

        // Update booking status
        await db
            .update(bookings)
            .set({
                status: "CANCELLED",
                cancellationReason: reason,
                cancelledAt: new Date(),
                refundAmount: refundAmount > 0 ? refundAmount.toString() : null,
            })
            .where(eq(bookings.id, bookingId));

        revalidatePath("/bookings");
        revalidatePath("/wallet");

        // Send cancellation notification
        sendBookingCancellation(
            userId,
            { id: booking.id, guestName: booking.guestName },
            refundAmount > 0 ? refundAmount : undefined
        ).catch((err) => console.error("Failed to send cancellation notification:", err));

        // Push realtime event to partner dashboard
        pushRealtimeEvent({
            type: "BOOKING_CANCELLED",
            hotelId: booking.hotelId,
            data: {
                bookingId: booking.id,
                guestName: booking.guestName,
                refundAmount,
            },
        }).catch((err) => console.error("Failed to push realtime event:", err));

        return {
            success: true,
            refundAmount: refundAmount > 0 ? refundAmount : undefined,
            isLate: isLateCancellation,
        };
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return { success: false, error: "Failed to cancel booking" };
    }
}

/**
 * Get cancellation policy info for a booking
 * Used by UI to show what will happen if user cancels
 */
export async function getCancellationInfo(bookingId: string, userId: string) {
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking || booking.userId !== userId) {
            return null;
        }

        const checkInDate = new Date(booking.checkIn);
        checkInDate.setHours(14, 0, 0, 0);
        const now = new Date();
        const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const bookingFee = Number(booking.bookingFee) || 0;
        const walletAmountUsed = Number(booking.walletAmountUsed) || 0;
        const advanceAmount = Number(booking.amountDueNow) || 0;
        const amountPaid = walletAmountUsed > 0 ? walletAmountUsed : bookingFee;

        // 3-tier cancellation policy
        const isVeryLate = hoursUntilCheckIn < 2;
        const isLate = hoursUntilCheckIn < 24;
        const advanceLabel = booking.paymentStatus === "PAY_AT_HOTEL" ? "advance payment" : "booking fee";

        let penalty: string | null = null;
        let refund = 0;

        if (isVeryLate) {
            // < 2 hours: All forfeited
            penalty = `৳${amountPaid} will be forfeited (less than 2 hours before check-in)`;
            refund = 0;
        } else if (isLate) {
            // 2-24 hours: Forfeit 20% advance, refund excess
            const forfeitAmount = Math.min(advanceAmount, amountPaid);
            refund = Math.max(0, amountPaid - advanceAmount);
            penalty = `৳${forfeitAmount} ${advanceLabel} will be forfeited`;
        } else {
            // > 24 hours: Full refund
            refund = amountPaid;
        }

        return {
            type: "ADVANCE_PAYMENT" as const,
            isLate,
            isVeryLate,
            hoursRemaining: Math.max(0, hoursUntilCheckIn),
            penalty,
            refund,
        };
    } catch (error) {
        console.error("Error getting cancellation info:", error);
        return null;
    }
}
