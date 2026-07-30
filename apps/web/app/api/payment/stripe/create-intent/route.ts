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
        if (booking.status === "CANCELLED" || booking.paymentStatus === "PAID") {
            return NextResponse.json(
                { success: false, error: "Booking cannot accept another payment" },
                { status: 409 },
            );
        }

        const amountDueMinor = parseMoneyToMinor(
            booking.amountDueNow,
            "Booking amount due now",
        );
        const walletUsedMinor = parseMoneyToMinor(
            booking.walletAmountUsed ?? "0",
            "Booking wallet amount",
        );
        const amountOutstandingMinor = amountDueMinor - walletUsedMinor;
        if (amountOutstandingMinor <= 0) {
            return NextResponse.json(
                { success: false, error: "No payment is outstanding" },
                { status: 409 },
            );
        }

        const currency = booking.currency.toLowerCase();
        const paymentIntent = await getStripe().paymentIntents.create({
            amount: amountOutstandingMinor,
            currency,
            metadata: {
                bookingId: booking.id,
                hotelId: booking.hotelId,
                userId,
                pricingVersion: booking.pricingVersion,
                amountOutstandingMinor: String(amountOutstandingMinor),
                currency: booking.currency,
            },
            automatic_payment_methods: { enabled: true },
        });

        await db
            .update(bookings)
            .set({
                paymentReference: paymentIntent.id,
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, booking.id));

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: amountOutstandingMinor / 100,
            currency: booking.currency,
        });
    } catch (error: unknown) {
        console.error("Stripe payment-intent creation failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode || 400 },
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to create payment intent" },
            { status: 500 },
        );
    }
}
