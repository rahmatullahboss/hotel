"use server";

import { db, hotels, bookings, rooms } from "@repo/db";
import { eq, and, gte, lte, sql, desc, count, sum } from "drizzle-orm";
import { auth } from "../../auth";

// ====================
// TYPES
// ====================

export interface AggregateStats {
    totalHotels: number;
    totalRooms: number;
    totalRevenue: number;
    totalBookings: number;
    avgOccupancy: number;
    avgRating: number;
}

export interface HotelPerformance {
    hotelId: string;
    hotelName: string;
    city: string | null;
    status: string;
    totalRooms: number;
    occupancyRate: number;
    monthlyRevenue: number;
    totalBookings: number;
    rating: number;
    reviewCount: number;
}

export interface CityBreakdown {
    city: string;
    hotelCount: number;
    totalRooms: number;
    avgOccupancy: number;
    totalRevenue: number;
}

// ====================
// AGGREGATE STATS
// ====================

/**
 * Get aggregate statistics across all hotels owned by the current user
 */
export async function getAggregateStats(): Promise<AggregateStats | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        // Get all hotels for this owner
        const ownerHotels = await db.query.hotels.findMany({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (ownerHotels.length === 0) {
            return {
                totalHotels: 0,
                totalRooms: 0,
                totalRevenue: 0,
                totalBookings: 0,
                avgOccupancy: 0,
                avgRating: 0,
            };
        }

        type HotelRow = typeof ownerHotels[number];
        const hotelIds = ownerHotels.map((h: HotelRow) => h.id);

        // Get room counts
        const roomCounts = await db
            .select({
                count: count(),
            })
            .from(rooms)
            .where(sql`${rooms.hotelId} IN (${sql.join(hotelIds.map((id: string) => sql`${id}`), sql`, `)})`);

        const totalRooms = Number(roomCounts[0]?.count || 0);

        // Get this month's stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const monthlyStats = await db
            .select({
                count: count(),
                totalRevenue: sum(bookings.totalAmount),
            })
            .from(bookings)
            .where(
                and(
                    sql`${bookings.hotelId} IN (${sql.join(hotelIds.map((id: string) => sql`${id}`), sql`, `)})`,
                    gte(bookings.createdAt, startOfMonth),
                    lte(bookings.createdAt, endOfMonth),
                    sql`${bookings.status} NOT IN ('CANCELLED', 'NO_SHOW')`
                )
            );

        const totalBookings = Number(monthlyStats[0]?.count || 0);
        const totalRevenue = Number(monthlyStats[0]?.totalRevenue || 0);

        // Calculate average occupancy and rating
        let totalOccupancy = 0;
        let totalRating = 0;
        let ratedHotels = 0;

        for (const hotel of ownerHotels) {
            // Simple occupancy calculation: (Active bookings / Total rooms)
            const hotelRooms = await db.query.rooms.findMany({
                where: eq(rooms.hotelId, hotel.id),
            });

            const today = new Date();
            const activeBookings = await db
                .select({ count: count() })
                .from(bookings)
                .where(
                    and(
                        eq(bookings.hotelId, hotel.id),
                        eq(bookings.status, "CHECKED_IN"),
                        lte(bookings.checkIn, today.toISOString().split("T")[0] ?? ""),
                        gte(bookings.checkOut, today.toISOString().split("T")[0] ?? "")
                    )
                );

            if (hotelRooms.length > 0) {
                const occupancy = (Number(activeBookings[0]?.count || 0) / hotelRooms.length) * 100;
                totalOccupancy += occupancy;
            }

            if (hotel.rating && parseFloat(hotel.rating) > 0) {
                totalRating += parseFloat(hotel.rating);
                ratedHotels++;
            }
        }

        return {
            totalHotels: ownerHotels.length,
            totalRooms,
            totalRevenue,
            totalBookings,
            avgOccupancy: ownerHotels.length > 0 ? Math.round(totalOccupancy / ownerHotels.length) : 0,
            avgRating: ratedHotels > 0 ? parseFloat((totalRating / ratedHotels).toFixed(1)) : 0,
        };
    } catch (error) {
        console.error("Error getting aggregate stats:", error);
        return null;
    }
}

