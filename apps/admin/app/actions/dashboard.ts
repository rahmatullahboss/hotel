"use server";

import { db, type Hotel } from "@repo/db";
import { hotels, bookings, users, rooms } from "@repo/db/schema";
import { eq, sql, count, sum, and, gte, lte, desc, ne } from "drizzle-orm";

export interface AdminStats {
    totalRevenue: number;
    activeHotels: number;
    pendingHotels: number;
    suspendedHotels: number;
    totalBookings: number;
    totalUsers: number;
    todayBookings: number;
    todayRevenue: number;
    todayCheckIns: number;
    monthlyRevenue: number;
    platformCommission: number;
    averageBookingValue: number;
    totalRooms: number;
    totalCancellations: number;
}

export interface RecentActivity {
    id: string;
    type: "BOOKING" | "HOTEL_REGISTRATION" | "CHECK_IN" | "PAYMENT";
    title: string;
    description: string;
    timestamp: Date;
    hotelName?: string;
}

export async function getAdminStats(): Promise<AdminStats> {
    try {
        const today = new Date().toISOString().split("T")[0]!;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0]!;

        // Get total revenue from all bookings
        const revenueResult = await db
            .select({
                total: sum(bookings.totalAmount),
                commission: sum(bookings.commissionAmount),
                count: count(),
            })
            .from(bookings)
            .where(eq(bookings.paymentStatus, "PAID"));

        const totalRevenue = Number(revenueResult[0]?.total) || 0;
        const platformCommission = Number(revenueResult[0]?.commission) || 0;
        const paidBookingsCount = revenueResult[0]?.count || 1;
        const averageBookingValue = Math.round(totalRevenue / paidBookingsCount);

        // Get hotels by status
        const activeHotelsResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "ACTIVE"));
        const activeHotels = activeHotelsResult[0]?.count || 0;

        const pendingHotelsResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "PENDING"));
        const pendingHotels = pendingHotelsResult[0]?.count || 0;

        const suspendedHotelsResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "SUSPENDED"));
        const suspendedHotels = suspendedHotelsResult[0]?.count || 0;

        // Get total bookings count (excluding cancelled)
        const bookingsResult = await db
            .select({ count: count() })
            .from(bookings)
            .where(ne(bookings.status, "CANCELLED"));
        const totalBookings = bookingsResult[0]?.count || 0;

        // Get total cancellations
        const cancellationsResult = await db
            .select({ count: count() })
            .from(bookings)
            .where(eq(bookings.status, "CANCELLED"));
        const totalCancellations = cancellationsResult[0]?.count || 0;

        // Get today's stats (excluding cancelled)
        const todayStats = await db
            .select({
                count: count(),
                revenue: sum(bookings.totalAmount),
            })
            .from(bookings)
            .where(and(
                eq(bookings.checkIn, today),
                ne(bookings.status, "CANCELLED")
            ));
        const todayBookings = todayStats[0]?.count || 0;
        const todayRevenue = Number(todayStats[0]?.revenue) || 0;

        // Today's check-ins
        const todayCheckIns = await db
            .select({ count: count() })
            .from(bookings)
            .where(and(
                eq(bookings.checkIn, today),
                eq(bookings.status, "CHECKED_IN")
            ));

        // Monthly revenue
        const monthlyStats = await db
            .select({ total: sum(bookings.totalAmount) })
            .from(bookings)
            .where(and(
                gte(bookings.checkIn, monthStart),
                eq(bookings.paymentStatus, "PAID")
            ));
        const monthlyRevenue = Number(monthlyStats[0]?.total) || 0;

        // Get total users count
        const usersResult = await db
            .select({ count: count() })
            .from(users);
        const totalUsers = usersResult[0]?.count || 0;

        // Total rooms
        const roomsResult = await db
            .select({ count: count() })
            .from(rooms)
            .where(eq(rooms.isActive, true));
        const totalRooms = roomsResult[0]?.count || 0;

        return {
            totalRevenue,
            activeHotels,
            pendingHotels,
            suspendedHotels,
            totalBookings,
            totalUsers,
            todayBookings,
            todayRevenue,
            todayCheckIns: todayCheckIns[0]?.count || 0,
            monthlyRevenue,
            platformCommission,
            averageBookingValue,
            totalRooms,
            totalCancellations,
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
            totalRevenue: 0,
            activeHotels: 0,
            pendingHotels: 0,
            suspendedHotels: 0,
            totalBookings: 0,
            totalUsers: 0,
            todayBookings: 0,
            todayRevenue: 0,
            todayCheckIns: 0,
            monthlyRevenue: 0,
            platformCommission: 0,
            averageBookingValue: 0,
            totalRooms: 0,
            totalCancellations: 0,
        };
    }
}

