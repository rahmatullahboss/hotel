"use server";

import { db, hotels, activityLog, reviews, systemSettings } from "@repo/db";
import { eq, desc, lt, and, count, avg } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SETTING_KEYS } from "@repo/db/schema";

// ==================
// Types
// ==================

export type HotelStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

interface HotelWithStats {
    id: string;
    name: string;
    city: string;
    status: string;
    rating: string | null;
    reviewCount: number;
    ownerName: string | null;
    ownerPhone: string | null;
    createdAt: Date;
}

// ==================
// Get Functions
// ==================

/**
 * Get all hotels with their status and owner info
 */
export async function getHotelsWithStatus(): Promise<HotelWithStats[]> {
    const allHotels = await db.query.hotels.findMany({
        with: {
            owner: true,
        },
        orderBy: desc(hotels.createdAt),
    });

    return allHotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        status: hotel.status,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        ownerName: hotel.owner?.name || null,
        ownerPhone: hotel.owner?.phone || null,
        createdAt: hotel.createdAt,
    }));
}

/**
 * Get hotels below a specific rating threshold
 */
export async function getHotelsBelowRating(threshold: number = 3) {
    const lowRatedHotels = await db.query.hotels.findMany({
        where: and(
            lt(hotels.rating, threshold.toString()),
            eq(hotels.status, "ACTIVE")
        ),
        with: {
            owner: true,
        },
        orderBy: hotels.rating,
    });

    return lowRatedHotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        status: hotel.status,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        ownerName: hotel.owner?.name || null,
        ownerPhone: hotel.owner?.phone || null,
    }));
}

/**
 * Get suspension dashboard stats
 */
export async function getSuspensionStats() {
    const allHotels = await db.query.hotels.findMany();

    const activeHotels = allHotels.filter((h) => h.status === "ACTIVE").length;
    const suspendedHotels = allHotels.filter((h) => h.status === "SUSPENDED").length;
    const pendingHotels = allHotels.filter((h) => h.status === "PENDING").length;
    const lowRatedActive = allHotels.filter(
        (h) => h.status === "ACTIVE" && parseFloat(h.rating || "5") < 3
    ).length;

    // Get suspension threshold from settings
    const thresholdSetting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, SETTING_KEYS.SUSPENSION_RATING_THRESHOLD),
    });
    const suspensionThreshold = parseFloat(thresholdSetting?.value || "3");

    return {
        total: allHotels.length,
        active: activeHotels,
        suspended: suspendedHotels,
        pending: pendingHotels,
        lowRatedActive,
        suspensionThreshold,
    };
}

// ==================
// Status Actions
// ==================

/**
 * Suspend a hotel
 */
export async function suspendHotel(
    hotelId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(hotels)
            .set({
                status: "SUSPENDED",
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotelId));

        // Log the action
        await db.insert(activityLog).values({
            type: "HOTEL_SUSPENDED",
            hotelId,
            description: `Hotel suspended. Reason: ${reason}`,
            metadata: { reason },
        });

        revalidatePath("/suspension");
        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        console.error("Error suspending hotel:", error);
        return { success: false, error: "Failed to suspend hotel" };
    }
}

/**
 * Activate a hotel (remove suspension or approve pending)
 */
export async function activateHotel(
    hotelId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        await db
            .update(hotels)
            .set({
                status: "ACTIVE",
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotelId));

        // Log the action
        await db.insert(activityLog).values({
            type: "HOTEL_APPROVED",
            hotelId,
            description: hotel.status === "PENDING"
                ? "Hotel application approved"
                : "Hotel suspension lifted",
        });

        revalidatePath("/suspension");
        revalidatePath("/hotels");
        return { success: true };
    } catch (error) {
        console.error("Error activating hotel:", error);
        return { success: false, error: "Failed to activate hotel" };
    }
}

/**
 * Bulk suspend hotels below rating threshold
 */
export async function bulkSuspendLowRatedHotels(
    threshold: number = 3
): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const lowRatedHotels = await getHotelsBelowRating(threshold);

        for (const hotel of lowRatedHotels) {
            await suspendHotel(hotel.id, `Rating below ${threshold} (${hotel.rating})`);
        }

        return { success: true, count: lowRatedHotels.length };
    } catch (error) {
        console.error("Error bulk suspending:", error);
        return { success: false, count: 0, error: "Failed to bulk suspend" };
    }
}

/**
 * Update suspension rating threshold
 */
export async function updateSuspensionThreshold(
    threshold: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const existing = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, SETTING_KEYS.SUSPENSION_RATING_THRESHOLD),
        });

        if (existing) {
            await db
                .update(systemSettings)
                .set({ value: threshold.toString(), updatedAt: new Date() })
                .where(eq(systemSettings.key, SETTING_KEYS.SUSPENSION_RATING_THRESHOLD));
        } else {
            await db.insert(systemSettings).values({
                key: SETTING_KEYS.SUSPENSION_RATING_THRESHOLD,
                value: threshold.toString(),
                description: "Rating threshold below which hotels can be suspended",
            });
        }

        revalidatePath("/suspension");
        return { success: true };
    } catch (error) {
        console.error("Error updating threshold:", error);
        return { success: false, error: "Failed to update threshold" };
    }
}
