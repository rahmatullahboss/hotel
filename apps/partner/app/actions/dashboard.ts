"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels } from "@repo/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface DashboardStats {
    todayCheckIns: number;
    todayCheckOuts: number;
    occupancyRate: number;
    monthlyRevenue: number;
    pendingBookings: number;
}

export interface BookingSummary {
    id: string;
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
}

/**
 * Get dashboard stats for a hotel
 */
export async function getDashboardStats(hotelId: string): Promise<DashboardStats> {
    try {
        const today = new Date().toISOString().split("T")[0]!;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0]!;

        // Today's check-ins
        const checkIns = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.checkIn, today)));

        // Today's check-outs
        const checkOuts = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.checkOut, today)));

        // Pending bookings
        const pending = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.status, "PENDING")));

        // Monthly revenue
        const revenue = await db
            .select({ total: sql<string>`COALESCE(SUM(${bookings.netAmount}), '0')` })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    gte(bookings.checkIn, monthStart),
                    eq(bookings.status, "CONFIRMED")
                )
            );

        // Total rooms for occupancy calculation
        const totalRooms = await db
            .select({ count: sql<number>`count(*)` })
            .from(rooms)
            .where(eq(rooms.hotelId, hotelId));

        // Occupied rooms today (guests currently staying)
        const occupiedRooms = await db
            .select({ count: sql<number>`count(DISTINCT ${bookings.roomId})` })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    lte(bookings.checkIn, today),
                    gte(bookings.checkOut, today),
                    eq(bookings.status, "CONFIRMED")
                )
            );

        const totalRoomCount = Number(totalRooms[0]?.count) || 1;
        const occupiedCount = Number(occupiedRooms[0]?.count) || 0;
        const occupancyRate = Math.round((occupiedCount / totalRoomCount) * 100);

        return {
            todayCheckIns: Number(checkIns[0]?.count) || 0,
            todayCheckOuts: Number(checkOuts[0]?.count) || 0,
            occupancyRate,
            monthlyRevenue: Number(revenue[0]?.total) || 0,
            pendingBookings: Number(pending[0]?.count) || 0,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            todayCheckIns: 0,
            todayCheckOuts: 0,
            occupancyRate: 0,
            monthlyRevenue: 0,
            pendingBookings: 0,
        };
    }
}

/**
 * Get upcoming bookings for a hotel
 */
export async function getUpcomingBookings(hotelId: string, limit = 5): Promise<BookingSummary[]> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        const result = await db
            .select({
                id: bookings.id,
                guestName: bookings.guestName,
                guestPhone: bookings.guestPhone,
                roomNumber: rooms.roomNumber,
                roomName: rooms.name,
                checkIn: bookings.checkIn,
                checkOut: bookings.checkOut,
                status: bookings.status,
                totalAmount: bookings.totalAmount,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(eq(bookings.hotelId, hotelId), gte(bookings.checkIn, today)))
            .orderBy(bookings.checkIn)
            .limit(limit);

        return result.map((b) => ({
            ...b,
            roomNumber: b.roomNumber ?? "",
            roomName: b.roomName ?? "",
            totalAmount: Number(b.totalAmount) || 0,
        }));
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        return [];
    }
}

/**
 * Confirm a booking
 */
export async function confirmBooking(
    bookingId: string,
    hotelId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        await db
            .update(bookings)
            .set({ status: "CONFIRMED" })
            .where(eq(bookings.id, bookingId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error confirming booking:", error);
        return { success: false, error: "Failed to confirm booking" };
    }
}

/**
 * Check in a guest
 */
export async function checkInGuest(
    bookingId: string,
    hotelId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.status !== "CONFIRMED") {
            return { success: false, error: "Booking must be confirmed first" };
        }

        await db
            .update(bookings)
            .set({ status: "CHECKED_IN" })
            .where(eq(bookings.id, bookingId));

        revalidatePath("/");
        revalidatePath("/scanner");
        return { success: true };
    } catch (error) {
        console.error("Error checking in:", error);
        return { success: false, error: "Failed to check in" };
    }
}

/**
 * Check out a guest
 */
export async function checkOutGuest(
    bookingId: string,
    hotelId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.status !== "CHECKED_IN") {
            return { success: false, error: "Guest must be checked in first" };
        }

        await db
            .update(bookings)
            .set({ status: "CHECKED_OUT" })
            .where(eq(bookings.id, bookingId));

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error checking out:", error);
        return { success: false, error: "Failed to check out" };
    }
}
