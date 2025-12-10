"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateBookingInput {
    hotelId: string;
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    checkIn: string;
    checkOut: string;
    paymentMethod: "BKASH" | "NAGAD" | "CARD" | "PAY_AT_HOTEL";
    totalAmount: number;
    userId?: string;
}

export interface BookingResult {
    success: boolean;
    bookingId?: string;
    error?: string;
}

/**
 * Create a new booking
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
    try {
        const {
            hotelId,
            roomId,
            guestName,
            guestPhone,
            guestEmail,
            checkIn,
            checkOut,
            paymentMethod,
            totalAmount,
            userId,
        } = input;

        // Get room details for commission calculation
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        // Calculate commission (12%)
        const commissionAmount = Math.round(totalAmount * 0.12);
        const netAmount = totalAmount - commissionAmount;

        // Calculate number of nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

        // Create booking
        const [booking] = await db.insert(bookings).values({
            hotelId,
            roomId,
            userId: userId ?? undefined,
            guestName,
            guestPhone,
            guestEmail: guestEmail ?? undefined,
            checkIn,
            checkOut,
            numberOfNights: nights,
            totalAmount: totalAmount.toString(),
            commissionAmount: commissionAmount.toString(),
            netAmount: netAmount.toString(),
            paymentMethod,
            paymentStatus: paymentMethod === "PAY_AT_HOTEL" ? "PAY_AT_HOTEL" : "PENDING",
            status: "PENDING",
        }).returning();

        revalidatePath("/bookings");

        return { success: true, bookingId: booking?.id };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false, error: "Failed to create booking" };
    }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(userId: string) {
    try {
        const userBookings = await db
            .select({
                id: bookings.id,
                checkIn: bookings.checkIn,
                checkOut: bookings.checkOut,
                status: bookings.status,
                totalAmount: bookings.totalAmount,
                paymentStatus: bookings.paymentStatus,
                guestName: bookings.guestName,
                hotelName: hotels.name,
                hotelLocation: hotels.address,
                hotelImage: hotels.coverImage,
                roomName: rooms.name,
            })
            .from(bookings)
            .leftJoin(hotels, eq(hotels.id, bookings.hotelId))
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(eq(bookings.userId, userId))
            .orderBy(desc(bookings.createdAt));

        return userBookings;
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, userId: string): Promise<BookingResult> {
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.userId !== userId) {
            return { success: false, error: "Not authorized" };
        }

        if (booking.status === "CANCELLED") {
            return { success: false, error: "Booking already cancelled" };
        }

        if (booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT") {
            return { success: false, error: "Cannot cancel completed booking" };
        }

        await db
            .update(bookings)
            .set({ status: "CANCELLED" })
            .where(eq(bookings.id, bookingId));

        revalidatePath("/bookings");

        return { success: true };
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return { success: false, error: "Failed to cancel booking" };
    }
}
