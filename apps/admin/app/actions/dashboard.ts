"use server";

import { db } from "@repo/db";
import { hotels, bookings, users } from "@repo/db/schema";
import { eq, sql, count, sum, and, gte } from "drizzle-orm";

export interface AdminStats {
    totalRevenue: number;
    activeHotels: number;
    pendingHotels: number;
    totalBookings: number;
    totalUsers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
    try {
        // Get total revenue from all bookings
        const revenueResult = await db
            .select({ total: sum(bookings.totalAmount) })
            .from(bookings)
            .where(eq(bookings.paymentStatus, "PAID"));

        const totalRevenue = Number(revenueResult[0]?.total) || 0;

        // Get active hotels count
        const activeHotelsResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "ACTIVE"));

        const activeHotels = activeHotelsResult[0]?.count || 0;

        // Get pending hotels count
        const pendingHotelsResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "PENDING"));

        const pendingHotels = pendingHotelsResult[0]?.count || 0;

        // Get total bookings count
        const bookingsResult = await db
            .select({ count: count() })
            .from(bookings);

        const totalBookings = bookingsResult[0]?.count || 0;

        // Get total users count
        const usersResult = await db
            .select({ count: count() })
            .from(users);

        const totalUsers = usersResult[0]?.count || 0;

        return {
            totalRevenue,
            activeHotels,
            pendingHotels,
            totalBookings,
            totalUsers,
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
            totalRevenue: 0,
            activeHotels: 0,
            pendingHotels: 0,
            totalBookings: 0,
            totalUsers: 0,
        };
    }
}
