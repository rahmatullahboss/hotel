"use server";

import { db } from "@repo/db";
import { bookings, rooms, roomInventory, hotels } from "@repo/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
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
}

/**
 * Record a walk-in customer
 * Walk-ins have NO commission - they're just tracked for inventory
 * FRAUD PREVENTION: Cannot record walk-in if there's an existing platform booking for the room/dates
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

        // FRAUD PREVENTION: Check if there's an existing platform booking for this room/dates
        // This prevents hotels from recording walk-ins to avoid paying commission
        const existingPlatformBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.roomId, input.roomId),
                eq(bookings.bookingSource, "PLATFORM"),
                // Check for overlapping dates
                lte(bookings.checkIn, input.checkOut),
                gte(bookings.checkOut, input.checkIn),
                // Only consider active bookings (not cancelled)
                eq(bookings.status, "CONFIRMED"),
            ),
        });

        if (existingPlatformBooking) {
            return {
                success: false,
                error: "This room has an existing platform booking for these dates. Please check in the platform booking instead.",
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
            revenue: walkIns.reduce((sum, b) => sum + Number(b.totalAmount), 0),
        };
    } catch (error) {
        console.error("Error fetching walk-ins:", error);
        return { count: 0, revenue: 0 };
    }
}
