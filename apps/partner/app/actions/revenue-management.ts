"use server";

import { db } from "@repo/db";
import { bookings, rooms } from "@repo/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { auth } from "../../auth";

// Types
export interface DemandForecast {
    date: string;
    predictedOccupancy: number; // 0-100%
    predictedDemand: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    suggestedPriceMultiplier: number; // 0.8 - 1.5
    events: string[]; // holidays, events affecting demand
    confidence: number; // 0-100%
}

export interface YieldRule {
    id: string;
    name: string;
    type: "OCCUPANCY_THRESHOLD" | "ADVANCE_BOOKING" | "DAY_OF_WEEK" | "SEASONAL";
    condition: {
        threshold?: number;
        daysInAdvance?: number;
        daysOfWeek?: number[];
        dateRange?: { start: string; end: string };
    };
    action: {
        priceAdjustment: number; // percentage: -20 to +50
        minStay?: number;
    };
    isActive: boolean;
    priority: number;
}

export interface OccupancyTrend {
    period: string;
    occupancy: number;
    revenue: number;
    bookings: number;
}

// Bangladesh holidays and events that affect hotel demand
const BD_EVENTS: { date: string; name: string; demandImpact: number }[] = [
    { date: "02-21", name: "ভাষা দিবস", demandImpact: 1.1 },
    { date: "03-26", name: "স্বাধীনতা দিবস", demandImpact: 1.3 },
    { date: "04-14", name: "পহেলা বৈশাখ", demandImpact: 1.5 },
    { date: "12-16", name: "বিজয় দিবস", demandImpact: 1.3 },
    // Eid dates vary - would need dynamic calculation
];

/**
 * Get demand forecast for next N days
 */
export async function getDemandForecast(
    hotelId: string,
    days: number = 30
): Promise<DemandForecast[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    const today = new Date();
    const forecasts: DemandForecast[] = [];

    // Get historical booking data for pattern analysis
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const historicalBookings = await db
        .select({
            checkIn: bookings.checkIn,
            count: count(),
        })
        .from(bookings)
        .where(
            and(
                eq(bookings.hotelId, hotelId),
                gte(bookings.checkIn, thirtyDaysAgo.toISOString().split("T")[0] || "")
            )
        )
        .groupBy(bookings.checkIn);

    // Get total room count
    const roomCount = await db
        .select({ count: count() })
        .from(rooms)
        .where(eq(rooms.hotelId, hotelId));

    const totalRooms = roomCount[0]?.count || 10;

    // Calculate average daily bookings
    const avgBookings = historicalBookings.length > 0
        ? historicalBookings.reduce((sum: number, b: { count: number }) => sum + Number(b.count), 0) / historicalBookings.length
        : totalRooms * 0.5;

    for (let i = 0; i < days; i++) {
        const forecastDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = forecastDate.toISOString().split("T")[0] || "";
        const monthDay = dateStr.slice(5); // "MM-DD"
        const dayOfWeek = forecastDate.getDay();

        // Base prediction factors
        let demandMultiplier = 1.0;
        const events: string[] = [];

        // Weekend boost (Friday, Saturday)
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            demandMultiplier *= 1.2;
            events.push("Weekend");
        }

        // Check for holidays
        const holiday = BD_EVENTS.find((e) => e.date === monthDay);
        if (holiday) {
            demandMultiplier *= holiday.demandImpact;
            events.push(holiday.name);
        }

        // Season adjustment (crude - would need more sophisticated model)
        const month = forecastDate.getMonth();
        if (month >= 10 || month <= 1) {
            // Nov-Feb = high season
            demandMultiplier *= 1.15;
            events.push("Peak Season");
        } else if (month >= 5 && month <= 8) {
            // June-Sept = monsoon low season
            demandMultiplier *= 0.85;
        }

        // Calculate predicted occupancy
        const predictedBookings = avgBookings * demandMultiplier;
        const predictedOccupancy = Math.min(100, Math.round((predictedBookings / totalRooms) * 100));

        // Determine demand level
        let predictedDemand: DemandForecast["predictedDemand"] = "MEDIUM";
        if (predictedOccupancy >= 85) predictedDemand = "VERY_HIGH";
        else if (predictedOccupancy >= 70) predictedDemand = "HIGH";
        else if (predictedOccupancy >= 50) predictedDemand = "MEDIUM";
        else predictedDemand = "LOW";

        // Calculate price multiplier suggestion
        let suggestedPriceMultiplier = 1.0;
        if (predictedDemand === "VERY_HIGH") suggestedPriceMultiplier = 1.3;
        else if (predictedDemand === "HIGH") suggestedPriceMultiplier = 1.15;
        else if (predictedDemand === "LOW") suggestedPriceMultiplier = 0.9;

        // Confidence is lower for further out predictions
        const confidence = Math.max(50, 95 - i * 1.5);

        forecasts.push({
            date: dateStr,
            predictedOccupancy,
            predictedDemand,
            suggestedPriceMultiplier,
            events,
            confidence: Math.round(confidence),
        });
    }

    return forecasts;
}

