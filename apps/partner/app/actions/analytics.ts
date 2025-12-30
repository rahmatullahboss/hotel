"use server";

import { db } from "@repo/db";
import { bookings, rooms } from "@repo/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { getPartnerHotel } from "./dashboard";

export interface DailyRevenue {
    date: string;
    revenue: number;
    bookings: number;
}

export interface OccupancyData {
    date: string;
    occupied: number;
    total: number;
    rate: number;
}

export interface AnalyticsData {
    // Summary stats
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    occupancyRate: number;

    // Revenue metrics
    revpar: number;  // Revenue Per Available Room
    adr: number;     // Average Daily Rate

    // Breakdown
    platformRevenue: number;
    walkInRevenue: number;
    platformBookings: number;
    walkInBookings: number;

    // Daily data for charts
    dailyRevenue: DailyRevenue[];

    // RevPAR/ADR trend data
    revparTrend: { date: string; revpar: number; adr: number }[];

    // Top performing rooms
    topRooms: { roomNumber: string; revenue: number; bookings: number }[];
}

/**
 * Get analytics data for the hotel
 */
export async function getAnalyticsData(
    period: "week" | "month" | "year" = "month"
): Promise<AnalyticsData> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return getEmptyAnalytics();
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        const startDateStr = startDate.toISOString().split("T")[0]!;
        const endDateStr = endDate.toISOString().split("T")[0]!;

        // Get all bookings in the period (exclude cancelled bookings)
        const periodBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.hotelId, hotel.id),
                gte(bookings.checkIn, startDateStr),
                lte(bookings.checkIn, endDateStr),
                ne(bookings.status, "CANCELLED")
            ),
        });

        // Calculate summary stats
        let totalRevenue = 0;
        let platformRevenue = 0;
        let walkInRevenue = 0;
        let platformBookings = 0;
        let walkInBookings = 0;

        periodBookings.forEach((b: typeof periodBookings[number]) => {
            const amount = Number(b.totalAmount) || 0;
            totalRevenue += amount;

            if (b.bookingSource === "WALK_IN") {
                walkInRevenue += amount;
                walkInBookings++;
            } else {
                platformRevenue += amount;
                platformBookings++;
            }
        });

        const totalBookings = periodBookings.length;
        const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Calculate daily revenue
        const dailyRevenueMap = new Map<string, { revenue: number; bookings: number }>();

        // Initialize all dates in range
        const current = new Date(startDate);
        while (current <= endDate) {
            const dateStr = current.toISOString().split("T")[0]!;
            dailyRevenueMap.set(dateStr, { revenue: 0, bookings: 0 });
            current.setDate(current.getDate() + 1);
        }

        // Populate with actual data
        periodBookings.forEach((b: typeof periodBookings[number]) => {
            const date = b.checkIn;
            const existing = dailyRevenueMap.get(date) || { revenue: 0, bookings: 0 };
            existing.revenue += Number(b.totalAmount) || 0;
            existing.bookings += 1;
            dailyRevenueMap.set(date, existing);
        });

        const dailyRevenue: DailyRevenue[] = Array.from(dailyRevenueMap.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Get room count for occupancy
        const hotelRooms = await db.query.rooms.findMany({
            where: eq(rooms.hotelId, hotel.id),
        });
        const totalRooms = hotelRooms.length;

        // Calculate occupancy (simplified: based on checked-in bookings)
        const checkedInBookings = periodBookings.filter(
            (b: typeof periodBookings[number]) => b.status === "CHECKED_IN" || b.status === "CHECKED_OUT"
        );
        const occupiedRoomDays = checkedInBookings.reduce((sum: number, b: typeof checkedInBookings[number]) => {
            const checkIn = new Date(b.checkIn);
            const checkOut = new Date(b.checkOut);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            return sum + nights;
        }, 0);

        const totalRoomDays = totalRooms * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const occupancyRate = totalRoomDays > 0 ? Math.round((occupiedRoomDays / totalRoomDays) * 100) : 0;

        // Get top rooms
        const roomRevenueMap = new Map<string, { roomNumber: string; revenue: number; bookings: number }>();

        for (const booking of periodBookings) {
            const room = hotelRooms.find((r: typeof hotelRooms[number]) => r.id === booking.roomId);
            if (!room) continue;

            const existing = roomRevenueMap.get(room.id) || {
                roomNumber: room.roomNumber,
                revenue: 0,
                bookings: 0,
            };
            existing.revenue += Number(booking.totalAmount) || 0;
            existing.bookings += 1;
            roomRevenueMap.set(room.id, existing);
        }

        const topRooms = Array.from(roomRevenueMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Calculate RevPAR and ADR
        // RevPAR = Total Room Revenue / Available Room Nights
        // ADR = Total Room Revenue / Rooms Sold (occupied nights)
        const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const availableRoomNights = totalRooms * periodDays;
        const revpar = availableRoomNights > 0 ? Math.round(totalRevenue / availableRoomNights) : 0;
        const adr = occupiedRoomDays > 0 ? Math.round(totalRevenue / occupiedRoomDays) : 0;

        // Calculate RevPAR/ADR trend (weekly data points)
        const revparTrend: { date: string; revpar: number; adr: number }[] = [];
        const trendInterval = period === "week" ? 1 : period === "month" ? 7 : 30; // days per data point
        
        let trendStart = new Date(startDate);
        while (trendStart < endDate) {
            const trendEnd = new Date(trendStart);
            trendEnd.setDate(trendEnd.getDate() + trendInterval);
            if (trendEnd > endDate) trendEnd.setTime(endDate.getTime());
            
            const trendStartStr = trendStart.toISOString().split("T")[0]!;
            const trendEndStr = trendEnd.toISOString().split("T")[0]!;
            
            // Calculate revenue for this period
            const periodBookingsForTrend = periodBookings.filter(
                (b: typeof periodBookings[number]) => b.checkIn >= trendStartStr && b.checkIn <= trendEndStr
            );
            const periodRevenue = periodBookingsForTrend.reduce(
                (sum: number, b: typeof periodBookingsForTrend[number]) => sum + (Number(b.totalAmount) || 0), 0
            );
            
            const trendDays = Math.ceil((trendEnd.getTime() - trendStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            const trendAvailableRooms = totalRooms * trendDays;
            const trendOccupiedRooms = periodBookingsForTrend.reduce((sum: number, b: typeof periodBookingsForTrend[number]) => {
                const nights = Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24));
                return sum + nights;
            }, 0);
            
            revparTrend.push({
                date: trendStartStr,
                revpar: trendAvailableRooms > 0 ? Math.round(periodRevenue / trendAvailableRooms) : 0,
                adr: trendOccupiedRooms > 0 ? Math.round(periodRevenue / trendOccupiedRooms) : 0,
            });
            
            trendStart = new Date(trendEnd);
            trendStart.setDate(trendStart.getDate() + 1);
        }

        return {
            totalRevenue,
            totalBookings,
            avgBookingValue,
            occupancyRate,
            revpar,
            adr,
            platformRevenue,
            walkInRevenue,
            platformBookings,
            walkInBookings,
            dailyRevenue,
            revparTrend,
            topRooms,
        };
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return getEmptyAnalytics();
    }
}

function getEmptyAnalytics(): AnalyticsData {
    return {
        totalRevenue: 0,
        totalBookings: 0,
        avgBookingValue: 0,
        occupancyRate: 0,
        revpar: 0,
        adr: 0,
        platformRevenue: 0,
        walkInRevenue: 0,
        platformBookings: 0,
        walkInBookings: 0,
        dailyRevenue: [],
        revparTrend: [],
        topRooms: [],
    };
}
