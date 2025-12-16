"use server";

import { db, hotels, systemSettings, type Hotel } from "@repo/db";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SETTING_KEYS } from "@repo/db/schema";

// ==================
// Types
// ==================

interface CommissionStats {
    defaultCommission: number;
    totalHotels: number;
    customCommissionCount: number;
    avgCommission: number;
    minCommission: number;
    maxCommission: number;
}

interface HotelCommission {
    id: string;
    name: string;
    city: string;
    commissionRate: string;
    status: string;
}

// ==================
// Get Functions
// ==================

/**
 * Get commission stats
 */
export async function getCommissionStats(): Promise<CommissionStats> {
    const allHotels = await db.query.hotels.findMany();

    // Get default commission from settings
    const defaultSetting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, "defaultCommission"),
    });
    const defaultCommission = parseFloat(defaultSetting?.value || "12");

    const commissionRates = allHotels.map((h: Hotel) => parseFloat(h.commissionRate));
    const customCommissionCount = allHotels.filter(
        (h: Hotel) => parseFloat(h.commissionRate) !== defaultCommission
    ).length;

    const avgCommission = commissionRates.length > 0
        ? commissionRates.reduce((a: number, b: number) => a + b, 0) / commissionRates.length
        : defaultCommission;
    const minCommission = commissionRates.length > 0
        ? Math.min(...commissionRates)
        : defaultCommission;
    const maxCommission = commissionRates.length > 0
        ? Math.max(...commissionRates)
        : defaultCommission;

    return {
        defaultCommission,
        totalHotels: allHotels.length,
        customCommissionCount,
        avgCommission: parseFloat(avgCommission.toFixed(2)),
        minCommission,
        maxCommission,
    };
}

/**
 * Get all hotels with their commission rates
 */
export async function getHotelsWithCommission(): Promise<HotelCommission[]> {
    const allHotels = await db.query.hotels.findMany({
        orderBy: hotels.name,
    });

    return allHotels.map((hotel: Hotel) => ({
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        commissionRate: hotel.commissionRate,
        status: hotel.status,
    }));
}

// ==================
// Update Functions
// ==================

/**
 * Update default commission rate
 */
export async function updateDefaultCommission(
    rate: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const existing = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "defaultCommission"),
        });

        if (existing) {
            await db
                .update(systemSettings)
                .set({ value: rate.toString(), updatedAt: new Date() })
                .where(eq(systemSettings.key, "defaultCommission"));
        } else {
            await db.insert(systemSettings).values({
                key: "defaultCommission",
                value: rate.toString(),
                description: "Default commission rate for new hotels (%)",
            });
        }

        revalidatePath("/commission");
        return { success: true };
    } catch (error) {
        console.error("Error updating default commission:", error);
        return { success: false, error: "Failed to update default commission" };
    }
}

/**
 * Update a hotel's commission rate
 */
export async function updateHotelCommission(
    hotelId: string,
    rate: number
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(hotels)
            .set({
                commissionRate: rate.toFixed(2),
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotelId));

        revalidatePath("/commission");
        return { success: true };
    } catch (error) {
        console.error("Error updating hotel commission:", error);
        return { success: false, error: "Failed to update hotel commission" };
    }
}

/**
 * Reset hotel commission to default
 */
export async function resetHotelCommission(
    hotelId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const defaultSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "defaultCommission"),
        });
        const defaultRate = defaultSetting?.value || "12.00";

        await db
            .update(hotels)
            .set({
                commissionRate: defaultRate,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotelId));

        revalidatePath("/commission");
        return { success: true };
    } catch (error) {
        console.error("Error resetting hotel commission:", error);
        return { success: false, error: "Failed to reset hotel commission" };
    }
}

/**
 * Bulk update all hotels to default commission
 */
export async function resetAllCommissions(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const defaultSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "defaultCommission"),
        });
        const defaultRate = defaultSetting?.value || "12.00";

        const result = await db
            .update(hotels)
            .set({
                commissionRate: defaultRate,
                updatedAt: new Date(),
            });

        revalidatePath("/commission");
        return { success: true, count: 0 }; // Drizzle doesn't return count on update
    } catch (error) {
        console.error("Error resetting all commissions:", error);
        return { success: false, count: 0, error: "Failed to reset commissions" };
    }
}
