import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
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
            // Determine if this was an advance payment (20%) or full payment
            const paidAmount = Number(result.data.amount || 0);
            const totalAmount = Number(booking.totalAmount);
            const isAdvancePayment = paidAmount < totalAmount;

            // Update booking with payment info
            await db
                .update(bookings)
                .set({
                    // For advance payment (Pay at Hotel), keep PAY_AT_HOTEL status
                    // For full payment, set to PAID
                    paymentStatus: isAdvancePayment ? "PAY_AT_HOTEL" : "PAID",
                    status: "CONFIRMED",
                    bookingFeeStatus: "PAID",
                    paymentMethod: isAdvancePayment ? "PAY_AT_HOTEL" : "BKASH",
                    paymentReference: result.data.trxID || paymentID,
                    expiresAt: null, // Clear expiry since payment is done
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));

            console.log("Payment successful for booking:", booking.id, isAdvancePayment ? "(advance)" : "(full)");
            return NextResponse.redirect(
                new URL(`/booking/confirmation/${booking.id}`, request.url)
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
