import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { createBkashPayment } from "@repo/config/payment";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { formatMinor, parseMoneyToMinor } from "@/lib/booking-calculation";

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as { bookingId?: unknown };
        const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
        if (!bookingId) {
            return NextResponse.json(
                { success: false, error: "Booking ID is required" },
                { status: 400 },
            );
        }

        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: { hotel: true },
        });
        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found" },
                { status: 404 },
            );
        }
        if (booking.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "You do not own this booking" },
                { status: 403 },
            );
        }
        if (
            booking.status === "CANCELLED" ||
            booking.paymentStatus === "PAID" ||
            booking.bookingFeeStatus === "PAID"
        ) {
            return NextResponse.json(
                { success: false, error: "Booking cannot accept another payment" },
                { status: 409 },
            );
        }

        const amountOutstandingMinor =
            parseMoneyToMinor(booking.amountDueNow, "Booking amount due now") -
            parseMoneyToMinor(booking.walletAmountUsed ?? "0", "Booking wallet amount");
        if (amountOutstandingMinor <= 0) {
            return NextResponse.json(
                { success: false, error: "No payment is outstanding" },
                { status: 409 },
            );
        }

        const amountOutstanding = Number(formatMinor(amountOutstandingMinor));
        const result = await createBkashPayment({
            bookingId: booking.id,
            totalAmount: amountOutstanding,
            customerName: booking.guestName,
            customerEmail: booking.guestEmail || undefined,
            customerPhone: booking.guestPhone,
            productName:
                booking.paymentMethod === "PAY_AT_HOTEL"
                    ? `Booking Deposit - ${booking.hotel?.name || "Hotel"}`
                    : `Hotel Booking - ${booking.hotel?.name || "Hotel"}`,
        });

        if (!result.success || !result.bkashURL) {
            return NextResponse.json(
                { success: false, error: result.error || "Failed to initiate payment" },
                { status: 502 },
            );
        }

        await db
            .update(bookings)
            .set({ paymentReference: result.paymentID, updatedAt: new Date() })
            .where(eq(bookings.id, booking.id));

        return NextResponse.json({
            success: true,
            redirectUrl: result.bkashURL,
            paymentID: result.paymentID,
            amount: amountOutstanding,
            currency: booking.currency,
        });
    } catch (error) {
        console.error("Payment initiation failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return NextResponse.json(
            { success: false, error: "Payment initiation is unavailable" },
            { status: 500 },
        );
    }
}
