"use server";

import { auth } from "../../auth";
import { db, rooms, channelConnections, channelRoomMappings } from "@repo/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPartnerHotel } from "./dashboard";
import {
    connectChannel as cmConnectChannel,
    disconnectChannel as cmDisconnectChannel,
    getChannelConnections as cmGetChannelConnections,
    getRoomMappings as cmGetRoomMappings,
    updateRoomMappings as cmUpdateRoomMappings,
    syncInventory,
    pullBookings as cmPullBookings,
} from "@repo/api";

/**
 * Get the partner's hotel ID
 */
async function getPartnerHotelId(): Promise<string | null> {
    const hotel = await getPartnerHotel();
    return hotel?.id ?? null;
}

/**
 * Get all channel connections for the partner's hotel
 */
export async function getChannelConnections() {
    const hotelId = await getPartnerHotelId();
    if (!hotelId) return [];

    return await cmGetChannelConnections(hotelId);
}

/**
 * Get all rooms for mapping
 */
export async function getHotelRooms() {
    const hotelId = await getPartnerHotelId();
    if (!hotelId) return [];

    return await db
        .select({
            id: rooms.id,
            name: rooms.name,
            roomType: rooms.type,
            roomNumber: rooms.roomNumber,
        })
        .from(rooms)
        .where(eq(rooms.hotelId, hotelId));
}

/**
 * Get room mappings for a connection
 */
export async function getRoomMappings(connectionId: string) {
    return await cmGetRoomMappings(connectionId);
}

/**
 * Connect to an OTA channel
 */
export async function connectChannel(
    channelType: "BOOKING_COM" | "EXPEDIA" | "AGODA" | "SHARETRIP" | "GOZAYAAN",
    credentials: {
        apiKey?: string;
        apiSecret?: string;
        propertyId?: string;
    }
) {
    const hotelId = await getPartnerHotelId();
    if (!hotelId) {
        return { success: false, error: "Hotel not found" };
    }

    const result = await cmConnectChannel(hotelId, channelType, credentials);

    if (result.success) {
        revalidatePath("/channels");
    }

    return result;
}

/**
 * Disconnect from an OTA channel
 */
export async function disconnectChannel(connectionId: string) {
    const result = await cmDisconnectChannel(connectionId);

    if (result.success) {
        revalidatePath("/channels");
    }

    return result;
}

/**
 * Update room mappings for a channel
 */
export async function updateRoomMappings(
    connectionId: string,
    mappings: Array<{
        localRoomId: string;
        externalRoomTypeId: string;
        externalRatePlanId?: string;
    }>
) {
    const result = await cmUpdateRoomMappings(connectionId, mappings);

    if (result.success) {
        revalidatePath("/channels");
    }

    return result;
}

/**
 * Trigger manual sync for a channel
 */
export async function syncChannel(connectionId: string) {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 365); // Sync 1 year ahead

    const result = await syncInventory(connectionId, {
        startDate: today.toISOString().split("T")[0]!,
        endDate: endDate.toISOString().split("T")[0]!,
    });

    revalidatePath("/channels");
    return result;
}

/**
 * Pull bookings from a channel
 */
export async function pullChannelBookings(connectionId: string) {
    // Pull bookings from the last 7 days to catch any missed bookings
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const result = await cmPullBookings(connectionId, since);

    if (result.success) {
        revalidatePath("/channels");
        revalidatePath("/bookings");
    }

    return result;
}
