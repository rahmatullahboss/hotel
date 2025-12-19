"use server";

import { db, bookings, users } from "@repo/db";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { getPartnerRole } from "./getPartnerRole";

// ====================
// TYPES
// ====================

export interface RiskFactor {
    name: string;
    weight: number;
    value: boolean;
    description: string;
}

export interface BookingRiskScore {
    bookingId: string;
    guestName: string;
    guestPhone: string;
    checkIn: string;
    roomNumber: string;
    roomName: string;
    totalAmount: number;
    advancePaid: number;
    riskScore: number; // 0-100
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    riskFactors: RiskFactor[];
    suggestedActions: string[];
}

// ====================
// RISK CALCULATION
// ====================

/**
 * Calculate no-show risk score based on rule-based factors
 * Returns a score from 0-100 where higher = more likely to no-show
 */
function calculateRiskScore(params: {
    isFirstTimeGuest: boolean;
    leadDays: number; // Days between booking and check-in
    advancePercentage: number; // 0-100
    isPayAtHotel: boolean;
    previousNoShowRate: number; // 0-100
    isWeekend: boolean;
    isHoliday: boolean;
    bookingSource: string;
}): { score: number; factors: RiskFactor[] } {
    const factors: RiskFactor[] = [];
    let totalWeight = 0;
    let riskPoints = 0;

    // Factor 1: First-time guest (weight: 15)
    const firstTimeWeight = 15;
    totalWeight += firstTimeWeight;
    if (params.isFirstTimeGuest) {
        riskPoints += firstTimeWeight;
        factors.push({
            name: "First-time Guest",
            weight: firstTimeWeight,
            value: true,
            description: "Guest has no booking history with your hotel",
        });
    }

    // Factor 2: Long lead time (weight: 10)
    const leadTimeWeight = 10;
    totalWeight += leadTimeWeight;
    if (params.leadDays > 30) {
        riskPoints += leadTimeWeight;
        factors.push({
            name: "Long Lead Time",
            weight: leadTimeWeight,
            value: true,
            description: `Booked ${params.leadDays} days in advance (>30 days increases no-show risk)`,
        });
    } else if (params.leadDays > 14) {
        riskPoints += leadTimeWeight * 0.5;
        factors.push({
            name: "Moderate Lead Time",
            weight: leadTimeWeight * 0.5,
            value: true,
            description: `Booked ${params.leadDays} days in advance`,
        });
    }

    // Factor 3: No advance payment (weight: 30)
    const advanceWeight = 30;
    totalWeight += advanceWeight;
    if (params.advancePercentage === 0) {
        riskPoints += advanceWeight;
        factors.push({
            name: "No Advance Payment",
            weight: advanceWeight,
            value: true,
            description: "No deposit collected - highest no-show risk factor",
        });
    } else if (params.advancePercentage < 30) {
        riskPoints += advanceWeight * 0.5;
        factors.push({
            name: "Low Advance Payment",
            weight: advanceWeight * 0.5,
            value: true,
            description: `Only ${params.advancePercentage}% advance collected`,
        });
    }

    // Factor 4: Pay at hotel booking (weight: 20)
    const payAtHotelWeight = 20;
    totalWeight += payAtHotelWeight;
    if (params.isPayAtHotel) {
        riskPoints += payAtHotelWeight;
        factors.push({
            name: "Pay at Hotel",
            weight: payAtHotelWeight,
            value: true,
            description: "Guest chose 'Pay at Hotel' option",
        });
    }

    // Factor 5: Previous no-show history (weight: 25)
    const historyWeight = 25;
    totalWeight += historyWeight;
    if (params.previousNoShowRate > 0) {
        const historyRisk = (params.previousNoShowRate / 100) * historyWeight;
        riskPoints += historyRisk;
        factors.push({
            name: "Previous No-Show History",
            weight: historyRisk,
            value: true,
            description: `Guest has ${params.previousNoShowRate}% no-show rate in past bookings`,
        });
    }

    // Calculate final score as percentage
    const score = Math.min(100, Math.round((riskPoints / totalWeight) * 100));

    return { score, factors: factors.filter((f) => f.value) };
}

/**
 * Determine risk level from score
 */
function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" {
    if (score >= 60) return "HIGH";
    if (score >= 30) return "MEDIUM";
    return "LOW";
}

/**
 * Generate suggested actions based on risk factors
 */
