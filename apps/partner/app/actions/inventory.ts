"use server";

import { db } from "@repo/db";
import { rooms, roomInventory } from "@repo/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface RoomStatus {
    id: string;
    number: string;
    name: string;
    type: string;
    status: "AVAILABLE" | "OCCUPIED" | "BLOCKED";
    price: number;
}

/**
 * Get all rooms for a hotel with today's status
 */
export async function getHotelRooms(hotelId: string): Promise<RoomStatus[]> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        // Get all rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: eq(rooms.hotelId, hotelId),
            orderBy: rooms.roomNumber,
        });

        // Get today's inventory status for all rooms
        const roomIds = hotelRooms.map((r) => r.id);

        const todayInventory = roomIds.length > 0 ? await db
            .select()
            .from(roomInventory)
            .where(
                and(
                    eq(roomInventory.date, today)
                )
            ) : [];

        // Map rooms with their status
        return hotelRooms.map((room) => {
            const inventory = todayInventory.find((inv) => inv.roomId === room.id);
            let status: RoomStatus["status"] = "AVAILABLE";

            if (inventory) {
                status = inventory.status as RoomStatus["status"];
            }

            return {
                id: room.id,
                number: room.roomNumber,
                name: room.name,
                type: room.type,
                status,
                price: Number(room.basePrice) || 0,
            };
        });
    } catch (error) {
        console.error("Error fetching hotel rooms:", error);
        return [];
    }
}

/**
 * Block a room for specific dates
 */
export async function blockRoom(
    roomId: string,
    startDate: string,
    endDate: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Generate all dates between start and end
        const dates: string[] = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        // Get room for price
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        // Upsert inventory for each date
        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(eq(roomInventory.roomId, roomId), eq(roomInventory.date, date)),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "BLOCKED", notes: reason || "Blocked by partner" })
                    .where(eq(roomInventory.id, existing.id));
            } else {
                await db.insert(roomInventory).values({
                    roomId,
                    date,
                    status: "BLOCKED",
                    price: room?.basePrice,
                    notes: reason || "Blocked by partner",
                });
            }
        }

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error blocking room:", error);
        return { success: false, error: "Failed to block room" };
    }
}

/**
 * Unblock a room for specific dates
 */
export async function unblockRoom(
    roomId: string,
    startDate: string,
    endDate: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(roomInventory)
            .set({ status: "AVAILABLE", notes: null })
            .where(
                and(
                    eq(roomInventory.roomId, roomId),
                    gte(roomInventory.date, startDate),
                    lte(roomInventory.date, endDate),
                    eq(roomInventory.status, "BLOCKED")
                )
            );

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error unblocking room:", error);
        return { success: false, error: "Failed to unblock room" };
    }
}

/**
 * Update room price for specific dates
 */
export async function updateRoomPrice(
    roomId: string,
    date: string,
    newPrice: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const existing = await db.query.roomInventory.findFirst({
            where: and(eq(roomInventory.roomId, roomId), eq(roomInventory.date, date)),
        });

        if (existing) {
            await db
                .update(roomInventory)
                .set({ price: newPrice.toString() })
                .where(eq(roomInventory.id, existing.id));
        } else {
            await db.insert(roomInventory).values({
                roomId,
                date,
                status: "AVAILABLE",
                price: newPrice.toString(),
            });
        }

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error updating room price:", error);
        return { success: false, error: "Failed to update price" };
    }
}
