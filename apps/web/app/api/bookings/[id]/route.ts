import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { bookings, hotels, rooms } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { cancelBooking, getCancellationInfo } from "@/app/actions/bookings";

/**
 * GET /api/bookings/[id]
 * 
 * Mobile API endpoint to fetch a single booking by ID
 * 
 * Query params:
 * - cancelInfo=true: Include cancellation policy info
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getUserIdFromRequest(request);
        const { searchParams } = new URL(request.url);
        const includeCancelInfo = searchParams.get("cancelInfo") === "true";

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

        // Get cancellation info if requested
        let cancellationInfo = null;
        if (includeCancelInfo && (booking.status === "PENDING" || booking.status === "CONFIRMED")) {
            cancellationInfo = await getCancellationInfo(id, userId);
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
            ...(cancellationInfo && { cancellationInfo }),
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/bookings/[id]
 * 
 * Mobile API endpoint to cancel a booking
 * 
 * Body: { reason: string }
 */
export async function DELETE(
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

        const body = await request.json().catch(() => ({}));
        const reason = body.reason || "User cancelled";

        const result = await cancelBooking(id, userId, reason);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Failed to cancel booking" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            refundAmount: result.refundAmount || 0,
            isLate: result.isLate || false,
            message: result.refundAmount
                ? `Booking cancelled. ৳${result.refundAmount} refunded to wallet.`
                : "Booking cancelled successfully.",
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}
