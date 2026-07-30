import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/app/actions/bookings";
import { createBookingForUser } from "@/lib/booking-creation-service";
import { isCustomerPaymentMethod } from "@/lib/booking-calculation";
import { getUserIdFromRequest, verifyMobileToken } from "@/lib/mobile-auth";

/**
 * GET /api/bookings
 * 
 * Mobile API endpoint to fetch user's bookings
 * Supports both NextAuth sessions and JWT tokens
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const bookings = await getUserBookings(userId);
        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/bookings
 * 
 * Mobile API endpoint to create a new booking
 * Supports both NextAuth sessions and JWT tokens
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const { hotelId, roomId, checkIn, checkOut, guestPhone, paymentMethod, useWalletBalance, walletAmount, guests } = body;
        let { guestName, guestEmail } = body;

        // Better error messages for debugging
        const missingFields: string[] = [];
        if (!hotelId) missingFields.push('hotelId');
        if (!roomId) missingFields.push('roomId');
        if (!checkIn) missingFields.push('checkIn');
        if (!checkOut) missingFields.push('checkOut');

        if (missingFields.length > 0) {
            console.warn('Booking request is missing required fields', { missingFields });
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        if (paymentMethod !== undefined && !isCustomerPaymentMethod(paymentMethod)) {
            return NextResponse.json(
                { error: "Unsupported payment method" },
                { status: 400 },
            );
        }

        const mobileAuth = await verifyMobileToken(request);

        // If guest info not provided, fetch from user profile
        if (!guestName || !guestEmail) {

            if (mobileAuth) {
                guestName = guestName || mobileAuth.name || "Guest";
                guestEmail = guestEmail || mobileAuth.email || "";
            } else {
                // Fallback: use userId to fetch from DB
                const { db } = await import("@repo/db");
                const { users } = await import("@repo/db/schema");
                const { eq } = await import("drizzle-orm");

                const user = await db.query.users.findFirst({
                    where: eq(users.id, userId),
                });

                if (user) {
                    guestName = guestName || user.name || "Guest";
                    guestEmail = guestEmail || user.email || "";
                }
            }
        }

        const result = await createBookingForUser({
            hotelId,
            roomId,
            checkIn,
            checkOut,
            guestName: guestName || "Guest",
            guestEmail: guestEmail || "",
            guestPhone: guestPhone || "",
            guestCount: Number.isSafeInteger(guests) ? guests : 1,
            paymentMethod: paymentMethod ?? "PAY_AT_HOTEL",
            // Split payment support
            useWalletBalance: useWalletBalance || false,
            walletAmount: walletAmount === undefined ? undefined : walletAmount,
        }, {
            userId,
            source: mobileAuth ? "MOBILE" : "WEB",
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to create booking" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            bookingId: result.bookingId,
            message: "Booking created successfully",
            requiresPayment: result.requiresPayment,
            advanceAmount: result.advanceAmount,
            totalAmount: result.totalAmount,
            amountDueNow: result.amountDueNow,
            walletAmountUsed: result.walletAmountUsed,
            amountOutstanding: result.amountOutstanding,
            currency: result.currency,
            calculation: result.calculation,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
