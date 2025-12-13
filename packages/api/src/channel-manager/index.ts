/**
 * Channel Manager - Core Service
 *
 * Orchestrates all channel operations including connecting to OTAs,
 * syncing inventory/rates, and processing incoming bookings.
 */

import { db } from "@repo/db";
import {
    channelConnections,
    channelRoomMappings,
    syncLogs,
    bookings,
    roomInventory,
    rooms,
    type ChannelType,
    type ChannelConnection,
    type ChannelRoomMapping,
} from "@repo/db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import type {
    ChannelAdapter,
    ChannelCredentials,
    ExternalBooking,
    SyncResult,
    DateRange,
    InventoryUpdate,
    AdapterRegistry,
} from "./types";

// Import all adapters
import {
    agodaAdapter,
    bookingComAdapter,
    expediaAdapter,
    sharetripAdapter,
    gozayaanAdapter,
} from "./adapters/index";

// ====================
// ADAPTER REGISTRY
// ====================

const adapters: AdapterRegistry = {
    AGODA: agodaAdapter,
    BOOKING_COM: bookingComAdapter,
    EXPEDIA: expediaAdapter,
    SHARETRIP: sharetripAdapter,
    GOZAYAAN: gozayaanAdapter,
};

function getAdapter(channelType: ChannelType): ChannelAdapter {
    const adapter = adapters[channelType];
    if (!adapter) {
        throw new Error(`No adapter available for channel: ${channelType}`);
    }
    return adapter;
}

// ====================
// CONNECTION MANAGEMENT
// ====================

/**
 * Connect a hotel to an OTA channel
 */
