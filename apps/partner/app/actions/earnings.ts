"use server";

import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq, and, gte } from "drizzle-orm";

export interface EarningsData {
    totalRevenue: number;
    totalCommission: number;
    netEarnings: number;
    totalBookings: number;
    commissionOwed: number; // Commission owed for pay-at-hotel bookings
    walkInRevenue: number; // Revenue from walk-ins (no commission)
    platformRevenue: number; // Revenue from platform bookings
    transactions: Transaction[];
}

export interface Transaction {
    id: string;
    guestName: string;
    checkIn: string;
    amount: number;
    commission: number;
    net: number;
    status: string;
    paymentStatus: string;
    bookingSource: string;
    commissionStatus: string;
}

/**
 * Get earnings data for a hotel
 */
export async function getEarningsData(
    hotelId: string,
    period: "week" | "month" | "year" = "month"
): Promise<EarningsData> {
    try {
        const now = new Date();
        let startDate: string;

        switch (period) {
            case "week":
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                startDate = weekStart.toISOString().split("T")[0]!;
                break;
            case "year":
                startDate = `${now.getFullYear()}-01-01`;
                break;
            case "month":
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .split("T")[0]!;
        }

        // Get bookings in period
        const periodBookings = await db
            .select({
                id: bookings.id,
                guestName: bookings.guestName,
                checkIn: bookings.checkIn,
                totalAmount: bookings.totalAmount,
                commissionAmount: bookings.commissionAmount,
                netAmount: bookings.netAmount,
                status: bookings.status,
                paymentStatus: bookings.paymentStatus,
                bookingSource: bookings.bookingSource,
                commissionStatus: bookings.commissionStatus,
            })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    gte(bookings.checkIn, startDate)
                )
            )
            .orderBy(bookings.checkIn);

        // Calculate totals
        let totalRevenue = 0;
        let totalCommission = 0;
        let netEarnings = 0;
        let commissionOwed = 0;
        let walkInRevenue = 0;
        let platformRevenue = 0;

        const transactions: Transaction[] = periodBookings.map((b) => {
            const amount = Number(b.totalAmount) || 0;
            const commission = Number(b.commissionAmount) || 0;
            const net = Number(b.netAmount) || 0;

            // Only count confirmed/completed bookings in totals
            if (b.status === "CONFIRMED" || b.status === "CHECKED_IN" || b.status === "CHECKED_OUT") {
                totalRevenue += amount;
                totalCommission += commission;
                netEarnings += net;

                // Track revenue by source
                if (b.bookingSource === "WALK_IN") {
                    walkInRevenue += amount;
                } else {
                    platformRevenue += amount;

                    // Track commission owed for pay-at-hotel platform bookings
                    if (b.paymentStatus === "PAY_AT_HOTEL" && b.commissionStatus === "PENDING") {
                        commissionOwed += commission;
                    }
                }
            }

            return {
                id: b.id,
                guestName: b.guestName,
                checkIn: b.checkIn,
                amount,
                commission,
                net,
                status: b.status,
                paymentStatus: b.paymentStatus,
                bookingSource: b.bookingSource,
                commissionStatus: b.commissionStatus,
            };
        });

        return {
            totalRevenue,
            totalCommission,
            netEarnings,
            totalBookings: transactions.length,
            commissionOwed,
            walkInRevenue,
            platformRevenue,
            transactions,
        };
    } catch (error) {
        console.error("Error fetching earnings:", error);
        return {
            totalRevenue: 0,
            totalCommission: 0,
            netEarnings: 0,
            totalBookings: 0,
            commissionOwed: 0,
            walkInRevenue: 0,
            platformRevenue: 0,
            transactions: [],
        };
    }
}

/**
 * Get payout history for a hotel (placeholder)
 */
export async function getPayoutHistory(hotelId: string) {
    // Placeholder - would integrate with actual payout system
    return [
        {
            id: "1",
            date: "2024-12-01",
            amount: 45000,
            status: "COMPLETED",
            method: "Bank Transfer",
        },
        {
            id: "2",
            date: "2024-11-01",
            amount: 38000,
            status: "COMPLETED",
            method: "Bank Transfer",
        },
    ];
}
