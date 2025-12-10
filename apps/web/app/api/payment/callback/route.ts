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
            // Update booking with payment info
            await db
                .update(bookings)
                .set({
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paymentMethod: "bKash",
                    paymentReference: result.data.trxID || paymentID,
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));

            console.log("Payment successful for booking:", booking.id);
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