function getSuggestedActions(factors: RiskFactor[], advancePaid: number): string[] {
    const actions: string[] = [];

    const hasNoAdvance = factors.some((f) => f.name.includes("No Advance") || f.name.includes("Low Advance"));
    const isPayAtHotel = factors.some((f) => f.name === "Pay at Hotel");
    const isFirstTime = factors.some((f) => f.name === "First-time Guest");
    const hasHistory = factors.some((f) => f.name.includes("No-Show History"));

    if (hasNoAdvance || isPayAtHotel) {
        actions.push("📞 Call guest to confirm booking and request partial advance");
    }

    if (isFirstTime) {
        actions.push("📱 Send confirmation SMS/WhatsApp 24 hours before check-in");
    }

    if (hasHistory) {
        actions.push("⚠️ Consider requiring full prepayment for this guest");
    }

    if (advancePaid === 0) {
        actions.push("💳 Collect at least 30% advance to reduce risk");
    }

    if (actions.length === 0) {
        actions.push("✅ Low risk - standard confirmation process sufficient");
    }

    return actions;
}

// ====================
// PUBLIC FUNCTIONS
// ====================

/**
 * Get risk scores for upcoming confirmed bookings
 */
export async function getHighRiskBookings(options?: {
    minRiskScore?: number;
    limit?: number;
}): Promise<BookingRiskScore[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { minRiskScore = 30, limit = 20 } = options || {};

        // Get upcoming confirmed bookings
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0] ?? "";
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const nextWeekStr = nextWeek.toISOString().split("T")[0] ?? "";

        const upcomingBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.hotelId, roleInfo.hotelId),
                eq(bookings.status, "CONFIRMED"),
                gte(bookings.checkIn, todayStr),
                lte(bookings.checkIn, nextWeekStr)
            ),
            with: {
                user: {
                    columns: { id: true, name: true, phone: true },
                },
                room: {
                    columns: { roomNumber: true, name: true },
                },
            },
            orderBy: [desc(bookings.checkIn)],
            limit: 50,
        });

        const results: BookingRiskScore[] = [];

        for (const booking of upcomingBookings) {
            // Calculate lead time
            const bookingDate = new Date(booking.createdAt);
            const checkInDate = new Date(booking.checkIn);
            const leadDays = Math.ceil((checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate advance percentage
            const totalAmount = parseFloat(booking.totalAmount);
            const advancePaid = parseFloat(booking.advancePaid || "0");
            const advancePercentage = totalAmount > 0 ? (advancePaid / totalAmount) * 100 : 0;

            // Check if first-time guest (simplified - check if they have other bookings)
            const guestBookingsCount = await db
                .select({ count: count() })
                .from(bookings)
                .where(
                    and(
                        eq(bookings.hotelId, roleInfo.hotelId),
                        eq(bookings.userId, booking.userId),
                        sql`${bookings.id} != ${booking.id}`
                    )
                );
            const isFirstTimeGuest = Number(guestBookingsCount[0]?.count || 0) === 0;

            // Check previous no-show rate for this guest
            const guestNoShows = await db
                .select({ count: count() })
                .from(bookings)
                .where(
                    and(
                        eq(bookings.hotelId, roleInfo.hotelId),
                        eq(bookings.userId, booking.userId),
                        sql`${bookings.status} = 'NO_SHOW'`
                    )
                );
            const totalGuestBookings = Number(guestBookingsCount[0]?.count || 0) + 1;
            const noShowCount = Number(guestNoShows[0]?.count || 0);
            const previousNoShowRate = totalGuestBookings > 1 ? (noShowCount / (totalGuestBookings - 1)) * 100 : 0;

            // Check if pay at hotel
            const isPayAtHotel = booking.paymentStatus === "PAY_AT_HOTEL" || advancePaid === 0;

            // Check if weekend check-in
            const dayOfWeek = checkInDate.getDay();
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday

            // Calculate risk
            const { score, factors } = calculateRiskScore({
                isFirstTimeGuest,
                leadDays,
                advancePercentage,
                isPayAtHotel,
                previousNoShowRate,
                isWeekend,
                isHoliday: false, // TODO: Add holiday calendar
                bookingSource: booking.source || "PLATFORM",
            });

            // Only include if above threshold
            if (score >= minRiskScore) {
                results.push({
                    bookingId: booking.id,
                    guestName: booking.user?.name || booking.guestName,
                    guestPhone: booking.user?.phone || booking.guestPhone,
                    checkIn: booking.checkIn,
                    roomNumber: booking.room?.roomNumber || "",
                    roomName: booking.room?.name || "",
                    totalAmount: totalAmount,
                    advancePaid: advancePaid,
                    riskScore: score,
                    riskLevel: getRiskLevel(score),
                    riskFactors: factors,
                    suggestedActions: getSuggestedActions(factors, advancePaid),
                });
            }
        }

        // Sort by risk score descending and limit
        return results
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, limit);
    } catch (error) {
        console.error("Error calculating risk scores:", error);
        return [];
    }
}

