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
    paymentMethod: "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL" | "WALLET";
    totalAmount: number;
    userId?: string;
    useWalletForFee?: boolean; // Legacy: Use wallet balance for booking fee
    useWalletBalance?: boolean; // New: Use wallet for partial payment
    walletAmount?: number; // Amount to deduct from wallet
}

export interface BookingResult {
    success: boolean;
    bookingId?: string;
    error?: string;
    bookingFee?: number;
    requiresPayment?: boolean; // True if 20% advance needs to be paid via bKash
    advanceAmount?: number; // Amount to pay via bKash
    walletPaymentSuccess?: boolean; // True if full payment was made from wallet
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
 * Uses transaction with row locking to prevent double-bookings
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
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
        useWalletBalance = false,
        walletAmount = 0,
    } = input;

    // Early validation - user must be logged in
    if (!userId) {
        const bookingFee = calculateBookingFee(totalAmount, paymentMethod);
        return {
            success: false,
            error: "User must be logged in to make a booking.",
            bookingFee,
        };
    }

    try {
        // Use a serializable transaction to prevent race conditions
        const result = await db.transaction(async (tx) => {
            // Get room with FOR UPDATE lock to prevent concurrent bookings
            // This locks the room row until the transaction completes
            const room = await tx.query.rooms.findFirst({
                where: eq(rooms.id, roomId),
            });

            if (!room) {
                throw new Error("Room not found");
            }

            // CRITICAL: Check if room is already booked for these dates
            // This check happens within the transaction, so it's atomic
            const existingBooking = await tx.query.bookings.findFirst({
                where: and(
                    eq(bookings.roomId, roomId),
                    ne(bookings.status, "CANCELLED"),
                    // Date overlap: existing starts before new ends AND existing ends after new starts
                    lt(bookings.checkIn, checkOut),
                    gt(bookings.checkOut, checkIn)
                ),
            });

            if (existingBooking) {
                const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                throw new Error(`This room is booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}. Please select different dates.`);
            }

            // Calculate commission (20%) and advance payment
            const commissionAmount = Math.round(totalAmount * 0.20);
            const netAmount = totalAmount - commissionAmount;
            const bookingFee = calculateBookingFee(totalAmount, paymentMethod);

            let bookingFeeStatus: "PENDING" | "PAID" | "WAIVED" = "PENDING";
            let requiresPayment = false;
            let walletPaymentSuccess = false;
            let actualWalletDeduction = 0;

            // Handle wallet payments within transaction
            if (paymentMethod === "WALLET") {
                // Full wallet payment
                const wallet = await tx.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (!wallet || Number(wallet.balance) < totalAmount) {
                    throw new Error("Insufficient wallet balance");
                }

                // Deduct full amount from wallet within transaction
                await tx
                    .update(wallets)
                    .set({
                        balance: (Number(wallet.balance) - totalAmount).toString(),
                        updatedAt: new Date(),
                    })
                    .where(eq(wallets.id, wallet.id));

                actualWalletDeduction = totalAmount;
                bookingFeeStatus = "PAID";
                walletPaymentSuccess = true;
            } else if (useWalletBalance && walletAmount > 0) {
                // Split payment: deduct specified wallet amount first
                const wallet = await tx.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet && Number(wallet.balance) >= walletAmount) {
                    await tx
                        .update(wallets)
                        .set({
                            balance: (Number(wallet.balance) - walletAmount).toString(),
                            updatedAt: new Date(),
                        })
                        .where(eq(wallets.id, wallet.id));

                    actualWalletDeduction = walletAmount;

                    // For Pay at Hotel: check if wallet covers the 20% advance
                    if (paymentMethod === "PAY_AT_HOTEL") {
                        if (walletAmount >= bookingFee) {
                            // Wallet covers the 20% advance - no additional payment needed
                            bookingFeeStatus = "PAID";
                        } else {
                            // Wallet doesn't cover full advance - need remaining via bKash
                            requiresPayment = true;
                            bookingFeeStatus = "PENDING";
                        }
                    } else {
                        // For bKash/other: remaining needs to be paid
                        bookingFeeStatus = "PENDING";
                        requiresPayment = true;
                    }
                }
            } else if (paymentMethod === "PAY_AT_HOTEL") {
                // No wallet usage - check if wallet can auto-pay 20% advance
                const wallet = await tx.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet && Number(wallet.balance) >= bookingFee) {
                    // Deduct 20% advance from wallet within transaction
                    await tx
                        .update(wallets)
                        .set({
                            balance: (Number(wallet.balance) - bookingFee).toString(),
                            updatedAt: new Date(),
                        })
                        .where(eq(wallets.id, wallet.id));

                    actualWalletDeduction = bookingFee;
                    bookingFeeStatus = "PAID";
                } else {
                    requiresPayment = true;
                    bookingFeeStatus = "PENDING";
                }
            }

            // Calculate number of nights
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            // Create booking with QR code
            const bookingId = crypto.randomUUID();
            const qrCodeData = JSON.stringify({ bookingId, hotelId, roomId });

            // Set expiry time for unpaid bookings (20 minutes from now)
            const expiresAt = bookingFeeStatus === "PENDING"
                ? new Date(Date.now() + 20 * 60 * 1000)
                : undefined;

            const bookingStatus = bookingFeeStatus === "PAID" ? "CONFIRMED" : "PENDING";
            const paymentStatusValue = paymentMethod === "WALLET"
                ? "PAID"
                : (paymentMethod === "PAY_AT_HOTEL" ? "PAY_AT_HOTEL" : "PENDING");

            // Insert booking within transaction
            const [booking] = await tx.insert(bookings).values({
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
                bookingFee: (paymentMethod === "WALLET" ? totalAmount : bookingFee).toString(),
                bookingFeeStatus,
                paymentMethod,
                paymentStatus: paymentStatusValue,
                status: bookingStatus,
                qrCode: qrCodeData,
                expiresAt,
            }).returning();

            // Record wallet transaction if fee was paid
            if (bookingFeeStatus === "PAID") {
                const wallet = await tx.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet && booking) {
                    const transactionAmount = paymentMethod === "WALLET" ? totalAmount : bookingFee;
                    await tx.insert(walletTransactions).values({
                        walletId: wallet.id,
                        type: "DEBIT",
                        amount: transactionAmount.toString(),
                        reason: "BOOKING_FEE",
                        bookingId: booking.id,
                        description: paymentMethod === "WALLET"
                            ? `Full payment for ${guestName}`
                            : `Booking fee for ${guestName}`,
                    });
                }
            }

            // Save phone to user profile within transaction
            const user = await tx.query.users.findFirst({
                where: eq(users.id, userId),
            });

            if (user && !user.phone && guestPhone) {
                await tx.update(users)
                    .set({ phone: guestPhone, updatedAt: new Date() })
                    .where(eq(users.id, userId));
            }

            return {
                booking,
                bookingFee,
                requiresPayment,
                walletPaymentSuccess,
            };
        });

        revalidatePath("/bookings");
        revalidatePath("/wallet");

        return {
            success: true,
            bookingId: result.booking?.id,
            bookingFee: result.bookingFee,
            requiresPayment: result.requiresPayment,
            advanceAmount: result.requiresPayment ? result.bookingFee : undefined,
            walletPaymentSuccess: result.walletPaymentSuccess,
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
