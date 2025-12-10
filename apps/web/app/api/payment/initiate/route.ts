import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { createBkashPayment } from "@repo/config/payment";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json(
                { success: false, error: "Booking ID is required" },
                { status: 400 }
            );
        }

        // Get booking details
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: {
                hotel: true,
                room: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found" },
                { status: 404 }
            );
        }

        if (booking.paymentStatus === "PAID") {
            return NextResponse.json(
                { success: false, error: "Booking is already paid" },
                { status: 400 }
            );
        }

        // Create bKash payment
        const result = await createBkashPayment({
            bookingId: booking.id,
            totalAmount: Number(booking.totalAmount),
            customerName: booking.guestName,
            customerEmail: booking.guestEmail || undefined,
            customerPhone: booking.guestPhone,
            productName: `Hotel Booking - ${booking.hotel?.name || "Hotel"}`,
        });

        if (result.success && result.bkashURL) {
            // Store payment ID in booking for later verification
            await db
                .update(bookings)
                .set({
                    paymentReference: result.paymentID,
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, bookingId));

            return NextResponse.json({
                success: true,
                redirectUrl: result.bkashURL,
                paymentID: result.paymentID,
            });
        }

        return NextResponse.json(
            { success: false, error: result.error || "Failed to initiate payment" },
            { status: 500 }
        );
    } catch (error) {
        console.error("Payment initiation error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
    }
}
