import { NextRequest, NextResponse } from "next/server";
import { getUserBookings, createBooking } from "@/app/actions/bookings";
import { auth } from "@/auth";

/**
 * GET /api/bookings
 * 
 * Mobile API endpoint to fetch user's bookings
 * Requires authentication via Bearer token or session
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const bookings = await getUserBookings(session.user.id);
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
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone, guests, paymentMethod } = body;

        if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await createBooking({
            userId: session.user.id,
            roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guestName,
            guestEmail,
            guestPhone: guestPhone || "",
            guests: guests || 1,
            paymentMethod: paymentMethod || "CASH",
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