/**
 * Get recent activity for admin dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
        // Get recent bookings as activity
        const recentBookings = await db.query.bookings.findMany({
            orderBy: [desc(bookings.createdAt)],
            limit,
            with: {
                hotel: true,
            },
        });

        // Get recent hotel registrations
        const recentHotels = await db.query.hotels.findMany({
            orderBy: [desc(hotels.createdAt)],
            limit: 5,
            where: eq(hotels.status, "PENDING"),
        });

        const activities: RecentActivity[] = [];

        // Add booking activities
        for (const booking of recentBookings) {
            activities.push({
                id: `booking-${booking.id}`,
                type: booking.status === "CHECKED_IN" ? "CHECK_IN" :
                    booking.paymentStatus === "PAID" ? "PAYMENT" : "BOOKING",
                title: booking.status === "CHECKED_IN"
                    ? `${booking.guestName} checked in`
                    : booking.paymentStatus === "PAID"
                        ? `Payment received ৳${Number(booking.totalAmount).toLocaleString()}`
                        : `New booking by ${booking.guestName}`,
                description: `Room booked for ${booking.checkIn} to ${booking.checkOut}`,
                timestamp: booking.createdAt,
                hotelName: booking.hotel?.name,
            });
        }

        // Add hotel registration activities
        for (const hotel of recentHotels) {
            activities.push({
                id: `hotel-${hotel.id}`,
                type: "HOTEL_REGISTRATION",
                title: `New hotel registration: ${hotel.name}`,
                description: `${hotel.city} - Awaiting approval`,
                timestamp: hotel.createdAt,
                hotelName: hotel.name,
            });
        }

        // Sort by timestamp and return
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
    }
}

/**
 * Get quality alerts - hotels that need attention
 */
export async function getQualityAlerts(): Promise<{
    lowRatedHotels: { id: string; name: string; rating: number }[];
    inactiveHotels: { id: string; name: string; daysSinceLastBooking: number }[];
    pendingCount: number;
}> {
    try {
        // Get hotels with low ratings
        const lowRated = await db.query.hotels.findMany({
            where: and(
                eq(hotels.status, "ACTIVE"),
                lte(hotels.rating, "2.5")
            ),
        });

        // Get pending count
        const pendingResult = await db
            .select({ count: count() })
            .from(hotels)
            .where(eq(hotels.status, "PENDING"));

        return {
            lowRatedHotels: lowRated.map((h: Hotel) => ({
                id: h.id,
                name: h.name,
                rating: Number(h.rating) || 0,
            })),
            inactiveHotels: [], // Would need booking data to calculate
            pendingCount: pendingResult[0]?.count || 0,
        };
    } catch (error) {
        console.error("Error fetching quality alerts:", error);
        return {
            lowRatedHotels: [],
            inactiveHotels: [],
            pendingCount: 0,
        };
    }
}


/**
 * Get pending payment bookings for admin monitoring
 * These are bookings where payment was initiated but not completed
 */
export interface PendingPaymentBooking {
    id: string;
    guestName: string;
    guestPhone: string;
    hotelName: string;
    hotelId: string;
    roomName: string | null;
    checkIn: string;
    totalAmount: number;
    bookingFee: number;
    paymentMethod: string | null;
    createdAt: Date;
    expiresAt: Date | null;
    minutesRemaining: number | null;
}

export async function getPendingPaymentBookings(limit: number = 20): Promise<PendingPaymentBooking[]> {
    try {
        const pendingBookings = await db.query.bookings.findMany({
            where: and(
                eq(bookings.status, "PENDING"),
                eq(bookings.bookingFeeStatus, "PENDING")
            ),
            orderBy: [desc(bookings.createdAt)],
            limit,
            with: {
                hotel: true,
                room: true,
            },
        });

        const now = new Date();

        return pendingBookings.map((b: typeof pendingBookings[number]) => {
            const expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
            const minutesRemaining = expiresAt
                ? Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 60000))
                : null;

            return {
                id: b.id,
                guestName: b.guestName,
                guestPhone: b.guestPhone,
                hotelName: b.hotel?.name || "Unknown Hotel",
                hotelId: b.hotelId,
                roomName: b.room?.name || null,
                checkIn: b.checkIn,
                totalAmount: Number(b.totalAmount) || 0,
                bookingFee: Number(b.bookingFee) || 0,
                paymentMethod: b.paymentMethod,
                createdAt: b.createdAt,
                expiresAt,
                minutesRemaining,
            };
        });
    } catch (error) {
        console.error("Error fetching pending payment bookings:", error);
        return [];
    }
}