/**
 * Get yield management rules
 */
export async function getYieldRules(_hotelId: string): Promise<YieldRule[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // In real implementation, fetch from database
    // Return sample rules
    return [
        {
            id: "yr-1",
            name: "High Occupancy Surge",
            type: "OCCUPANCY_THRESHOLD",
            condition: { threshold: 80 },
            action: { priceAdjustment: 20 },
            isActive: true,
            priority: 1,
        },
        {
            id: "yr-2",
            name: "Last Minute Discount",
            type: "ADVANCE_BOOKING",
            condition: { daysInAdvance: 1 },
            action: { priceAdjustment: -10 },
            isActive: true,
            priority: 2,
        },
        {
            id: "yr-3",
            name: "Weekend Premium",
            type: "DAY_OF_WEEK",
            condition: { daysOfWeek: [5, 6] }, // Friday, Saturday
            action: { priceAdjustment: 15 },
            isActive: true,
            priority: 3,
        },
        {
            id: "yr-4",
            name: "Peak Season Rate",
            type: "SEASONAL",
            condition: { dateRange: { start: "11-01", end: "02-28" } },
            action: { priceAdjustment: 25, minStay: 2 },
            isActive: false,
            priority: 4,
        },
    ];
}

/**
 * Create or update yield rule
 */
export async function saveYieldRule(
    hotelId: string,
    rule: Omit<YieldRule, "id"> | YieldRule
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Saving yield rule:", hotelId, rule);
    return { success: true };
}

/**
 * Toggle yield rule active status
 */
export async function toggleYieldRule(
    ruleId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Toggling yield rule:", ruleId);
    return { success: true };
}

/**
 * Delete yield rule
 */
export async function deleteYieldRule(
    ruleId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Deleting yield rule:", ruleId);
    return { success: true };
}

/**
 * Get occupancy trends for analysis
 */
export async function getOccupancyTrends(
    hotelId: string,
    period: "week" | "month" | "quarter" = "month"
): Promise<OccupancyTrend[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // Generate sample trend data
    const trends: OccupancyTrend[] = [];
    const periods = period === "week" ? 7 : period === "month" ? 30 : 90;

    for (let i = periods - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getDay();
        
        // Simulate realistic occupancy patterns
        let baseOccupancy = 55 + Math.random() * 20;
        if (dayOfWeek === 5 || dayOfWeek === 6) baseOccupancy += 15;
        
        trends.push({
            period: date.toISOString().split("T")[0] || "",
            occupancy: Math.round(baseOccupancy),
            revenue: Math.round(baseOccupancy * 1200 + Math.random() * 5000),
            bookings: Math.round(baseOccupancy / 10),
        });
    }

    return trends;
}

/**
 * Apply AI pricing recommendation for a date
 */
export async function applyForecastPrice(
    hotelId: string,
    date: string,
    multiplier: number
): Promise<{ success: boolean; error?: string; roomsUpdated: number }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated", roomsUpdated: 0 };
    }

    // In real implementation:
    // 1. Get all rooms for hotel
    // 2. Calculate new price = basePrice * multiplier
    // 3. Update room_inventory for that date

    console.log("Applying forecast price:", hotelId, date, multiplier);
    return { success: true, roomsUpdated: 5 };
}
