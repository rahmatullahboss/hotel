"use server";

import { db, channelConnections, syncLogs, hotels } from "@repo/db";
import { eq, desc, sql, and } from "drizzle-orm";

/**
 * Get all channel connections across all hotels (admin view)
 */
export async function getAllChannelConnections() {
    const connections = await db
        .select({
            id: channelConnections.id,
            hotelId: channelConnections.hotelId,
            hotelName: hotels.name,
            hotelCity: hotels.city,
            channelType: channelConnections.channelType,
            isActive: channelConnections.isActive,
            lastSyncAt: channelConnections.lastSyncAt,
            syncStatus: channelConnections.syncStatus,
            syncError: channelConnections.syncError,
            externalPropertyId: channelConnections.externalPropertyId,
            createdAt: channelConnections.createdAt,
        })
        .from(channelConnections)
        .innerJoin(hotels, eq(hotels.id, channelConnections.hotelId))
        .orderBy(desc(channelConnections.createdAt));

    return connections;
}

/**
 * Get channel sync statistics
 */
export async function getChannelStats() {
    const stats = await db
        .select({
            totalConnections: sql<number>`count(*)`,
            activeConnections: sql<number>`count(*) filter (where ${channelConnections.isActive} = true)`,
            errorConnections: sql<number>`count(*) filter (where ${channelConnections.syncStatus} = 'ERROR')`,
            syncingConnections: sql<number>`count(*) filter (where ${channelConnections.syncStatus} = 'SYNCING')`,
        })
        .from(channelConnections);

    const byChannel = await db
        .select({
            channelType: channelConnections.channelType,
            count: sql<number>`count(*)`,
            activeCount: sql<number>`count(*) filter (where ${channelConnections.isActive} = true)`,
        })
        .from(channelConnections)
        .groupBy(channelConnections.channelType);

    return {
        total: Number(stats[0]?.totalConnections) || 0,
        active: Number(stats[0]?.activeConnections) || 0,
        errors: Number(stats[0]?.errorConnections) || 0,
        syncing: Number(stats[0]?.syncingConnections) || 0,
        byChannel,
    };
}

/**
 * Get recent sync logs across all channels
 */
export async function getRecentSyncLogs(limit = 50) {
    const logs = await db
        .select({
            id: syncLogs.id,
            connectionId: syncLogs.connectionId,
            hotelName: hotels.name,
            channelType: channelConnections.channelType,
            syncType: syncLogs.syncType,
            status: syncLogs.status,
            itemsSynced: syncLogs.itemsSynced,
            errorMessage: syncLogs.errorMessage,
            startedAt: syncLogs.startedAt,
            completedAt: syncLogs.completedAt,
        })
        .from(syncLogs)
        .innerJoin(channelConnections, eq(channelConnections.id, syncLogs.connectionId))
        .innerJoin(hotels, eq(hotels.id, channelConnections.hotelId))
        .orderBy(desc(syncLogs.startedAt))
        .limit(limit);

    return logs;
}

/**
 * Force sync a specific connection (admin override)
 */
export async function adminForceSyncChannel(connectionId: string) {
    const { channelManager } = await import("@repo/api");

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const result = await channelManager.syncInventory(connectionId, {
        startDate: today.toISOString().split("T")[0]!,
        endDate: endDate.toISOString().split("T")[0]!,
    });

    return result;
}

/**
 * Toggle connection active status (admin)
 */
export async function adminToggleConnection(connectionId: string, isActive: boolean) {
    await db
        .update(channelConnections)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(channelConnections.id, connectionId));

    return { success: true };
}
