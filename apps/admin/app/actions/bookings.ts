"use server";

import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { desc } from "drizzle-orm";

/**
 * Get all bookings for admin
 */
export async function getAdminBookings() {
    try {
        const allBookings = await db.query.bookings.findMany({
            orderBy: [desc(bookings.createdAt)],
            with: {
                user: true,
                hotel: true,
            },
        });
        return allBookings;
    } catch (error) {
        console.error("Error fetching admin bookings:", error);
        return [];
    }
}
