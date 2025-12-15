import { NextRequest, NextResponse } from "next/server";
import { getUserBookings, createBooking } from "@/app/actions/bookings";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

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
        const { hotelId, roomId, checkIn, checkOut, guestPhone, totalAmount, paymentMethod } = body;
        let { guestName, guestEmail } = body;

        if (!hotelId || !roomId || !checkIn || !checkOut || !totalAmount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // If guest info not provided, fetch from user profile
        if (!guestName || !guestEmail) {
            const { verifyMobileToken } = await import("@/lib/mobile-auth");
            const mobileAuth = verifyMobileToken(request);

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

        const result = await createBooking({
            userId,
            hotelId,
            roomId,
            checkIn,
            checkOut,
            guestName: guestName || "Guest",
            guestEmail: guestEmail || "",
            guestPhone: guestPhone || "",
            totalAmount,
            paymentMethod: paymentMethod || "PAY_AT_HOTEL",
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
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}
