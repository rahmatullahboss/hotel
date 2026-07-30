import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings, wallets, walletTransactions } from "@repo/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseMoneyToMinor } from "@/lib/booking-calculation";
import { executeBkashPayment } from "@repo/config/payment";

/**
 * bKash Callback Handler
 * User is redirected here after interacting with bKash
 */
export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const paymentID = url.searchParams.get("paymentID");
        const status = url.searchParams.get("status");

        console.log("bKash callback received:", { paymentID, status });

        if (!paymentID) {
            return NextResponse.redirect(new URL("/booking/failed?error=no_payment_id", request.url));
        }

        // Find booking by payment reference
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.paymentReference, paymentID),
        });

        if (!booking) {
            // Check if this is a wallet top-up transaction
            // We need to execute payment first to get the merchantInvoiceNumber
            console.log("Booking not found, checking if wallet transaction...");

            if (status === "success") {
                const result = await executeBkashPayment(paymentID);

                if (result.success && result.data && result.data.merchantInvoiceNumber?.startsWith("WALLET-")) {
                    const invoiceId = result.data.merchantInvoiceNumber;
                    // Format: WALLET-{userId}-{timestamp}
                    const parts = invoiceId.split("-");
                    const userId = parts[1]; // Full UUID

                    if (!userId) {
                        console.error("Invalid wallet invoice format:", invoiceId);
                        return NextResponse.redirect(new URL("/booking/failed?error=invalid_wallet_invoice", request.url));
                    }

                    const amount = Number(result.data.amount || 0);

                    // database transaction to ensure consistency
                    await db.transaction(async (tx: any) => {
                        // 1. Get or create wallet
                        let wallet = await tx.query.wallets.findFirst({
                            where: eq(wallets.userId, userId),
                        });

                        if (!wallet) {
                            const [newWallet] = await tx
                                .insert(wallets)
                                .values({ userId, balance: "0" })
                                .returning();
                            wallet = newWallet!;
                        }

                        // 2. Update wallet balance
                        await tx
                            .update(wallets)
                            .set({
                                balance: sql`${wallets.balance} + ${amount}`,
                                updatedAt: new Date(),
                            })
                            .where(eq(wallets.id, wallet.id));

                        // 3. Create wallet transaction record
                        await tx.insert(walletTransactions).values({
                            walletId: wallet.id,
                            type: "CREDIT",
                            amount: amount.toString(),
                            reason: "TOP_UP",
                            description: `bKash Top-up (${result.data?.trxID || paymentID})`,
                        });
                    });

                    console.log("Wallet top-up successful for user:", userId, "Amount:", amount);

                    // Redirect to wallet page or generic success
                    return NextResponse.redirect(
                        new URL(`/admin/wallet?success=true&amount=${amount}`, request.url)
                        // Note: Since this is mobile-first, the mobile app should handle the deep link or refresh.
                        // But for web callback, we need a valid URL.
                        // Ideally, we redirect to a static success page that the InAppBrowser can close.
                    );
                }
            }

            console.error("Booking not found for paymentID:", paymentID);
            return NextResponse.redirect(new URL("/booking/failed?error=booking_not_found", request.url));
        }

        // Check status from callback
        if (status === "cancel") {
            return NextResponse.redirect(
                new URL(`/booking/payment?bookingId=${booking.id}&cancelled=true`, request.url)
            );
        }

        if (status === "failure") {
            return NextResponse.redirect(
                new URL(`/booking/payment?bookingId=${booking.id}&error=payment_failed`, request.url)
            );
        }

        // Execute the payment (status === "success")
        const result = await executeBkashPayment(paymentID);

        if (result.success && result.data) {
            const paidAmountMinor = parseMoneyToMinor(
                result.data.amount || "0",
                "bKash paid amount",
            );
            const expectedAmountMinor =
                parseMoneyToMinor(booking.amountDueNow, "Booking amount due now") -
                parseMoneyToMinor(
                    booking.walletAmountUsed ?? "0",
                    "Booking wallet amount",
                );

            if (paidAmountMinor !== expectedAmountMinor) {
                console.error("bKash amount does not match booking calculation", {
                    bookingId: booking.id,
                    expectedAmountMinor,
                    paidAmountMinor,
                });
                return NextResponse.redirect(
                    new URL(`/booking/payment?bookingId=${booking.id}&error=amount_mismatch`, request.url),
                );
            }

            const payAtHotel = booking.paymentMethod === "PAY_AT_HOTEL";
            await db
                .update(bookings)
                .set({
                    paymentStatus: payAtHotel ? "PAY_AT_HOTEL" : "PAID",
                    status: "CONFIRMED",
                    bookingFeeStatus: "PAID",
                    commissionStatus: "PAID",
                    paymentReference: result.data.trxID || paymentID,
                    expiresAt: null,
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));

            console.info("Booking payment matched authoritative calculation", {
                bookingId: booking.id,
                paymentMode: payAtHotel ? "deposit" : "full",
            });
            return NextResponse.redirect(
                new URL(`/booking/confirmation/${booking.id}`, request.url),
            );
        }

        // Payment execution failed
        console.error("Payment execution failed:", result.error);
        return NextResponse.redirect(
            new URL(`/booking/payment?bookingId=${booking.id}&error=${encodeURIComponent(result.error || "execution_failed")}`, request.url)
        );
    } catch (error) {
        console.error("bKash callback error:", error);
        return NextResponse.redirect(new URL("/booking/failed?error=internal_error", request.url));
    }
}
