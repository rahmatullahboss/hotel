"use server";

import { db } from "@repo/db";
import { hotels } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get all hotels for admin
 */
export async function getAdminHotels() {
    try {
        const allHotels = await db.query.hotels.findMany({
            orderBy: [desc(hotels.createdAt)],
            with: {
                owner: true,
            },
        });
        return allHotels;
    } catch (error) {
        console.error("Error fetching admin hotels:", error);
        return [];
    }
}

/**
 * Toggle hotel verification status
 */
export async function toggleHotelVerification(hotelId: string, isVerified: boolean) {
    try {
        // Since isVerified isn't in schema yet, we might use status "ACTIVE" vs "PENDING"
        // But let's check schema first.
        // Assuming we want to update the status.

        await db
            .update(hotels)
            .set({ status: isVerified ? "ACTIVE" : "PENDING" })
            .where(eq(hotels.id, hotelId));

        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        console.error("Error updating hotel status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
