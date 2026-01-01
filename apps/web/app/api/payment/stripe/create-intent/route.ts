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
            currency?: 'bdt' | 'usd'; // Accept currency from mobile app
        };

        const { bookingId, amount, currency = 'bdt' } = body; // Default to BDT

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

        // Use custom amount or full booking amount (always in BDT)
        const paymentAmountBDT = amount || Number(booking.totalAmount);
        
        // Calculate amount in smallest currency unit based on selected currency
        // BDT: paisa (1 BDT = 100 paisa)
        // USD: cents (1 USD = 100 cents), convert from BDT at 1 USD = 110 BDT
        const exchangeRate = 110;
        let amountInSmallestUnit: number;
        let displayAmount: string;
        
        if (currency === 'usd') {
            const amountInUSD = Math.round(paymentAmountBDT / exchangeRate);
            amountInSmallestUnit = amountInUSD * 100; // cents
            displayAmount = `BDT ${paymentAmountBDT} → USD ${amountInUSD} (${amountInSmallestUnit} cents)`;
        } else {
            amountInSmallestUnit = Math.round(paymentAmountBDT * 100); // paisa
            displayAmount = `BDT ${paymentAmountBDT} (${amountInSmallestUnit} paisa)`;
        }

        console.log(`Creating Stripe payment intent: ${displayAmount} [currency: ${currency}]`);

        // Create payment intent with user's selected currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: currency, // Use selected currency (bdt or usd)
            metadata: {
                bookingId: booking.id,
                hotelId: booking.hotelId,
                userId: booking.userId || "guest",
                guestName: booking.guestName,
                guestPhone: booking.guestPhone,
                originalAmountBDT: paymentAmountBDT.toString(),
                currency: currency,
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
