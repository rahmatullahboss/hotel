"use server";

import { db } from "@repo/db";
import { bookings, rooms } from "@repo/db/schema";
import { eq, and, desc, gte, lte, or, ilike } from "drizzle-orm";
import { getPartnerHotel } from "./dashboard";

export interface BookingHistoryItem {
    id: string;
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
    advancePaid: number;
    remainingAmount: number;
    paymentStatus: string;
    bookingSource: string;
    createdAt: Date;
}

export interface BookingFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

/**
 * Get booking history with filters and pagination
 */
export async function getBookingHistory(
    filters: BookingFilters = {},
    page: number = 1,
    limit: number = 20
): Promise<{ bookings: BookingHistoryItem[]; total: number; pages: number }> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { bookings: [], total: 0, pages: 0 };
        }

        const offset = (page - 1) * limit;

        // Build conditions
        const conditions = [eq(bookings.hotelId, hotel.id)];

        if (filters.status && filters.status !== "ALL") {
            conditions.push(eq(bookings.status, filters.status as "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED"));
        }

        if (filters.startDate) {
            conditions.push(gte(bookings.checkIn, filters.startDate));
        }

        if (filters.endDate) {
            conditions.push(lte(bookings.checkIn, filters.endDate));
        }

        // Get bookings with room info
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
                bookingFee: bookings.bookingFee,
                paymentStatus: bookings.paymentStatus,
                bookingSource: bookings.bookingSource,
                createdAt: bookings.createdAt,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(...conditions))
            .orderBy(desc(bookings.createdAt))
            .limit(limit)
            .offset(offset);

        // Filter by search if provided (in application layer for simplicity)
        let filteredResult = result;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredResult = result.filter(
                (b: typeof result[number]) =>
                    b.guestName.toLowerCase().includes(searchLower) ||
                    b.guestPhone.includes(filters.search!)
            );
        }

        // Get total count
        const allBookings = await db
            .select({ id: bookings.id })
            .from(bookings)
            .where(and(...conditions));

        const total = allBookings.length;
        const pages = Math.ceil(total / limit);

        return {
            bookings: filteredResult.map((b: typeof filteredResult[number]) => {
                const totalAmount = Number(b.totalAmount) || 0;
                const advancePaid = Number(b.bookingFee) || 0;
                return {
                    ...b,
                    roomNumber: b.roomNumber ?? "",
                    roomName: b.roomName ?? "",
                    totalAmount,
                    advancePaid,
                    remainingAmount: totalAmount - advancePaid,
                    paymentStatus: b.paymentStatus ?? "PENDING",
                    bookingSource: b.bookingSource ?? "PLATFORM",
                    createdAt: b.createdAt,
                };
            }),
            total,
            pages,
        };
    } catch (error) {
        console.error("Error fetching booking history:", error);
        return { bookings: [], total: 0, pages: 0 };
    }
}

/**
 * Export bookings to CSV format
 */
export async function exportBookingsCSV(
    filters: BookingFilters = {}
): Promise<string> {
    const { bookings: allBookings } = await getBookingHistory(filters, 1, 1000);

    const headers = [
        "Guest Name",
        "Phone",
        "Room",
        "Check-in",
        "Check-out",
        "Status",
        "Total",
        "Advance",
        "Due",
        "Payment",
        "Source",
    ];

    const rows = allBookings.map((b: typeof allBookings[number]) => [
        b.guestName,
        b.guestPhone,
        b.roomNumber,
        b.checkIn,
        b.checkOut,
        b.status,
        b.totalAmount,
        b.advancePaid,
        b.remainingAmount,
        b.paymentStatus,
        b.bookingSource,
    ]);

    const csv = [headers.join(","), ...rows.map((row: (string | number)[]) => row.join(","))].join("\n");
    return csv;
}
