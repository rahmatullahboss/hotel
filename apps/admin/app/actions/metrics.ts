"use server";

import { db } from "@repo/db";
import { bookings, hotels, hotelMetrics } from "@repo/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

/**
 * Get or create hotel metrics record
 */
export async function getHotelMetrics(hotelId: string) {
    let metrics = await db.query.hotelMetrics.findFirst({
        where: eq(hotelMetrics.hotelId, hotelId),
    });

    if (!metrics) {
        const [newMetrics] = await db
            .insert(hotelMetrics)
            .values({ hotelId })
            .returning();
        metrics = newMetrics!;
    }

    return metrics;
}

/**
 * Update hotel metrics when booking is cancelled
 * Detects suspicious patterns and adds red flags
 */
export async function trackCancellation(hotelId: string) {
    const metrics = await getHotelMetrics(hotelId);

    const newCancellations = metrics.totalCancellations + 1;
    const newTotal = metrics.totalBookings;
    const cancellationRate = newTotal > 0 ? (newCancellations / newTotal) * 100 : 0;

    // Red flag if cancellation rate > 30%
    let newRedFlags = metrics.redFlags;
    let lastRedFlagDate = metrics.lastRedFlagDate;
    let searchRankPenalty = metrics.searchRankPenalty;

    if (cancellationRate > 30 && newTotal >= 5) {
        // Only add red flag once per week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        if (!lastRedFlagDate || new Date(lastRedFlagDate) < oneWeekAgo) {
            newRedFlags += 1;
            lastRedFlagDate = new Date();
            searchRankPenalty = Math.min(searchRankPenalty + 5, 50); // Max 50 penalty
        }
    }

    await db
        .update(hotelMetrics)
        .set({
            totalCancellations: newCancellations,
            cancellationRate: cancellationRate.toFixed(2),
            redFlags: newRedFlags,
            lastRedFlagDate,
            searchRankPenalty,
            updatedAt: new Date(),
        })
        .where(eq(hotelMetrics.id, metrics.id));
}

/**
 * Track new booking
 */
export async function trackBooking(hotelId: string) {
    const metrics = await getHotelMetrics(hotelId);

    await db
        .update(hotelMetrics)
        .set({
            totalBookings: metrics.totalBookings + 1,
            updatedAt: new Date(),
        })
        .where(eq(hotelMetrics.id, metrics.id));
}

/**
 * Track walk-in registration
 */
export async function trackWalkIn(hotelId: string) {
    const metrics = await getHotelMetrics(hotelId);

    await db
        .update(hotelMetrics)
        .set({
            totalWalkIns: metrics.totalWalkIns + 1,
            updatedAt: new Date(),
        })
        .where(eq(hotelMetrics.id, metrics.id));
}

/**
 * Get hotels with red flags for admin dashboard
 */
export async function getHotelsWithRedFlags() {
    const flaggedHotels = await db
        .select({
            hotelId: hotelMetrics.hotelId,
            hotelName: hotels.name,
            totalBookings: hotelMetrics.totalBookings,
            totalCancellations: hotelMetrics.totalCancellations,
            totalWalkIns: hotelMetrics.totalWalkIns,
            cancellationRate: hotelMetrics.cancellationRate,
            redFlags: hotelMetrics.redFlags,
            lastRedFlagDate: hotelMetrics.lastRedFlagDate,
            searchRankPenalty: hotelMetrics.searchRankPenalty,
        })
        .from(hotelMetrics)
        .leftJoin(hotels, eq(hotels.id, hotelMetrics.hotelId))
        .where(gte(hotelMetrics.redFlags, 1))
        .orderBy(sql`${hotelMetrics.redFlags} DESC`);

    return flaggedHotels;
}

/**
 * Get all hotel metrics for admin
 */
export async function getAllHotelMetrics() {
    return db
        .select({
            hotelId: hotelMetrics.hotelId,
            hotelName: hotels.name,
            totalBookings: hotelMetrics.totalBookings,
            totalCancellations: hotelMetrics.totalCancellations,
            totalWalkIns: hotelMetrics.totalWalkIns,
            cancellationRate: hotelMetrics.cancellationRate,
            redFlags: hotelMetrics.redFlags,
            searchRankPenalty: hotelMetrics.searchRankPenalty,
        })
        .from(hotelMetrics)
        .leftJoin(hotels, eq(hotels.id, hotelMetrics.hotelId))
        .orderBy(sql`${hotelMetrics.totalBookings} DESC`);
}
