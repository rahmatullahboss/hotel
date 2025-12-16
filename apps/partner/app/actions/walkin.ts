"use server";

import { db } from "@repo/db";
import { bookings, rooms, roomInventory, hotels } from "@repo/db/schema";
import { eq, and, gte, lte, or, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPartnerHotel } from "./dashboard";

export interface WalkInInput {
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestEmail?: string;
    guestCount: number;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    notes?: string;
    guestIdPhoto?: string; // ID card photo URL for security
}

/**
 * Record a walk-in customer
 * Walk-ins have NO commission - they're just tracked for inventory
 * FRAUD PREVENTION: 
 * 1. Cannot record walk-in if room has existing platform booking
 * 2. Cannot record walk-in if phone number matches a platform booking
 */
export async function recordWalkIn(
    input: WalkInInput
): Promise<{ success: boolean; error?: string; bookingId?: string }> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Verify room belongs to this hotel
        const room = await db.query.rooms.findFirst({
            where: and(eq(rooms.id, input.roomId), eq(rooms.hotelId, hotel.id)),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        // FRAUD PREVENTION 1: Check if room has platform booking for these dates
        const existingRoomBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.roomId, input.roomId),
                eq(bookings.bookingSource, "PLATFORM"),
                lte(bookings.checkIn, input.checkOut),
                gte(bookings.checkOut, input.checkIn),
                ne(bookings.status, "CANCELLED"),
            ),
        });

        if (existingRoomBooking) {
            return {
                success: false,
                error: "This room has an existing platform booking for these dates. Please check in the platform booking instead.",
            };
        }

        // FRAUD PREVENTION 2: Check if phone number matches any platform booking
        // This catches when hotel tries to record a platform customer as walk-in
        const existingPhoneBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.hotelId, hotel.id),
                eq(bookings.guestPhone, input.guestPhone),
                eq(bookings.bookingSource, "PLATFORM"),
                lte(bookings.checkIn, input.checkOut),
                gte(bookings.checkOut, input.checkIn),
                or(
                    eq(bookings.status, "CONFIRMED"),
                    eq(bookings.status, "PENDING")
                ),
            ),
        });

        if (existingPhoneBooking) {
            return {
                success: false,
                error: `This guest (${input.guestPhone}) has an existing platform booking. Please use the Scanner to check them in.`,
            };
        }

        // Calculate number of nights
        const checkInDate = new Date(input.checkIn);
        const checkOutDate = new Date(input.checkOut);
        const numberOfNights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Create booking with WALK_IN source - NO COMMISSION
        const [newBooking] = await db
            .insert(bookings)
            .values({
                hotelId: hotel.id,
                roomId: input.roomId,
                guestName: input.guestName,
                guestPhone: input.guestPhone,
                guestEmail: input.guestEmail || null,
                guestCount: input.guestCount,
                checkIn: input.checkIn,
                checkOut: input.checkOut,
                numberOfNights,
                totalAmount: input.totalAmount.toString(),
                commissionAmount: "0", // No commission for walk-ins
                netAmount: input.totalAmount.toString(), // Hotel keeps 100%
                bookingSource: "WALK_IN",
                commissionStatus: "NOT_APPLICABLE", // No commission to track
                status: "CHECKED_IN", // Walk-ins are already at the hotel
                paymentStatus: "PAY_AT_HOTEL",
                notes: input.notes || "Walk-in guest",
                guestIdPhoto: input.guestIdPhoto || null, // ID card photo for security
            })
            .returning({ id: bookings.id });

        // Block room inventory for the dates
        const dates: string[] = [];
        const current = new Date(input.checkIn);
        while (current < checkOutDate) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, input.roomId),
                    eq(roomInventory.date, date)
                ),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "OCCUPIED", updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            } else {
                await db.insert(roomInventory).values({
                    roomId: input.roomId,
                    date,
                    status: "OCCUPIED",
                });
            }
        }

        revalidatePath("/");
        revalidatePath("/walkin");
        return { success: true, bookingId: newBooking?.id };
    } catch (error) {
        console.error("Error recording walk-in:", error);
        return { success: false, error: "Failed to record walk-in" };
    }
}

/**
 * Get today's walk-in guests for the hotel
 */
export async function getTodayWalkIns(): Promise<{
    count: number;
    revenue: number;
}> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) return { count: 0, revenue: 0 };

        const today = new Date().toISOString().split("T")[0]!;

        const walkIns = await db.query.bookings.findMany({
            where: and(
                eq(bookings.hotelId, hotel.id),
                eq(bookings.bookingSource, "WALK_IN"),
                eq(bookings.checkIn, today)
            ),
        });

        return {
            count: walkIns.length,
            revenue: walkIns.reduce((sum: number, b: typeof walkIns[number]) => sum + Number(b.totalAmount), 0),
        };
    } catch (error) {
        console.error("Error fetching walk-ins:", error);
        return { count: 0, revenue: 0 };
    }
}

export interface RoomAvailability {
    id: string;
    number: string;
    name: string;
    type: string;
    price: number;
    isAvailable: boolean;
    unavailableReason?: string;
}

/**
 * Check room availability for specific dates
 * Returns all rooms with their availability status for the date range
 */
export async function checkRoomAvailabilityForDates(
    checkIn: string,
    checkOut: string
): Promise<RoomAvailability[]> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) return [];

        // Get all rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: eq(rooms.hotelId, hotel.id),
            orderBy: rooms.roomNumber,
        });

        const result: RoomAvailability[] = [];

        for (const room of hotelRooms) {
            let isAvailable = true;
            let unavailableReason: string | undefined;

            // Check 1: Is room blocked for any of these dates?
            const blockedInventory = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, room.id),
                    eq(roomInventory.status, "BLOCKED"),
                    gte(roomInventory.date, checkIn),
                    lte(roomInventory.date, checkOut)
                ),
            });

            if (blockedInventory) {
                isAvailable = false;
                unavailableReason = "Room is blocked for these dates";
            }

            // Check 2: Is room already booked (platform booking)?
            if (isAvailable) {
                const existingBooking = await db.query.bookings.findFirst({
                    where: and(
                        eq(bookings.roomId, room.id),
                        lte(bookings.checkIn, checkOut),
                        gte(bookings.checkOut, checkIn),
                        ne(bookings.status, "CANCELLED"),
                        ne(bookings.status, "CHECKED_OUT")
                    ),
                });

                if (existingBooking) {
                    isAvailable = false;
                    if (existingBooking.bookingSource === "PLATFORM") {
                        unavailableReason = "Has platform booking";
                    } else {
                        unavailableReason = "Already occupied";
                    }
                }
            }

            // Check 3: Is room occupied in inventory?
            if (isAvailable) {
                const occupiedInventory = await db.query.roomInventory.findFirst({
                    where: and(
                        eq(roomInventory.roomId, room.id),
                        eq(roomInventory.status, "OCCUPIED"),
                        gte(roomInventory.date, checkIn),
                        lte(roomInventory.date, checkOut)
                    ),
                });

                if (occupiedInventory) {
                    isAvailable = false;
                    unavailableReason = "Room is occupied";
                }
            }

            result.push({
                id: room.id,
                number: room.roomNumber,
                name: room.name,
                type: room.type,
                price: Number(room.basePrice) || 0,
                isAvailable,
                unavailableReason,
            });
        }

        return result;
    } catch (error) {
        console.error("Error checking room availability:", error);
        return [];
    }
}
