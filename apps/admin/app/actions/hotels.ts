"use server";

import { db } from "@repo/db";
import { hotels, users } from "@repo/db/schema";
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
 * Get pending hotel applications for admin review
 */
export async function getPendingHotels() {
    try {
        const pendingHotels = await db.query.hotels.findMany({
            where: eq(hotels.status, "PENDING"),
            orderBy: [desc(hotels.createdAt)],
            with: {
                owner: true,
            },
        });
        return pendingHotels;
    } catch (error) {
        console.error("Error fetching pending hotels:", error);
        return [];
    }
}

/**
 * Approve hotel registration - sets hotel to ACTIVE and user role to PARTNER
 */
export async function approveHotelRegistration(hotelId: string) {
    try {
        // Get the hotel with owner
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Update hotel status to ACTIVE
        await db
            .update(hotels)
            .set({ status: "ACTIVE" })
            .where(eq(hotels.id, hotelId));

        // Update user role to PARTNER
        await db
            .update(users)
            .set({ role: "PARTNER" })
            .where(eq(users.id, hotel.ownerId));

        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        console.error("Error approving hotel:", error);
        return { success: false, error: "Failed to approve hotel" };
    }
}

/**
 * Reject/suspend hotel registration
 */
export async function rejectHotelRegistration(hotelId: string) {
    try {
        await db
            .update(hotels)
            .set({ status: "SUSPENDED" })
            .where(eq(hotels.id, hotelId));

        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting hotel:", error);
        return { success: false, error: "Failed to reject hotel" };
    }
}

/**
 * Toggle hotel verification status (legacy - keep for compatibility)
 */
export async function toggleHotelVerification(hotelId: string, isVerified: boolean) {
    try {
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
