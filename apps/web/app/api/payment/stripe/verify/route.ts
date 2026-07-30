import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { parseMoneyToMinor } from "@/lib/booking-calculation";

export const dynamic = "force-dynamic";

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 },
            );
        }

        const body = (await request.json()) as { paymentIntentId?: unknown };
        const paymentIntentId =
            typeof body.paymentIntentId === "string" ? body.paymentIntentId : "";
        if (!paymentIntentId) {
            return NextResponse.json(
                { success: false, error: "Payment Intent ID is required" },
                { status: 400 },
            );
        }

        const paymentIntent = await getStripe().paymentIntents.retrieve(
            paymentIntentId,
        );
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.paymentReference, paymentIntentId),
        });
        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found for this payment" },
                { status: 404 },
            );
        }
        if (booking.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "You do not own this booking" },
                { status: 403 },
            );
        }

        const expectedAmountMinor =
            parseMoneyToMinor(booking.amountDueNow, "Booking amount due now") -
            parseMoneyToMinor(booking.walletAmountUsed ?? "0", "Booking wallet amount");
        if (
            paymentIntent.metadata.bookingId !== booking.id ||
            paymentIntent.currency.toUpperCase() !== booking.currency ||
            paymentIntent.amount !== expectedAmountMinor
        ) {
            return NextResponse.json(
                { success: false, error: "Payment does not match the booking calculation" },
                { status: 409 },
            );
        }

        if (paymentIntent.status === "succeeded") {
            const paymentStatus =
                booking.paymentMethod === "PAY_AT_HOTEL" ? "PAY_AT_HOTEL" : "PAID";
            await db
                .update(bookings)
                .set({
                    paymentStatus,
                    bookingFeeStatus: "PAID",
                    commissionStatus: "PAID",
                    status: "CONFIRMED",
                    expiresAt: null,
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));

            return NextResponse.json({
                success: true,
                status: "succeeded",
                bookingId: booking.id,
                message: "Payment verified and booking confirmed",
            });
        }

        if (paymentIntent.status === "processing") {
            return NextResponse.json({
                success: true,
                status: "processing",
                bookingId: booking.id,
                message: "Payment is being processed",
            });
        }

        return NextResponse.json(
            {
                success: false,
                status: paymentIntent.status,
                error: "Payment has not succeeded",
            },
            { status: 409 },
        );
    } catch (error: unknown) {
        console.error("Stripe payment verification failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode || 500 },
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to verify payment" },
            { status: 500 },
        );
    }
}
