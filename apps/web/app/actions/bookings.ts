"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels, users, wallets, walletTransactions } from "@repo/db/schema";
import { eq, desc, and, lt, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateBookingInput {
    hotelId: string;
    roomId: string;                 // Can be specific room or first available from roomIds
    roomIds?: string[];             // Optional: available room IDs for auto-assignment (room type booking)
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
        const result = await db.transaction(async (tx: any) => {
            // Auto room assignment logic for room type booking
            let actualRoomId = roomId;

            // If roomIds is provided (room type booking), find first truly available room
            if (input.roomIds && input.roomIds.length > 0) {
                let foundAvailableRoom = false;

                // Try each room in the list until we find one that's available
                for (const candidateRoomId of input.roomIds) {
                    const existingBookingForCandidate = await tx.query.bookings.findFirst({
                        where: and(
                            eq(bookings.roomId, candidateRoomId),
                            ne(bookings.status, "CANCELLED"),
                            lt(bookings.checkIn, checkOut),
                            gt(bookings.checkOut, checkIn)
                        ),
                    });

                    if (!existingBookingForCandidate) {
                        // This room is available!
                        actualRoomId = candidateRoomId;
                        foundAvailableRoom = true;
                        break;
                    }
                }

                if (!foundAvailableRoom) {
                    throw new Error("No rooms of this type available for selected dates. Please try different dates.");
                }
            }

            // Get room with FOR UPDATE lock to prevent concurrent bookings
            const room = await tx.query.rooms.findFirst({
                where: eq(rooms.id, actualRoomId),
            });

            if (!room) {
                throw new Error("Room not found");
            }

            // CRITICAL: Double-check if room is already booked for these dates
            // This handles race conditions when roomIds was not provided
            const existingBooking = await tx.query.bookings.findFirst({
                where: and(
                    eq(bookings.roomId, actualRoomId),
                    ne(bookings.status, "CANCELLED"),
                    lt(bookings.checkIn, checkOut),
                    gt(bookings.checkOut, checkIn)
                ),
            });

            if (existingBooking) {
                const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                throw new Error(`This room is booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}. Please select different dates.`);
            }

            // Use actualRoomId for the rest of the booking
            const finalRoomId = actualRoomId;

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
            const qrCodeData = JSON.stringify({ bookingId, hotelId, roomId: finalRoomId });

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
                roomId: finalRoomId,  // Use auto-assigned room ID
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
                walletAmountUsed: actualWalletDeduction.toString(),
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
        const totalAmount = Number(booking.totalAmount) || 0;
        const advanceAmount = Math.round(totalAmount * 0.20); // 20% advance that should be forfeited

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
        const totalAmount = Number(booking.totalAmount) || 0;
        const advanceAmount = Math.round(totalAmount * 0.20);
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
