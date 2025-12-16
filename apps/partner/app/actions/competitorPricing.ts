"use server";

import { auth } from "../../auth";
import { db, competitorHotels, competitorRates, priceRecommendations, hotels, rooms } from "@repo/db";
import { eq, and, desc, gte, sql, avg } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================
// Types
// ==================

export type PricePosition = "LOWEST" | "BELOW_AVERAGE" | "AVERAGE" | "ABOVE_AVERAGE" | "HIGHEST";

interface Competitor {
    id: string;
    name: string;
    starRating: number | null;
    avgRating: string | null;
    distance: string | null;
    latestRate: string | null;
    rateDate: Date | null;
}

interface PriceComparison {
    yourPrice: number;
    competitorMin: number;
    competitorMax: number;
    competitorAvg: number;
    position: PricePosition;
    percentageDiff: number;
}

interface Recommendation {
    id: string;
    date: Date;
    roomType: string | null;
    currentPrice: string;
    recommendedPrice: string;
    pricePosition: PricePosition | null;
    reasoning: string | null;
    isApplied: string;
}

// ==================
// Get Functions
// ==================

/**
 * Get all competitors for the partner's hotel
 */
export async function getCompetitors(): Promise<Competitor[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return [];

    const competitors = await db.query.competitorHotels.findMany({
        where: and(
            eq(competitorHotels.hotelId, hotel.id),
            eq(competitorHotels.isActive, "true")
        ),
        orderBy: competitorHotels.name,
    });

    // Get latest rates for each competitor
    const result: Competitor[] = [];

    for (const comp of competitors) {
        const latestRate = await db.query.competitorRates.findFirst({
            where: eq(competitorRates.competitorId, comp.id),
            orderBy: desc(competitorRates.fetchedAt),
        });

        result.push({
            id: comp.id,
            name: comp.name,
            starRating: comp.starRating,
            avgRating: comp.avgRating,
            distance: comp.distance,
            latestRate: latestRate?.rate || null,
            rateDate: latestRate?.checkInDate || null,
        });
    }

    return result;
}

/**
 * Get price comparison for today
 */
export async function getPriceComparison(): Promise<PriceComparison | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return null;

    // Get hotel's average room price
    const hotelRooms = await db.query.rooms.findMany({
        where: eq(rooms.hotelId, hotel.id),
    });

    if (hotelRooms.length === 0) return null;

    const yourPrice = hotelRooms.reduce((sum: number, r: typeof hotelRooms[number]) => sum + Number(r.basePrice), 0) / hotelRooms.length;

    // Get competitor rates for today/upcoming
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const competitors = await db.query.competitorHotels.findMany({
        where: eq(competitorHotels.hotelId, hotel.id),
    });

    if (competitors.length === 0) {
        return {
            yourPrice,
            competitorMin: 0,
            competitorMax: 0,
            competitorAvg: 0,
            position: "AVERAGE",
            percentageDiff: 0,
        };
    }

    const rates = await db.query.competitorRates.findMany({
        where: and(
            sql`${competitorRates.competitorId} IN (${sql.join(competitors.map((c: typeof competitors[number]) => sql`${c.id}`), sql`, `)})`,
            gte(competitorRates.checkInDate, today)
        ),
    });

    if (rates.length === 0) {
        return {
            yourPrice,
            competitorMin: 0,
            competitorMax: 0,
            competitorAvg: 0,
            position: "AVERAGE",
            percentageDiff: 0,
        };
    }

    const rateValues = rates.map((r: typeof rates[number]) => parseFloat(r.rate));
    const competitorMin = Math.min(...rateValues);
    const competitorMax = Math.max(...rateValues);
    const competitorAvg = rateValues.reduce((a: number, b: number) => a + b, 0) / rateValues.length;

    // Determine position
    let position: PricePosition;
    const percentageDiff = ((yourPrice - competitorAvg) / competitorAvg) * 100;

    if (yourPrice <= competitorMin) {
        position = "LOWEST";
    } else if (percentageDiff <= -10) {
        position = "BELOW_AVERAGE";
    } else if (percentageDiff <= 10) {
        position = "AVERAGE";
    } else if (yourPrice >= competitorMax) {
        position = "HIGHEST";
    } else {
        position = "ABOVE_AVERAGE";
    }

    return {
        yourPrice,
        competitorMin,
        competitorMax,
        competitorAvg,
        position,
        percentageDiff,
    };
}

/**
 * Get pricing recommendations
 */
export async function getPricingRecommendations(): Promise<Recommendation[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recommendations = await db.query.priceRecommendations.findMany({
        where: and(
            eq(priceRecommendations.hotelId, hotel.id),
            gte(priceRecommendations.date, today)
        ),
        orderBy: priceRecommendations.date,
    });

    return recommendations.map((r: typeof recommendations[number]) => ({
        id: r.id,
        date: r.date,
        roomType: r.roomType,
        currentPrice: r.currentPrice,
        recommendedPrice: r.recommendedPrice,
        pricePosition: r.pricePosition as PricePosition | null,
        reasoning: r.reasoning,
        isApplied: r.isApplied,
    }));
}

/**
 * Get pricing stats
 */
export async function getPricingStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return null;

    const competitors = await db.query.competitorHotels.findMany({
        where: eq(competitorHotels.hotelId, hotel.id),
    });

    const comparison = await getPriceComparison();
    const recommendations = await getPricingRecommendations();

    return {
        competitorCount: competitors.length,
        position: comparison?.position || "AVERAGE",
        percentageDiff: comparison?.percentageDiff || 0,
        pendingRecommendations: recommendations.filter((r: typeof recommendations[number]) => r.isApplied === "false").length,
    };
}

// ==================
// Competitor Management
// ==================

/**
 * Add a competitor hotel
 */
export async function addCompetitor(data: {
    name: string;
    address?: string;
    starRating?: number;
    externalUrl?: string;
}): Promise<{ success: boolean; competitorId?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) {
        return { success: false, error: "Hotel not found" };
    }

    try {
        const [competitor] = await db
            .insert(competitorHotels)
            .values({
                hotelId: hotel.id,
                name: data.name,
                address: data.address,
                starRating: data.starRating,
                externalUrl: data.externalUrl,
                source: "MANUAL",
            })
            .returning({ id: competitorHotels.id });

        revalidatePath("/pricing");
        return { success: true, competitorId: competitor?.id };
    } catch (error) {
        console.error("Error adding competitor:", error);
        return { success: false, error: "Failed to add competitor" };
    }
}

/**
 * Remove a competitor
 */
export async function removeCompetitor(
    competitorId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db
            .update(competitorHotels)
            .set({ isActive: "false", updatedAt: new Date() })
            .where(eq(competitorHotels.id, competitorId));

        revalidatePath("/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error removing competitor:", error);
        return { success: false, error: "Failed to remove competitor" };
    }
}

/**
 * Add a rate for a competitor (manual entry)
 */
export async function addCompetitorRate(data: {
    competitorId: string;
    checkInDate: Date;
    rate: number;
    roomType?: string;
}): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.insert(competitorRates).values({
            competitorId: data.competitorId,
            checkInDate: data.checkInDate,
            rate: data.rate.toString(),
            roomType: data.roomType,
            source: "MANUAL",
        });

        revalidatePath("/pricing");
        return { success: true };
    } catch (error) {
        console.error("Error adding rate:", error);
        return { success: false, error: "Failed to add rate" };
    }
}
