"use server";

import { db } from "@repo/db";
import { bookings, hotels } from "@repo/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Customer self check-in by scanning hotel QR code
 * Finds the customer's confirmed booking for today and checks them in
 */
export async function customerSelfCheckIn(
    hotelId: string,
    userId: string
): Promise<{
    success: boolean;
    error?: string;
    booking?: {
        id: string;
        hotelName: string;
        roomName: string;
        checkIn: string;
        checkOut: string;
    };
}> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        // Verify hotel exists
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Find user's booking for today at this hotel (any status)
        const anyBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.hotelId, hotelId),
                eq(bookings.userId, userId),
                lte(bookings.checkIn, today),
                gte(bookings.checkOut, today)
            ),
            with: {
                room: true,
            },
        });

        if (!anyBooking) {
            return {
                success: false,
                error: "No booking found for today at this hotel. Please check your booking details."
            };
        }

        // Check if already checked in
        if (anyBooking.status === "CHECKED_IN") {
            return {
                success: true,
                booking: {
                    id: anyBooking.id,
                    hotelName: hotel.name,
                    roomName: anyBooking.room?.name || "Room",
                    checkIn: anyBooking.checkIn,
                    checkOut: anyBooking.checkOut,
                },
            };
        }

        // Check if booking is confirmed
        if (anyBooking.status !== "CONFIRMED") {
            return {
                success: false,
                error: `Your booking status is "${anyBooking.status}". Only confirmed bookings can be checked in.`
            };
        }

        const booking = anyBooking;

        // Update booking status to CHECKED_IN
        await db
            .update(bookings)
            .set({
                status: "CHECKED_IN",
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, booking.id));

        revalidatePath("/bookings");

        return {
            success: true,
            booking: {
                id: booking.id,
                hotelName: hotel.name,
                roomName: booking.room?.name || "Room",
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
            },
        };
    } catch (error) {
        console.error("Error during self check-in:", error);
        return { success: false, error: "Failed to check in. Please try again." };
    }
}

/**
 * Get hotel check-in QR data
 * This QR code will be displayed at the hotel for guests to scan
 */
export async function getHotelCheckInQR(hotelId: string): Promise<{
    success: boolean;
    qrData?: string;
    hotelName?: string;
    error?: string;
}> {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // QR data contains hotel ID and action type
        const qrData = JSON.stringify({
            type: "HOTEL_CHECKIN",
            hotelId: hotel.id,
            hotelName: hotel.name,
        });

        return {
            success: true,
            qrData,
            hotelName: hotel.name,
        };
    } catch (error) {
        console.error("Error generating hotel QR:", error);
        return { success: false, error: "Failed to generate QR code" };
    }
}

/**
 * Customer self check-out by scanning hotel QR code
 * Finds the customer's checked-in booking and checks them out
 */
export async function customerSelfCheckOut(
    hotelId: string,
    userId: string
): Promise<{
    success: boolean;
    error?: string;
    booking?: {
        id: string;
        hotelName: string;
        roomName: string;
        checkIn: string;
        checkOut: string;
    };
}> {
    try {
        // Verify hotel exists
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Find user's CHECKED_IN booking at this hotel
        const checkedInBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.hotelId, hotelId),
                eq(bookings.userId, userId),
                eq(bookings.status, "CHECKED_IN")
            ),
            with: {
                room: true,
            },
        });

        if (!checkedInBooking) {
            // Check if they have any booking at all
            const anyBooking = await db.query.bookings.findFirst({
                where: and(
                    eq(bookings.hotelId, hotelId),
                    eq(bookings.userId, userId)
                ),
            });

            if (!anyBooking) {
                return {
                    success: false,
                    error: "No booking found at this hotel. Please check your booking details."
                };
            }

            if (anyBooking.status === "CHECKED_OUT") {
                return {
                    success: false,
                    error: "You have already checked out of this hotel."
                };
            }

            return {
                success: false,
                error: `Your booking status is "${anyBooking.status}". You must be checked in to check out.`
            };
        }

        // Update booking status to CHECKED_OUT
        await db
            .update(bookings)
            .set({
                status: "CHECKED_OUT",
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, checkedInBooking.id));

        revalidatePath("/bookings");
        revalidatePath("/profile");

        return {
            success: true,
            booking: {
                id: checkedInBooking.id,
                hotelName: hotel.name,
                roomName: checkedInBooking.room?.name || "Room",
                checkIn: checkedInBooking.checkIn,
                checkOut: checkedInBooking.checkOut,
            },
        };
    } catch (error) {
        console.error("Error during self check-out:", error);
        return { success: false, error: "Failed to check out. Please try again." };
    }
}

