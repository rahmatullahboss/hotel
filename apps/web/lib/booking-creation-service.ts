import { db } from "@repo/db";
import {
    bookings,
    users,
    wallets,
    walletTransactions,
} from "@repo/db/schema";
import { eq, and, lt, gt, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { pushRealtimeEvent } from "@/lib/realtime";
import {
    BOOKING_CURRENCY,
    BOOKING_PRICING_VERSION,
    formatMinor,
    isCustomerPaymentMethod,
    parseMoneyToMinor,
    type BookingCalculationBreakdown,
    type CustomerPaymentMethod,
} from "@/lib/booking-calculation";
import {
    calculateAuthoritativeBooking,
    type BookingSource,
} from "@/lib/booking-pricing-service";

export interface CreateBookingInput {
    hotelId: string;
    roomId: string;
    roomIds?: string[];
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    guestCount?: number;
    checkIn: string;
    checkOut: string;
    paymentMethod: CustomerPaymentMethod;
    useWalletForFee?: boolean;
    useWalletBalance?: boolean;
    walletAmount?: number | string;
}

export interface BookingResult {
    success: boolean;
    bookingId?: string;
    error?: string;
    bookingFee?: number;
    requiresPayment?: boolean;
    advanceAmount?: number;
    walletPaymentSuccess?: boolean;
    totalAmount?: number;
    amountDueNow?: number;
    walletAmountUsed?: number;
    amountOutstanding?: number;
    currency?: string;
    calculation?: BookingCalculationBreakdown;
}

/**
 * Create a customer booking from server-owned room/date pricing and policy.
 * Request-body totals are intentionally absent from the input contract.
 */
export interface CreateBookingContext {
    userId: string;
    source: BookingSource;
}

export async function createBookingForUser(
    input: CreateBookingInput,
    context: CreateBookingContext,
): Promise<BookingResult> {
    const {
        hotelId,
        roomId,
        guestName,
        guestPhone,
        guestEmail,
        guestCount = 1,
        checkIn,
        checkOut,
        paymentMethod,
        useWalletBalance = input.useWalletForFee ?? false,
        walletAmount,
    } = input;
    const { userId, source } = context;

    if (!hotelId || !roomId || !userId) {
        return { success: false, error: "Booking identity and room are required." };
    }
    if (!isCustomerPaymentMethod(paymentMethod)) {
        return { success: false, error: "Unsupported payment method." };
    }
    if (!guestName.trim() || !guestPhone.trim()) {
        return { success: false, error: "Guest name and phone are required." };
    }
    if (!Number.isSafeInteger(guestCount) || guestCount < 1 || guestCount > 20) {
        return { success: false, error: "Guest count must be between 1 and 20." };
    }

    try {
        const result = await db.transaction(async (tx: typeof db) => {
            let actualRoomId = roomId;

            if (input.roomIds && input.roomIds.length > 0) {
                let foundAvailableRoom = false;
                for (const candidateRoomId of [...new Set(input.roomIds)]) {
                    const existingBookingForCandidate = await tx.query.bookings.findFirst({
                        where: and(
                            eq(bookings.roomId, candidateRoomId),
                            ne(bookings.status, "CANCELLED"),
                            lt(bookings.checkIn, checkOut),
                            gt(bookings.checkOut, checkIn),
                        ),
                    });
                    if (!existingBookingForCandidate) {
                        actualRoomId = candidateRoomId;
                        foundAvailableRoom = true;
                        break;
                    }
                }
                if (!foundAvailableRoom) {
                    throw new Error(
                        "No rooms of this type are available for the selected dates.",
                    );
                }
            }

            const existingBooking = await tx.query.bookings.findFirst({
                where: and(
                    eq(bookings.roomId, actualRoomId),
                    ne(bookings.status, "CANCELLED"),
                    lt(bookings.checkIn, checkOut),
                    gt(bookings.checkOut, checkIn),
                ),
            });
            if (existingBooking) {
                throw new Error("This room is already booked for the selected dates.");
            }

            await tx.execute(
                sql`select pg_advisory_xact_lock(hashtextextended(${`booking-wallet:${userId}`}, 0))`,
            );
            const wallet = await tx.query.wallets.findFirst({
                where: eq(wallets.userId, userId),
            });

            const authoritative = await calculateAuthoritativeBooking(tx, {
                hotelId,
                roomId: actualRoomId,
                userId,
                checkIn,
                checkOut,
                paymentMethod,
                source,
                walletBalance: wallet?.balance ?? "0",
                useWalletBalance,
                requestedWalletAmount: walletAmount,
            });
            const calculation = authoritative.calculation;

            if (calculation.walletAmountUsedMinor > 0) {
                if (!wallet) {
                    throw new Error("Wallet not found");
                }
                const currentBalanceMinor = parseMoneyToMinor(wallet.balance, "Wallet balance");
                if (currentBalanceMinor < calculation.walletAmountUsedMinor) {
                    throw new Error("Insufficient wallet balance");
                }
                await tx
                    .update(wallets)
                    .set({
                        balance: formatMinor(
                            currentBalanceMinor - calculation.walletAmountUsedMinor,
                        ),
                        updatedAt: new Date(),
                    })
                    .where(eq(wallets.id, wallet.id));
            }

            const bookingFeeStatus = calculation.requiresPayment ? "PENDING" : "PAID";
            const bookingStatus = calculation.requiresPayment ? "PENDING" : "CONFIRMED";
            const paymentStatus =
                paymentMethod === "PAY_AT_HOTEL"
                    ? "PAY_AT_HOTEL"
                    : calculation.requiresPayment
                      ? "PENDING"
                      : "PAID";
            const expiresAt = calculation.requiresPayment
                ? new Date(Date.now() + 20 * 60 * 1000)
                : null;

            const bookingId = crypto.randomUUID();
            const qrCode = JSON.stringify({
                bookingId,
                hotelId,
                roomId: actualRoomId,
            });

            const [booking] = await tx
                .insert(bookings)
                .values({
                    id: bookingId,
                    hotelId,
                    roomId: actualRoomId,
                    userId,
                    guestName: guestName.trim(),
                    guestPhone: guestPhone.trim(),
                    guestEmail: guestEmail?.trim() || undefined,
                    guestCount,
                    checkIn,
                    checkOut,
                    numberOfNights: authoritative.numberOfNights,
                    bookingSource: "PLATFORM",
                    pricingVersion: BOOKING_PRICING_VERSION,
                    currency: BOOKING_CURRENCY,
                    roomSubtotal: formatMinor(calculation.roomSubtotalMinor),
                    discountAmount: formatMinor(calculation.discountAmountMinor),
                    taxRate: calculation.breakdown.taxRate,
                    taxAmount: formatMinor(calculation.taxAmountMinor),
                    commissionRate: calculation.breakdown.commissionRate,
                    amountDueNow: formatMinor(calculation.amountDueNowMinor),
                    pricingBreakdown: calculation.breakdown,
                    totalAmount: formatMinor(calculation.totalAmountMinor),
                    commissionAmount: formatMinor(calculation.commissionAmountMinor),
                    netAmount: formatMinor(calculation.netAmountMinor),
                    commissionStatus: calculation.requiresPayment ? "PENDING" : "PAID",
                    bookingFee: formatMinor(calculation.amountDueNowMinor),
                    bookingFeeStatus,
                    paymentMethod,
                    paymentStatus,
                    status: bookingStatus,
                    qrCode,
                    expiresAt,
                    walletAmountUsed: formatMinor(calculation.walletAmountUsedMinor),
                })
                .returning();

            if (!booking) {
                throw new Error("Booking insert returned no record");
            }

            if (calculation.walletAmountUsedMinor > 0 && wallet) {
                await tx.insert(walletTransactions).values({
                    walletId: wallet.id,
                    type: "DEBIT",
                    amount: formatMinor(calculation.walletAmountUsedMinor),
                    reason: "BOOKING_FEE",
                    bookingId: booking.id,
                    description:
                        paymentMethod === "WALLET"
                            ? `Authoritative full booking payment for ${guestName.trim()}`
                            : `Authoritative booking payment allocation for ${guestName.trim()}`,
                });
            }

            const user = await tx.query.users.findFirst({
                where: eq(users.id, userId),
            });
            if (user && !user.phone && guestPhone.trim()) {
                await tx
                    .update(users)
                    .set({ phone: guestPhone.trim(), updatedAt: new Date() })
                    .where(eq(users.id, userId));
            }

            return {
                booking,
                hotelName: authoritative.hotel.name,
                calculation,
            };
        });

        revalidatePath("/bookings");
        revalidatePath("/wallet");

        const checkInDate = new Date(`${checkIn}T00:00:00.000Z`).toLocaleDateString(
            "en-GB",
            { day: "numeric", month: "short", timeZone: "UTC" },
        );
        const title = result.calculation.requiresPayment
            ? "🏨 Booking Created!"
            : "🎉 Booking Confirmed!";
        const body = result.calculation.requiresPayment
            ? `${result.hotelName} is held for ${checkInDate}. Complete the authoritative payment to confirm.`
            : `${result.hotelName} is confirmed for ${checkInDate}. See you soon!`;

        import("@/lib/notifications").then(({ sendPushNotification }) => {
            sendPushNotification(userId, {
                title,
                body,
                data: {
                    type: result.calculation.requiresPayment
                        ? "BOOKING_PENDING"
                        : "BOOKING_CONFIRMED",
                    bookingId: result.booking.id,
                },
            }).catch((error) =>
                console.error("Failed to send booking notification", {
                    reason: error instanceof Error ? error.name : "UnknownError",
                }),
            );
        });

        pushRealtimeEvent({
            type: "NEW_BOOKING",
            hotelId,
            data: {
                bookingId: result.booking.id,
                guestName: guestName.trim(),
                checkIn,
                checkOut,
                totalAmount: Number(result.booking.totalAmount),
                status: result.booking.status,
            },
        }).catch((error) =>
            console.error("Failed to push realtime event", {
                reason: error instanceof Error ? error.name : "UnknownError",
            }),
        );

        return {
            success: true,
            bookingId: result.booking.id,
            bookingFee: Number(result.booking.bookingFee),
            requiresPayment: result.calculation.requiresPayment,
            advanceAmount: result.calculation.requiresPayment
                ? result.calculation.amountOutstandingMinor / 100
                : undefined,
            walletPaymentSuccess: result.calculation.walletPaymentSuccess,
            totalAmount: result.calculation.totalAmountMinor / 100,
            amountDueNow: result.calculation.amountDueNowMinor / 100,
            walletAmountUsed: result.calculation.walletAmountUsedMinor / 100,
            amountOutstanding: result.calculation.amountOutstandingMinor / 100,
            currency: BOOKING_CURRENCY,
            calculation: result.calculation.breakdown,
        };
    } catch (error) {
        console.error("Error creating booking", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create booking",
        };
    }
}

