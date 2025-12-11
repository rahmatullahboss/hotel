"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels, users, wallets, walletTransactions } from "@repo/db/schema";
import { eq, desc, and, lt, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateBookingInput {
    hotelId: string;
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    checkIn: string;
    checkOut: string;
    paymentMethod: "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL";
    totalAmount: number;
    userId?: string;
    useWalletForFee?: boolean; // Use wallet balance for booking fee
}

export interface BookingResult {
    success: boolean;
    bookingId?: string;
    error?: string;
    bookingFee?: number;
    requiresPayment?: boolean; // True if 20% advance needs to be paid via bKash
    advanceAmount?: number; // Amount to pay via bKash
}

/**
 * Calculate advance/booking fee based on payment method
 * - Pay at Hotel: 20% advance (platform's guaranteed revenue)
 * - Online payments (bKash, Nagad, Card): 100% full payment
 */
function calculateBookingFee(totalAmount: number, paymentMethod: string): number {
    if (paymentMethod === "PAY_AT_HOTEL") {
        // 20% advance for Pay at Hotel
        return Math.round(totalAmount * 0.20);
    }
    // Full payment for online methods
    return totalAmount;
}

/**
 * Create a new booking with booking fee
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
    try {
        const {
            hotelId,
            roomId,
            guestName,
            guestPhone,
            guestEmail,
            checkIn,
            checkOut,
            paymentMethod,
            totalAmount,
            userId,
            useWalletForFee,
        } = input;

        // Get room details for commission calculation
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        // CRITICAL: Check if room is already booked for these dates
        // A room is unavailable if there's an existing booking that:
        // - Is for the same room
        // - Is not cancelled
        // - Has overlapping dates (strict inequality allows same-day checkout/checkin)
        const existingBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.roomId, roomId),
                ne(bookings.status, "CANCELLED"),
                // Date overlap: existing starts before new ends AND existing ends after new starts
                // Using strict < and > allows back-to-back bookings (checkout 12th, checkin 12th is OK)
                lt(bookings.checkIn, checkOut),
                gt(bookings.checkOut, checkIn)
            ),
        });

        if (existingBooking) {
            // Format dates nicely for error message
            const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            return {
                success: false,
                error: `This room is booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}. Please select different dates.`,
            };
        }

        // Calculate commission (20%) and advance payment
        const commissionAmount = Math.round(totalAmount * 0.20);
        const netAmount = totalAmount - commissionAmount;
        const bookingFee = calculateBookingFee(totalAmount, paymentMethod);

        let bookingFeeStatus: "PENDING" | "PAID" | "WAIVED" = "PENDING";

        // Check if user is logged in
        if (!userId) {
            return {
                success: false,
                error: "User must be logged in to make a booking.",
                bookingFee,
            };
        }

        // For Pay at Hotel: Try wallet first, if not enough, require digital payment
        let requiresPayment = false;
        if (paymentMethod === "PAY_AT_HOTEL") {
            const wallet = await db.query.wallets.findFirst({
                where: eq(wallets.userId, userId),
            });

            if (wallet && Number(wallet.balance) >= bookingFee) {
                // Deduct 20% advance from wallet
                await db
                    .update(wallets)
                    .set({
                        balance: (Number(wallet.balance) - bookingFee).toString(),
                        updatedAt: new Date(),
                    })
                    .where(eq(wallets.id, wallet.id));

                bookingFeeStatus = "PAID";
            } else {
                // Wallet insufficient - need to pay 20% via bKash
                requiresPayment = true;
                bookingFeeStatus = "PENDING";
            }
        }
        // For online payments (bKash, Nagad, Card): Full payment handled by payment gateway

        // Calculate number of nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        // Create booking with QR code
        const bookingId = crypto.randomUUID();
        const qrCodeData = JSON.stringify({ bookingId, hotelId, roomId });

        // Set expiry time for unpaid bookings (20 minutes from now)
        const expiresAt = bookingFeeStatus === "PENDING"
            ? new Date(Date.now() + 20 * 60 * 1000) // 20 minutes
            : undefined;

        // Booking is CONFIRMED only if advance is paid
        const bookingStatus = bookingFeeStatus === "PAID" ? "CONFIRMED" : "PENDING";

        const [booking] = await db.insert(bookings).values({
            id: bookingId,
            hotelId,
            roomId,
            userId: userId ?? undefined,
            guestName,
            guestPhone,
            guestEmail: guestEmail ?? undefined,
            checkIn,
            checkOut,
            numberOfNights: nights,
            totalAmount: totalAmount.toString(),
            commissionAmount: commissionAmount.toString(),
            netAmount: netAmount.toString(),
            bookingFee: bookingFee.toString(),
            bookingFeeStatus,
            paymentMethod,
            paymentStatus: paymentMethod === "PAY_AT_HOTEL" ? "PAY_AT_HOTEL" : "PENDING",
            status: bookingStatus,
            qrCode: qrCodeData,
            expiresAt,
        }).returning();

        // Record wallet transaction if fee was paid
        if (bookingFeeStatus === "PAID" && userId) {
            const wallet = await db.query.wallets.findFirst({
                where: eq(wallets.userId, userId),
            });

            if (wallet && booking) {
                await db.insert(walletTransactions).values({
                    walletId: wallet.id,
                    type: "DEBIT",
                    amount: bookingFee.toString(),
                    reason: "BOOKING_FEE",
                    bookingId: booking.id,
                    description: `Booking fee for ${guestName}`,
                });
            }
        }

        // Save phone to user profile if user is logged in and phone not saved
        if (userId && guestPhone) {
            const user = await db.query.users.findFirst({
                where: eq(users.id, userId),
            });

            if (user && !user.phone) {
                await db.update(users)
                    .set({ phone: guestPhone, updatedAt: new Date() })
                    .where(eq(users.id, userId));
            }
        }

        revalidatePath("/bookings");
        revalidatePath("/wallet");

        return {
            success: true,
            bookingId: booking?.id,
            bookingFee,
            requiresPayment,
            advanceAmount: requiresPayment ? bookingFee : undefined,
        };
    } catch (error) {
        console.error("Error creating booking:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
        return { success: false, error: errorMessage };
    }
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
        let refundAmount = 0;
        const bookingFee = Number(booking.bookingFee) || 0;

        // All bookings now have advance payment
        // Late cancellation: within 24 hours of check-in
        isLateCancellation = hoursUntilCheckIn < 24;

        // Handle refund for partial payment bookings
        if (booking.bookingFeeStatus === "PAID" && bookingFee > 0) {
            if (!isLateCancellation) {
                // Refund to wallet
                refundAmount = bookingFee;

                const wallet = await db.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet) {
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
            }
            // If late, advance payment is forfeited (no refund)
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

        // All bookings now require advance payment
        // Late cancellation: within 24 hours of check-in
        const isLate = hoursUntilCheckIn < 24;
        const advanceLabel = booking.paymentStatus === "PAY_AT_HOTEL" ? "advance payment" : "booking fee";

        return {
            type: "ADVANCE_PAYMENT" as const,
            isLate,
            hoursRemaining: Math.max(0, hoursUntilCheckIn),
            penalty: isLate ? `৳${bookingFee} ${advanceLabel} will be forfeited` : null,
            refund: isLate ? 0 : bookingFee,
        };
    } catch (error) {
        console.error("Error getting cancellation info:", error);
        return null;
    }
}