export async function connectChannel(
    hotelId: string,
    channelType: ChannelType,
    credentials: ChannelCredentials
): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    try {
        const adapter = getAdapter(channelType);

        // Validate credentials with the OTA
        const validation = await adapter.validateCredentials(credentials);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errorMessage || "Invalid credentials",
            };
        }

        // Check if connection already exists
        const existing = await db
            .select()
            .from(channelConnections)
            .where(
                and(
                    eq(channelConnections.hotelId, hotelId),
                    eq(channelConnections.channelType, channelType)
                )
            )
            .limit(1);

        let connectionId: string;

        if (existing.length > 0) {
            // Update existing connection
            const [updated] = await db
                .update(channelConnections)
                .set({
                    apiCredentials: credentials,
                    externalPropertyId: validation.externalPropertyId,
                    isActive: true,
                    syncStatus: "IDLE",
                    syncError: null,
                    updatedAt: new Date(),
                })
                .where(eq(channelConnections.id, existing[0]!.id))
                .returning();
            connectionId = updated!.id;
        } else {
            // Create new connection
            const [created] = await db
                .insert(channelConnections)
                .values({
                    hotelId,
                    channelType,
                    apiCredentials: credentials,
                    externalPropertyId: validation.externalPropertyId,
                    isActive: true,
                    syncStatus: "IDLE",
                })
                .returning();
            connectionId = created!.id;
        }

        return { success: true, connectionId };
    } catch (error) {
        console.error("Error connecting channel:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Disconnect a hotel from an OTA channel
 */
export async function disconnectChannel(
    connectionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(channelConnections)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(channelConnections.id, connectionId));

        return { success: true };
    } catch (error) {
        console.error("Error disconnecting channel:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get all channel connections for a hotel
 */
export async function getChannelConnections(
    hotelId: string
): Promise<ChannelConnection[]> {
    return db
        .select()
        .from(channelConnections)
        .where(eq(channelConnections.hotelId, hotelId));
}

/**
 * Get room mappings for a channel connection
 */
export async function getRoomMappings(
    connectionId: string
): Promise<ChannelRoomMapping[]> {
    return db
        .select()
        .from(channelRoomMappings)
        .where(eq(channelRoomMappings.channelConnectionId, connectionId));
}

/**
 * Update room mappings for a channel connection
 */
export async function updateRoomMappings(
    connectionId: string,
    mappings: Array<{
        localRoomId: string;
        externalRoomTypeId: string;
        externalRatePlanId?: string;
    }>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Delete existing mappings
        await db
            .delete(channelRoomMappings)
            .where(eq(channelRoomMappings.channelConnectionId, connectionId));

        // Insert new mappings
        if (mappings.length > 0) {
            await db.insert(channelRoomMappings).values(
                mappings.map((m) => ({
                    channelConnectionId: connectionId,
                    localRoomId: m.localRoomId,
                    externalRoomTypeId: m.externalRoomTypeId,
                    externalRatePlanId: m.externalRatePlanId,
                }))
            );
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating room mappings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ====================
// INVENTORY SYNC
// ====================

/**
 * Sync inventory (availability) to an OTA channel
 */
export async function syncInventory(
    connectionId: string,
    dateRange: DateRange
): Promise<SyncResult> {
    const startTime = Date.now();

    try {
        // Get connection and validate
        const [connection] = await db
            .select()
            .from(channelConnections)
            .where(eq(channelConnections.id, connectionId))
            .limit(1);

        if (!connection || !connection.isActive) {
            return {
                success: false,
                operation: "PUSH_INVENTORY",
                errorMessage: "Connection not found or inactive",
            };
        }

        // Update sync status
        await db
            .update(channelConnections)
            .set({ syncStatus: "SYNCING", updatedAt: new Date() })
            .where(eq(channelConnections.id, connectionId));

        // Get room mappings
        const mappings = await getRoomMappings(connectionId);
        if (mappings.length === 0) {
            return {
                success: false,
                operation: "PUSH_INVENTORY",
                errorMessage: "No room mappings configured",
            };
        }

        const roomIds = mappings.map((m) => m.localRoomId);

        // Get inventory for the date range
        const inventory = await db
            .select()
            .from(roomInventory)
            .where(
                and(
                    inArray(roomInventory.roomId, roomIds),
                    gte(roomInventory.date, dateRange.startDate),
                    lte(roomInventory.date, dateRange.endDate)
                )
            );

        // Build inventory updates
        const updates: InventoryUpdate[] = [];
        for (const inv of inventory) {
            const mapping = mappings.find((m) => m.localRoomId === inv.roomId);
            if (mapping) {
                updates.push({
                    roomId: inv.roomId,
                    externalRoomTypeId: mapping.externalRoomTypeId,
                    date: inv.date,
                    available: inv.status === "AVAILABLE",
                    price: inv.price ? parseFloat(inv.price) : undefined,
                });
            }
        }

        // Push to OTA
        const adapter = getAdapter(connection.channelType as ChannelType);
        const result = await adapter.pushInventory(connection, mappings, updates);

        // Log the sync operation
        await db.insert(syncLogs).values({
            channelConnectionId: connectionId,
            operation: "PUSH_INVENTORY",
            status: result.success ? "SUCCESS" : "FAILED",
            requestPayload: { dateRange, updateCount: updates.length },
            responsePayload: result.rawResponse,
            errorMessage: result.errorMessage,
            affectedRooms: roomIds,
        });

        // Update connection status
        await db
            .update(channelConnections)
            .set({
                syncStatus: result.success ? "IDLE" : "ERROR",
                syncError: result.errorMessage,
                lastSyncAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(channelConnections.id, connectionId));

        return result;
    } catch (error) {
        console.error("Error syncing inventory:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        // Update connection status
        await db
            .update(channelConnections)
            .set({
                syncStatus: "ERROR",
                syncError: errorMessage,
                updatedAt: new Date(),
            })
            .where(eq(channelConnections.id, connectionId));

        return {
            success: false,
            operation: "PUSH_INVENTORY",
            errorMessage,
        };
    }
}

// ====================
// BOOKING SYNC
// ====================

/**
 * Pull new bookings from an OTA channel
 */
export async function pullBookings(
    connectionId: string,
    since: Date
): Promise<{ success: boolean; bookingsCreated: number; error?: string }> {
    try {
        // Get connection
        const [connection] = await db
            .select()
            .from(channelConnections)
            .where(eq(channelConnections.id, connectionId))
            .limit(1);

        if (!connection || !connection.isActive) {
            return {
                success: false,
                bookingsCreated: 0,
                error: "Connection not found or inactive",
            };
        }

        // Get room mappings
        const mappings = await getRoomMappings(connectionId);
        if (mappings.length === 0) {
            return {
                success: false,
                bookingsCreated: 0,
                error: "No room mappings configured",
            };
        }

        // Pull bookings from OTA
        const adapter = getAdapter(connection.channelType as ChannelType);
        const externalBookings = await adapter.pullBookings(connection, since);

        let bookingsCreated = 0;
        const createdIds: string[] = [];

        for (const extBooking of externalBookings) {
            // Find the local room mapping
            const mapping = mappings.find(
                (m) => m.externalRoomTypeId === extBooking.externalRoomTypeId
            );
            if (!mapping) {
                console.warn(
                    `No mapping found for external room type: ${extBooking.externalRoomTypeId}`
                );
                continue;
            }

            // Check if booking already exists
            const existing = await db
                .select()
                .from(bookings)
                .where(eq(bookings.externalBookingId, extBooking.externalBookingId))
                .limit(1);

            if (existing.length > 0) {
                // TODO: Handle booking modifications
                continue;
            }

            // Get room details for commission calculation
            const [room] = await db
                .select()
                .from(rooms)
                .where(eq(rooms.id, mapping.localRoomId))
                .limit(1);

            if (!room) continue;

            // Calculate nights
            const checkInDate = new Date(extBooking.checkIn);
            const checkOutDate = new Date(extBooking.checkOut);
            const numberOfNights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Create local booking
            const [created] = await db
                .insert(bookings)
                .values({
                    hotelId: connection.hotelId,
                    roomId: mapping.localRoomId,
                    checkIn: extBooking.checkIn,
                    checkOut: extBooking.checkOut,
                    numberOfNights,
                    guestCount: extBooking.guestCount,
                    guestName: extBooking.guestName,
                    guestPhone: extBooking.guestPhone || "N/A",
                    guestEmail: extBooking.guestEmail,
                    bookingSource: connection.channelType as ChannelType,
                    externalBookingId: extBooking.externalBookingId,
                    channelConnectionId: connectionId,
                    status: "CONFIRMED",
                    paymentStatus: "PAID", // OTA bookings are typically pre-paid
                    totalAmount: extBooking.totalAmount.toString(),
                    commissionAmount: "0", // OTA takes commission directly
                    netAmount: extBooking.totalAmount.toString(),
                    commissionStatus: "NOT_APPLICABLE",
                })
                .returning();

            createdIds.push(created!.id);
            bookingsCreated++;

            // Block inventory for these dates
            // TODO: Implement inventory blocking
        }

        // Log the sync operation
        await db.insert(syncLogs).values({
            channelConnectionId: connectionId,
            operation: "PULL_BOOKINGS",
            status: "SUCCESS",
            requestPayload: { since: since.toISOString() },
            responsePayload: { pullCount: externalBookings.length },
            bookingsCreated: createdIds,
        });

        return { success: true, bookingsCreated };
    } catch (error) {
        console.error("Error pulling bookings:", error);
        return {
            success: false,
            bookingsCreated: 0,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ====================
// WEBHOOK PROCESSING
// ====================

/**
 * Process an incoming webhook from an OTA
 */
export async function processWebhook(
    channelType: ChannelType,
    payload: unknown
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    try {
        const adapter = getAdapter(channelType);
        const externalBooking = adapter.parseWebhook(payload);

        if (!externalBooking) {
            return { success: false, error: "Invalid webhook payload" };
        }

        // Find the connection for this property
        const [connection] = await db
            .select()
            .from(channelConnections)
            .where(
                and(
                    eq(channelConnections.channelType, channelType),
                    eq(
                        channelConnections.externalPropertyId,
                        externalBooking.externalPropertyId
                    )
                )
            )
            .limit(1);

        if (!connection) {
            return { success: false, error: "No connection found for this property" };
        }

        // Process the booking (reuse pullBookings logic)
        const result = await pullBookings(connection.id, new Date(0));
        return {
            success: result.success,
            error: result.error,
        };
    } catch (error) {
        console.error("Error processing webhook:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// Export types for external use
export type { ChannelAdapter, ExternalBooking, SyncResult, DateRange } from "./types";
