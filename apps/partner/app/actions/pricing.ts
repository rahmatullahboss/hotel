"use server";

import { db } from "@repo/db";
import { rooms, roomInventory, hotels } from "@repo/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface RoomPricing {
    id: string;
    roomNumber: string;
    name: string;
    type: string;
    basePrice: number;
    currentPrice: number; // May be adjusted
    minPrice: number; // -20% of base
    maxPrice: number; // +20% of base
}

export interface DatePricing {
    date: string;
    price: number;
    isModified: boolean;
}

/**
 * Get all rooms with pricing info for smart pricing
 */
export async function getRoomPricing(hotelId: string): Promise<RoomPricing[]> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        const hotelRooms = await db.query.rooms.findMany({
            where: and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)),
            orderBy: rooms.roomNumber,
        });

        // Get today's inventory for current prices
        const todayInventory = await db
            .select()
            .from(roomInventory)
            .where(eq(roomInventory.date, today));

        return hotelRooms.map((room: typeof hotelRooms[number]) => {
            const basePrice = Number(room.basePrice) || 0;
            const inventory = todayInventory.find((inv: typeof todayInventory[number]) => inv.roomId === room.id);
            const currentPrice = inventory?.price ? Number(inventory.price) : basePrice;

            return {
                id: room.id,
                roomNumber: room.roomNumber,
                name: room.name,
                type: room.type,
                basePrice,
                currentPrice,
                minPrice: Math.round(basePrice * 0.8), // -20%
                maxPrice: Math.round(basePrice * 1.2), // +20%
            };
        });
    } catch (error) {
        console.error("Error fetching room pricing:", error);
        return [];
    }
}

/**
 * Get pricing calendar for a room (next 30 days)
 */
export async function getRoomPricingCalendar(
    roomId: string,
    days: number = 30
): Promise<DatePricing[]> {
    try {
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) return [];

        const basePrice = Number(room.basePrice) || 0;
        const today = new Date();
        const dates: DatePricing[] = [];

        // Get inventory for next N days
        const startDate = today.toISOString().split("T")[0]!;
        const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]!;

        const inventory = await db
            .select()
            .from(roomInventory)
            .where(
                and(
                    eq(roomInventory.roomId, roomId),
                    gte(roomInventory.date, startDate),
                    lte(roomInventory.date, endDate)
                )
            );

        // Generate dates
        for (let i = 0; i < days; i++) {
            const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split("T")[0]!;
            const inv = inventory.find((d: typeof inventory[number]) => d.date === dateStr);

            dates.push({
                date: dateStr,
                price: inv?.price ? Number(inv.price) : basePrice,
                isModified: !!inv?.price && Number(inv.price) !== basePrice,
            });
        }

        return dates;
    } catch (error) {
        console.error("Error fetching pricing calendar:", error);
        return [];
    }
}

/**
 * Update room price with ±20% limit enforcement
 */
export async function updateSmartPrice(
    roomId: string,
    date: string,
    newPrice: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get the room to check base price
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        const basePrice = Number(room.basePrice) || 0;
        const minPrice = Math.round(basePrice * 0.8);
        const maxPrice = Math.round(basePrice * 1.2);

        // Enforce ±20% limit
        if (newPrice < minPrice || newPrice > maxPrice) {
            return {
                success: false,
                error: `Price must be between ৳${minPrice} (-20%) and ৳${maxPrice} (+20%)`,
            };
        }

        // Check if inventory exists
        const existing = await db.query.roomInventory.findFirst({
            where: and(eq(roomInventory.roomId, roomId), eq(roomInventory.date, date)),
        });

        if (existing) {
            await db
                .update(roomInventory)
                .set({ price: newPrice.toString(), updatedAt: new Date() })
                .where(eq(roomInventory.id, existing.id));
        } else {
            await db.insert(roomInventory).values({
                roomId,
                date,
                status: "AVAILABLE",
                price: newPrice.toString(),
            });
        }

        revalidatePath("/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error updating smart price:", error);
        return { success: false, error: "Failed to update price" };
    }
}

/**
 * Reset price to base price for a date
 */
export async function resetToBasePrice(
    roomId: string,
    date: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        const existing = await db.query.roomInventory.findFirst({
            where: and(eq(roomInventory.roomId, roomId), eq(roomInventory.date, date)),
        });

        if (existing) {
            await db
                .update(roomInventory)
                .set({ price: room.basePrice, updatedAt: new Date() })
                .where(eq(roomInventory.id, existing.id));
        }

        revalidatePath("/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error resetting price:", error);
        return { success: false, error: "Failed to reset price" };
    }
}

/**
 * Bulk update prices for date range
 */
export async function bulkUpdatePrices(
    roomId: string,
    startDate: string,
    endDate: string,
    newPrice: number
): Promise<{ success: boolean; error?: string; updated: number }> {
    try {
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found", updated: 0 };
        }

        const basePrice = Number(room.basePrice) || 0;
        const minPrice = Math.round(basePrice * 0.8);
        const maxPrice = Math.round(basePrice * 1.2);

        if (newPrice < minPrice || newPrice > maxPrice) {
            return {
                success: false,
                error: `Price must be between ৳${minPrice} and ৳${maxPrice}`,
                updated: 0,
            };
        }

        // Generate all dates in range
        const start = new Date(startDate);
        const end = new Date(endDate);
        let updated = 0;

        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0]!;

            const existing = await db.query.roomInventory.findFirst({
                where: and(eq(roomInventory.roomId, roomId), eq(roomInventory.date, dateStr)),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ price: newPrice.toString(), updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            } else {
                await db.insert(roomInventory).values({
                    roomId,
                    date: dateStr,
                    status: "AVAILABLE",
                    price: newPrice.toString(),
                });
            }
            updated++;
        }

        revalidatePath("/pricing");
        return { success: true, updated };
    } catch (error) {
        console.error("Error bulk updating prices:", error);
        return { success: false, error: "Failed to update prices", updated: 0 };
    }
}