/**
 * Get risk score for a single booking
 */
export async function getBookingRiskScore(bookingId: string): Promise<BookingRiskScore | null> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return null;
        }

        const booking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, bookingId),
                eq(bookings.hotelId, roleInfo.hotelId)
            ),
            with: {
                user: {
                    columns: { id: true, name: true, phone: true },
                },
                room: {
                    columns: { roomNumber: true, name: true },
                },
            },
        });

        if (!booking) {
            return null;
        }

        // Calculate all the same factors as above
        const bookingDate = new Date(booking.createdAt);
        const checkInDate = new Date(booking.checkIn);
        const leadDays = Math.ceil((checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

        const totalAmount = parseFloat(booking.totalAmount);
        const advancePaid = parseFloat(booking.advancePaid || "0");
        const advancePercentage = totalAmount > 0 ? (advancePaid / totalAmount) * 100 : 0;

        const guestBookingsCount = await db
            .select({ count: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, roleInfo.hotelId),
                    eq(bookings.userId, booking.userId),
                    sql`${bookings.id} != ${booking.id}`
                )
            );
        const isFirstTimeGuest = Number(guestBookingsCount[0]?.count || 0) === 0;

        const guestNoShows = await db
            .select({ count: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, roleInfo.hotelId),
                    eq(bookings.userId, booking.userId),
                    sql`${bookings.status} = 'NO_SHOW'`
                )
            );
        const totalGuestBookings = Number(guestBookingsCount[0]?.count || 0) + 1;
        const noShowCount = Number(guestNoShows[0]?.count || 0);
        const previousNoShowRate = totalGuestBookings > 1 ? (noShowCount / (totalGuestBookings - 1)) * 100 : 0;

        const isPayAtHotel = booking.paymentStatus === "PAY_AT_HOTEL" || advancePaid === 0;
        const dayOfWeek = checkInDate.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

        const { score, factors } = calculateRiskScore({
            isFirstTimeGuest,
            leadDays,
            advancePercentage,
            isPayAtHotel,
            previousNoShowRate,
            isWeekend,
            isHoliday: false,
            bookingSource: booking.source || "PLATFORM",
        });

        return {
            bookingId: booking.id,
            guestName: booking.user?.name || booking.guestName,
            guestPhone: booking.user?.phone || booking.guestPhone,
            checkIn: booking.checkIn,
            roomNumber: booking.room?.roomNumber || "",
            roomName: booking.room?.name || "",
            totalAmount: totalAmount,
            advancePaid: advancePaid,
            riskScore: score,
            riskLevel: getRiskLevel(score),
            riskFactors: factors,
            suggestedActions: getSuggestedActions(factors, advancePaid),
        };
    } catch (error) {
        console.error("Error calculating booking risk:", error);
        return null;
    }
}

/**
 * Get hotel-wide no-show statistics
 */
export async function getNoShowStats(): Promise<{
    totalBookings: number;
    noShowCount: number;
    noShowRate: number;
    avgRiskScore: number;
    highRiskCount: number;
} | null> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return null;
        }

        // Last 30 days stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0] ?? "";

        const allBookings = await db
            .select({ count: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, roleInfo.hotelId),
                    gte(bookings.checkIn, thirtyDaysAgoStr)
                )
            );

        const noShows = await db
            .select({ count: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, roleInfo.hotelId),
                    sql`${bookings.status} = 'NO_SHOW'`,
                    gte(bookings.checkIn, thirtyDaysAgoStr)
                )
            );

        const totalBookings = Number(allBookings[0]?.count || 0);
        const noShowCount = Number(noShows[0]?.count || 0);
        const noShowRate = totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0;

        // Get high risk bookings count
        const highRiskBookings = await getHighRiskBookings({ minRiskScore: 60, limit: 100 });

        return {
            totalBookings,
            noShowCount,
            noShowRate,
            avgRiskScore: highRiskBookings.length > 0
                ? Math.round(highRiskBookings.reduce((sum, b) => sum + b.riskScore, 0) / highRiskBookings.length)
                : 0,
            highRiskCount: highRiskBookings.length,
        };
    } catch (error) {
        console.error("Error getting no-show stats:", error);
        return null;
    }
}
