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

        // Use custom amount or full booking amount (in BDT)
        const paymentAmountBDT = amount || Number(booking.totalAmount);
        
        // Convert BDT to USD (approx rate: 1 USD = 110 BDT)
        // Stripe requires amounts in smallest currency unit (cents for USD)
        const exchangeRate = 110;
        const amountInUSD = Math.round(paymentAmountBDT / exchangeRate);
        const amountInCents = amountInUSD * 100;

        console.log(`Creating Stripe payment intent: BDT ${paymentAmountBDT} → USD ${amountInUSD} (${amountInCents} cents)`);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd", // US Dollar (Stripe Atlas accounts use USD)
            metadata: {
                bookingId: booking.id,
                hotelId: booking.hotelId,
                userId: booking.userId || "guest",
                guestName: booking.guestName,
                guestPhone: booking.guestPhone,
                originalAmountBDT: paymentAmountBDT.toString(),
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
        
        // Type-safe Stripe error handling
        if (error && typeof error === 'object' && 'type' in error) {
            const stripeError = error as { type: string; message?: string; statusCode?: number };
            if (stripeError.type.startsWith('Stripe')) {
                return NextResponse.json(
                    { success: false, error: stripeError.message || 'Stripe error' },
                    { status: stripeError.statusCode || 400 }
                );
            }
        }
        
        // Generic error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: `Failed to create payment intent: ${errorMessage}` },
            { status: 500 }
        );
    }
}
