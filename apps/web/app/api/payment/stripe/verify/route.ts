import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();

        const body = await request.json() as {
            paymentIntentId: string;
        };

        const { paymentIntentId } = body;

        if (!paymentIntentId) {
            return NextResponse.json(
                { success: false, error: "Payment Intent ID is required" },
                { status: 400 }
            );
        }

        // Retrieve payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Find booking by payment reference
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.paymentReference, paymentIntentId),
        });

        if (!booking) {
            return NextResponse.json(
                { success: false, error: "Booking not found for this payment" },
                { status: 404 }
            );
        }

        if (paymentIntent.status === "succeeded") {
            // Update booking to confirmed and paid
            await db
                .update(bookings)
                .set({
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paymentMethod: "STRIPE",
                    expiresAt: null, // Clear expiry
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, booking.id));

            return NextResponse.json({
                success: true,
                status: "succeeded",
                bookingId: booking.id,
                message: "Payment successful and booking confirmed",
            });
        } else if (paymentIntent.status === "processing") {
            return NextResponse.json({
                success: true,
                status: "processing",
                bookingId: booking.id,
                message: "Payment is being processed",
            });
        } else if (paymentIntent.status === "requires_payment_method") {
            return NextResponse.json({
                success: false,
                status: "failed",
                error: "Payment failed. Please try again with a different payment method.",
            });
        } else {
            return NextResponse.json({
                success: false,
                status: paymentIntent.status,
                error: `Payment status: ${paymentIntent.status}`,
            });
        }
    } catch (error: unknown) {
        console.error("Error verifying Stripe payment:", error);
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode || 500 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
