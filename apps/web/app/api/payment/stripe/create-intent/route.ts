import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

// Lazy Stripe initialization
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
    try {
        const stripe = getStripe();
        
        // Get user ID from JWT or session
        const userId = await getUserIdFromRequest(request);

        const body = await request.json() as {
            bookingId: string;
            amount?: number;
        };

        const { bookingId, amount } = body;

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

        // Security: Verify the user owns this booking (if authenticated)
        if (userId && booking.userId && booking.userId !== userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: You don't own this booking" },
                { status: 403 }
            );
        }

        if (booking.paymentStatus === "PAID") {
            return NextResponse.json(
                { success: false, error: "Payment already completed" },
                { status: 400 }
            );
        }

        // Use custom amount or full booking amount
        const paymentAmount = amount || Number(booking.totalAmount);
        
        // Convert to smallest currency unit (paisa for BDT)
        // Stripe expects amounts in the smallest currency unit
        const amountInSmallestUnit = Math.round(paymentAmount * 100);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: "bdt", // Bangladesh Taka
            metadata: {
                bookingId: booking.id,
                hotelId: booking.hotelId,
                userId: booking.userId || "guest",
                guestName: booking.guestName,
                guestPhone: booking.guestPhone,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Store payment reference in booking
        await db
            .update(bookings)
            .set({
                paymentReference: paymentIntent.id,
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error: unknown) {
        console.error("Error creating Stripe payment intent:", error);
        if (error instanceof Stripe.errors.StripeError) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: error.statusCode || 500 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Failed to create payment intent" },
            { status: 500 }
        );
    }
}
