/**
 * Channel Sync Cron Job
 * 
 * Periodically syncs inventory with all active OTA channels.
 * Run via Vercel Cron or external scheduler (every 15-30 minutes recommended).
 * 
 * Endpoint: POST /api/cron/sync-channels
 * 
 * Expected CRON_SECRET header for authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, channelConnections, hotels } from "@repo/db";
import { eq, and } from "drizzle-orm";
import { channelManager } from "@repo/api";

// Vercel Cron configuration
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

export async function GET(request: NextRequest) {
    // For Vercel Cron - verify the request
    const authHeader = request.headers.get("authorization");

    // In production, verify CRON_SECRET
    if (process.env.NODE_ENV === "production") {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    return syncAllChannels();
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
    // Verify admin/system access in production
    const authHeader = request.headers.get("authorization");

    if (process.env.NODE_ENV === "production") {
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    return syncAllChannels();
}

async function syncAllChannels() {
    const startTime = Date.now();
    const results: {
        connectionId: string;
        hotelName: string;
        channel: string;
        inventorySync: { success: boolean; error?: string };
        bookingsPulled: number;
    }[] = [];

    try {
        // Get all active channel connections
        const connections = await db
            .select({
                id: channelConnections.id,
                hotelId: channelConnections.hotelId,
                channelType: channelConnections.channelType,
                hotelName: hotels.name,
            })
            .from(channelConnections)
            .innerJoin(hotels, eq(hotels.id, channelConnections.hotelId))
            .where(
                and(
                    eq(channelConnections.isActive, true),
                    eq(hotels.status, "ACTIVE")
                )
            );

        console.log(`[Sync] Found ${connections.length} active channel connections`);

        // Process each connection
        for (const conn of connections) {
            console.log(`[Sync] Processing ${conn.channelType} for ${conn.hotelName}`);

            const result: (typeof results)[number] = {
                connectionId: conn.id,
                hotelName: conn.hotelName,
                channel: conn.channelType,
                inventorySync: { success: false },
                bookingsPulled: 0,
            };

            try {
                // Sync inventory (push availability to OTA)
                const today = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + 90); // Sync 90 days ahead

                const inventoryResult = await channelManager.syncInventory(conn.id, {
                    startDate: today.toISOString().split("T")[0]!,
                    endDate: endDate.toISOString().split("T")[0]!,
                });

                result.inventorySync = {
                    success: inventoryResult.success,
                    error: inventoryResult.errorMessage,
                };

                // Pull new bookings (from last 24 hours)
                const since = new Date();
                since.setHours(since.getHours() - 24);

                const bookingsResult = await channelManager.pullBookings(conn.id, since);
                result.bookingsPulled = bookingsResult.bookingsCreated;

            } catch (error) {
                console.error(`[Sync] Error for ${conn.channelType}:`, error);
                result.inventorySync = {
                    success: false,
                    error: error instanceof Error ? error.message : "Unknown error",
                };
            }

            results.push(result);
        }

        const duration = Date.now() - startTime;
        const successCount = results.filter((r) => r.inventorySync.success).length;
        const totalBookings = results.reduce((sum, r) => sum + r.bookingsPulled, 0);

        console.log(`[Sync] Completed in ${duration}ms - ${successCount}/${results.length} successful, ${totalBookings} new bookings`);

        return NextResponse.json({
            success: true,
            summary: {
                totalConnections: results.length,
                successfulSyncs: successCount,
                failedSyncs: results.length - successCount,
                totalNewBookings: totalBookings,
                durationMs: duration,
            },
            results,
        });

    } catch (error) {
        console.error("[Sync] Cron job error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