/**
 * Get performance comparison for all hotels
 */
export async function getHotelComparison(): Promise<HotelPerformance[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        // Get all hotels for this owner
        const ownerHotels = await db.query.hotels.findMany({
            where: eq(hotels.ownerId, session.user.id),
            orderBy: [desc(hotels.createdAt)],
        });

        if (ownerHotels.length === 0) {
            return [];
        }

        const results: HotelPerformance[] = [];

        for (const hotel of ownerHotels) {
            // Get room count
            const hotelRooms = await db.query.rooms.findMany({
                where: eq(rooms.hotelId, hotel.id),
            });

            // Get monthly revenue
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const monthlyStats = await db
                .select({
                    count: count(),
                    revenue: sum(bookings.totalAmount),
                })
                .from(bookings)
                .where(
                    and(
                        eq(bookings.hotelId, hotel.id),
                        gte(bookings.createdAt, startOfMonth),
                        lte(bookings.createdAt, endOfMonth),
                        sql`${bookings.status} NOT IN ('CANCELLED', 'NO_SHOW')`
                    )
                );

            // Calculate occupancy
            const today = new Date();
            const activeBookings = await db
                .select({ count: count() })
                .from(bookings)
                .where(
                    and(
                        eq(bookings.hotelId, hotel.id),
                        eq(bookings.status, "CHECKED_IN")
                    )
                );

            const occupancyRate = hotelRooms.length > 0
                ? Math.round((Number(activeBookings[0]?.count || 0) / hotelRooms.length) * 100)
                : 0;

            results.push({
                hotelId: hotel.id,
                hotelName: hotel.name,
                city: hotel.city,
                status: hotel.status,
                totalRooms: hotelRooms.length,
                occupancyRate,
                monthlyRevenue: Number(monthlyStats[0]?.revenue || 0),
                totalBookings: Number(monthlyStats[0]?.count || 0),
                rating: parseFloat(hotel.rating || "0"),
                reviewCount: hotel.reviewCount,
            });
        }

        // Sort by monthly revenue descending
        return results.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
    } catch (error) {
        console.error("Error getting hotel comparison:", error);
        return [];
    }
}

/**
 * Get city-wise breakdown of hotels
 */
export async function getCityBreakdown(): Promise<CityBreakdown[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        // Get all hotels for this owner
        const ownerHotels = await db.query.hotels.findMany({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (ownerHotels.length === 0) {
            return [];
        }

        // Group by city
        const cityMap = new Map<string, { hotels: typeof ownerHotels }>();

        for (const hotel of ownerHotels) {
            const city = hotel.city || "Unknown";
            if (!cityMap.has(city)) {
                cityMap.set(city, { hotels: [] });
            }
            cityMap.get(city)!.hotels.push(hotel);
        }

        const results: CityBreakdown[] = [];

        for (const [city, data] of cityMap) {
            let totalRooms = 0;
            let totalOccupancy = 0;
            let totalRevenue = 0;

            for (const hotel of data.hotels) {
                const hotelRooms = await db.query.rooms.findMany({
                    where: eq(rooms.hotelId, hotel.id),
                });
                totalRooms += hotelRooms.length;

                // Get revenue
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const revenueResult = await db
                    .select({ revenue: sum(bookings.totalAmount) })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            gte(bookings.createdAt, startOfMonth),
                            sql`${bookings.status} NOT IN ('CANCELLED', 'NO_SHOW')`
                        )
                    );

                totalRevenue += Number(revenueResult[0]?.revenue || 0);

                // Simple occupancy
                const activeBookings = await db
                    .select({ count: count() })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            eq(bookings.status, "CHECKED_IN")
                        )
                    );

                if (hotelRooms.length > 0) {
                    totalOccupancy += (Number(activeBookings[0]?.count || 0) / hotelRooms.length) * 100;
                }
            }

            results.push({
                city,
                hotelCount: data.hotels.length,
                totalRooms,
                avgOccupancy: data.hotels.length > 0 ? Math.round(totalOccupancy / data.hotels.length) : 0,
                totalRevenue,
            });
        }

        // Sort by revenue descending
        return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
        console.error("Error getting city breakdown:", error);
        return [];
    }
}
