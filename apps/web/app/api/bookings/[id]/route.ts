import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings, hotels, rooms } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

/**
 * GET /api/bookings/[id]
 * 
 * Mobile API endpoint to fetch a single booking by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const booking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, id),
                eq(bookings.userId, userId)
            ),
            with: {
                hotel: true,
                room: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Format response for mobile app
        return NextResponse.json({
            id: booking.id,
            hotelName: booking.hotel?.name || "Unknown Hotel",
            hotelLocation: booking.hotel?.city || "",
            hotelImage: booking.hotel?.coverImage || null,
            roomName: booking.room?.name || "Room",
            roomType: booking.room?.type || "DOUBLE",
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            status: booking.status,
            totalAmount: booking.totalAmount,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            bookingFee: booking.bookingFee,
            bookingFeeStatus: booking.bookingFeeStatus,
            guestName: booking.guestName,
            guestPhone: booking.guestPhone,
            guestEmail: booking.guestEmail,
            qrCode: booking.qrCode,
            createdAt: booking.createdAt,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}
