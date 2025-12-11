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

export interface NewRoomInput {
    hotelId: string;
    roomNumber: string;
    name: string;
    type: "SINGLE" | "DOUBLE" | "SUITE" | "DORMITORY";
    basePrice: number;
    maxGuests: number;
    description?: string;
    amenities?: string[];
    photos?: string[];
}

/**
 * Add a new room to the hotel
 */
export async function addRoom(
    input: NewRoomInput
): Promise<{ success: boolean; roomId?: string; error?: string }> {
    try {
        // Check if room number already exists for this hotel
        const existingRoom = await db.query.rooms.findFirst({
            where: and(
                eq(rooms.hotelId, input.hotelId),
                eq(rooms.roomNumber, input.roomNumber)
            ),
        });

        if (existingRoom) {
            return { success: false, error: "Room number already exists" };
        }

        const [newRoom] = await db
            .insert(rooms)
            .values({
                hotelId: input.hotelId,
                roomNumber: input.roomNumber,
                name: input.name,
                type: input.type,
                basePrice: input.basePrice.toString(),
                maxGuests: input.maxGuests,
                description: input.description,
                amenities: input.amenities || [],
                photos: input.photos || [],
            })
            .returning({ id: rooms.id });

        revalidatePath("/inventory");
        revalidatePath("/");
        return { success: true, roomId: newRoom?.id };
    } catch (error) {
        console.error("Error adding room:", error);
        return { success: false, error: "Failed to add room" };
    }
}

export interface UpdateRoomInput {
    roomId: string;
    roomNumber?: string;
    name?: string;
    type?: "SINGLE" | "DOUBLE" | "SUITE" | "DORMITORY";
    basePrice?: number;
    maxGuests?: number;
    description?: string;
    amenities?: string[];
    photos?: string[];
}

/**
 * Update an existing room
 */
export async function updateRoom(
    input: UpdateRoomInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const existingRoom = await db.query.rooms.findFirst({
            where: eq(rooms.id, input.roomId),
        });

        if (!existingRoom) {
            return { success: false, error: "Room not found" };
        }

        // Check if new room number conflicts with another room
        if (input.roomNumber && input.roomNumber !== existingRoom.roomNumber) {
            const conflictingRoom = await db.query.rooms.findFirst({
                where: and(
                    eq(rooms.hotelId, existingRoom.hotelId),
                    eq(rooms.roomNumber, input.roomNumber)
                ),
            });

            if (conflictingRoom) {
                return { success: false, error: "Room number already exists" };
            }
        }

        await db
            .update(rooms)
            .set({
                ...(input.roomNumber && { roomNumber: input.roomNumber }),
                ...(input.name && { name: input.name }),
                ...(input.type && { type: input.type }),
                ...(input.basePrice !== undefined && { basePrice: input.basePrice.toString() }),
                ...(input.maxGuests !== undefined && { maxGuests: input.maxGuests }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.amenities && { amenities: input.amenities }),
                ...(input.photos && { photos: input.photos }),
                updatedAt: new Date(),
            })
            .where(eq(rooms.id, input.roomId));

        revalidatePath("/inventory");
        revalidatePath("/inventory/rooms");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error updating room:", error);
        return { success: false, error: "Failed to update room" };
    }
}

/**
 * Request room removal (admin must approve)
 * Sets a removal request flag on the room
 */
export async function requestRoomRemoval(
    roomId: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // We'll use the room's description field temporarily to store removal request
        // In a full implementation, you'd have a separate requests table
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        // Mark room with removal request by prefixing description
        const removalNote = `[REMOVAL_REQUESTED: ${reason || "No reason provided"}] `;
        const newDescription = room.description?.startsWith("[REMOVAL_REQUESTED")
            ? room.description
            : removalNote + (room.description || "");

        await db
            .update(rooms)
            .set({
                description: newDescription,
            })
            .where(eq(rooms.id, roomId));

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error requesting room removal:", error);
        return { success: false, error: "Failed to request room removal" };
    }
}

/**
 * Cancel room removal request
 */
export async function cancelRoomRemovalRequest(
    roomId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return { success: false, error: "Room not found" };
        }

        // Remove the removal request prefix from description
        const newDescription = room.description?.replace(/^\[REMOVAL_REQUESTED:.*?\]\s*/, "") || "";

        await db
            .update(rooms)
            .set({ description: newDescription })
            .where(eq(rooms.id, roomId));

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error canceling room removal request:", error);
        return { success: false, error: "Failed to cancel request" };
    }
}


/**
 * Get all rooms including inactive ones for management
 */
export async function getAllHotelRooms(hotelId: string) {
    try {
        const hotelRooms = await db.query.rooms.findMany({
            where: eq(rooms.hotelId, hotelId),
            orderBy: rooms.roomNumber,
        });

        return hotelRooms;
    } catch (error) {
        console.error("Error fetching all hotel rooms:", error);
        return [];
    }
}
