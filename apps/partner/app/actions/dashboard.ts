"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels, loyaltyPoints, activityLog } from "@repo/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface PartnerHotel {
    id: string;
    name: string;
    city: string;
    status: string;
}

/**
 * Get the current partner's hotel from session
 */
export async function getPartnerHotel(): Promise<PartnerHotel | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
            columns: {
                id: true,
                name: true,
                city: true,
                status: true,
            },
        });

        return hotel || null;
    } catch (error) {
        console.error("Error fetching partner hotel:", error);
        return null;
    }
}

/**
 * Find a booking by ID (for scanner)
 */
export async function findBookingById(bookingId: string, hotelId: string) {
    try {
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
            with: {
                room: true,
            },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        return {
            success: true,
            booking: {
                id: booking.id,
                guestName: booking.guestName,
                guestPhone: booking.guestPhone,
                roomNumber: booking.room?.roomNumber || "",
                roomName: booking.room?.name || "",
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                status: booking.status,
                totalAmount: Number(booking.totalAmount),
            },
        };
    } catch (error) {
        console.error("Error finding booking:", error);
        return { success: false, error: "Failed to find booking" };
    }
}

export interface DashboardStats {
    todayCheckIns: number;
    todayCheckOuts: number;
    occupancyRate: number;
    monthlyRevenue: number;
    pendingBookings: number;
    averageRoomRate: number; // ARR - Average Room Rate
    totalRooms: number;
    occupiedRooms: number;
    confirmedBookingsToday: number;
}

export interface BookingSummary {
    id: string;
    guestName: string;
    guestPhone: string;
    roomNumber: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
}

/**
 * Get dashboard stats for a hotel
 */
export async function getDashboardStats(hotelId: string): Promise<DashboardStats> {
    try {
        const today = new Date().toISOString().split("T")[0]!;
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString()
            .split("T")[0]!;

        // Today's check-ins
        const checkIns = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.checkIn, today)));

        // Today's check-outs
        const checkOuts = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.checkOut, today)));

        // Pending bookings
        const pending = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.status, "PENDING")));

        // Confirmed bookings today (for check-in)
        const confirmedToday = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    eq(bookings.checkIn, today),
                    eq(bookings.status, "CONFIRMED")
                )
            );

        // Monthly revenue and booking count for ARR calculation
        const revenueStats = await db
            .select({
                total: sql<string>`COALESCE(SUM(${bookings.netAmount}), '0')`,
                count: sql<number>`count(*)`,
                avgPerNight: sql<string>`COALESCE(AVG(${bookings.totalAmount} / NULLIF(${bookings.numberOfNights}, 0)), '0')`,
            })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    gte(bookings.checkIn, monthStart),
                    eq(bookings.status, "CONFIRMED")
                )
            );

        // Total rooms for occupancy calculation
        const totalRooms = await db
            .select({ count: sql<number>`count(*)` })
            .from(rooms)
            .where(eq(rooms.hotelId, hotelId));

        // Occupied rooms today (guests currently staying)
        const occupiedRooms = await db
            .select({ count: sql<number>`count(DISTINCT ${bookings.roomId})` })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    lte(bookings.checkIn, today),
                    gte(bookings.checkOut, today),
                    eq(bookings.status, "CONFIRMED")
                )
            );

        const totalRoomCount = Number(totalRooms[0]?.count) || 1;
        const occupiedCount = Number(occupiedRooms[0]?.count) || 0;
        const occupancyRate = Math.round((occupiedCount / totalRoomCount) * 100);

        // Calculate ARR (Average Room Rate) from actual bookings
        const averageRoomRate = Math.round(Number(revenueStats[0]?.avgPerNight) || 0);

        return {
            todayCheckIns: Number(checkIns[0]?.count) || 0,
            todayCheckOuts: Number(checkOuts[0]?.count) || 0,
            occupancyRate,
            monthlyRevenue: Number(revenueStats[0]?.total) || 0,
            pendingBookings: Number(pending[0]?.count) || 0,
            averageRoomRate,
            totalRooms: totalRoomCount,
            occupiedRooms: occupiedCount,
            confirmedBookingsToday: Number(confirmedToday[0]?.count) || 0,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            todayCheckIns: 0,
            todayCheckOuts: 0,
            occupancyRate: 0,
            monthlyRevenue: 0,
            pendingBookings: 0,
            averageRoomRate: 0,
            totalRooms: 0,
            occupiedRooms: 0,
            confirmedBookingsToday: 0,
        };
    }
}


/**
 * Get upcoming bookings for a hotel
 */
export async function getUpcomingBookings(hotelId: string, limit = 5): Promise<BookingSummary[]> {
    try {
        const today = new Date().toISOString().split("T")[0]!;

        const result = await db
            .select({
                id: bookings.id,
                guestName: bookings.guestName,
                guestPhone: bookings.guestPhone,
                roomNumber: rooms.roomNumber,
                roomName: rooms.name,
                checkIn: bookings.checkIn,
                checkOut: bookings.checkOut,
                status: bookings.status,
                totalAmount: bookings.totalAmount,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(eq(bookings.hotelId, hotelId), gte(bookings.checkIn, today)))
            .orderBy(bookings.checkIn)
            .limit(limit);

        return result.map((b) => ({
            ...b,
            roomNumber: b.roomNumber ?? "",
            roomName: b.roomName ?? "",
            totalAmount: Number(b.totalAmount) || 0,
        }));
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        return [];
    }

    /**
     * Get today's expected check-ins with status
     */
    export async function getTodaysCheckIns(hotelId: string): Promise<BookingSummary[]> {
        try {
            const today = new Date().toISOString().split("T")[0]!;

            const result = await db
                .select({
                    id: bookings.id,
                    guestName: bookings.guestName,
                    guestPhone: bookings.guestPhone,
                    roomNumber: rooms.roomNumber,
                    roomName: rooms.name,
                    checkIn: bookings.checkIn,
                    checkOut: bookings.checkOut,
                    status: bookings.status,
                    totalAmount: bookings.totalAmount,
                })
                .from(bookings)
                .leftJoin(rooms, eq(rooms.id, bookings.roomId))
                .where(and(eq(bookings.hotelId, hotelId), eq(bookings.checkIn, today)))
                .orderBy(bookings.createdAt);

            return result.map((b) => ({
                ...b,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                totalAmount: Number(b.totalAmount) || 0,
            }));
        } catch (error) {
            console.error("Error fetching today's check-ins:", error);
            return [];
        }
    }

    /**
     * Confirm a booking
     */
    export async function confirmBooking(
        bookingId: string,
        hotelId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const booking = await db.query.bookings.findFirst({
                where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
            });

            if (!booking) {
                return { success: false, error: "Booking not found" };
            }

            await db
                .update(bookings)
                .set({ status: "CONFIRMED" })
                .where(eq(bookings.id, bookingId));

            revalidatePath("/");
            return { success: true };
        } catch (error) {
            console.error("Error confirming booking:", error);
            return { success: false, error: "Failed to confirm booking" };
        }
    }

    /**
     * Check in a guest
     */
    export async function checkInGuest(
        bookingId: string,
        hotelId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const session = await auth();
            const booking = await db.query.bookings.findFirst({
                where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
            });

            if (!booking) {
                return { success: false, error: "Booking not found" };
            }

            if (booking.status !== "CONFIRMED") {
                return { success: false, error: "Booking must be confirmed first" };
            }

            // Update booking status
            await db
                .update(bookings)
                .set({
                    status: "CHECKED_IN",
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, bookingId));

            // Log activity
            await db.insert(activityLog).values({
                type: "CHECK_IN",
                actorId: session?.user?.id,
                hotelId: hotelId,
                bookingId: bookingId,
                description: `Guest ${booking.guestName} checked in`,
                metadata: {
                    guestName: booking.guestName,
                    roomId: booking.roomId,
                    checkInDate: booking.checkIn,
                },
            });

            revalidatePath("/");
            revalidatePath("/scanner");
            return { success: true };
        } catch (error) {
            console.error("Error checking in:", error);
            return { success: false, error: "Failed to check in" };
        }
    }

    /**
     * Check out a guest
     */
    export async function checkOutGuest(
        bookingId: string,
        hotelId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const session = await auth();
            const booking = await db.query.bookings.findFirst({
                where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
            });

            if (!booking) {
                return { success: false, error: "Booking not found" };
            }

            if (booking.status !== "CHECKED_IN") {
                return { success: false, error: "Guest must be checked in first" };
            }

            // Update booking status
            await db
                .update(bookings)
                .set({
                    status: "CHECKED_OUT",
                    updatedAt: new Date(),
                })
                .where(eq(bookings.id, bookingId));

            // Award loyalty points to customer if they have an account
            // 1 point per ৳10 spent + bonus 50 points for platform booking
            let pointsAwarded = 0;
            if (booking.userId) {
                const basePoints = Math.floor(Number(booking.totalAmount) / 10);
                const bonusPoints = booking.bookingSource === "PLATFORM" ? 50 : 0;
                pointsAwarded = basePoints + bonusPoints;

                // Get or create loyalty record
                let loyalty = await db.query.loyaltyPoints.findFirst({
                    where: eq(loyaltyPoints.userId, booking.userId),
                });

                if (!loyalty) {
                    const [newLoyalty] = await db
                        .insert(loyaltyPoints)
                        .values({ userId: booking.userId })
                        .returning();
                    loyalty = newLoyalty!;
                }

                // Calculate new points and tier
                const newPoints = (loyalty?.points || 0) + pointsAwarded;
                const newLifetime = (loyalty?.lifetimePoints || 0) + pointsAwarded;

                let newTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" = "BRONZE";
                if (newLifetime >= 10000) newTier = "PLATINUM";
                else if (newLifetime >= 5000) newTier = "GOLD";
                else if (newLifetime >= 1000) newTier = "SILVER";

                await db
                    .update(loyaltyPoints)
                    .set({
                        points: newPoints,
                        lifetimePoints: newLifetime,
                        tier: newTier,
                        updatedAt: new Date(),
                    })
                    .where(eq(loyaltyPoints.userId, booking.userId));
            }

            // Log activity
            await db.insert(activityLog).values({
                type: "CHECK_OUT",
                actorId: session?.user?.id,
                hotelId: hotelId,
                bookingId: bookingId,
                description: `Guest ${booking.guestName} checked out`,
                metadata: {
                    guestName: booking.guestName,
                    roomId: booking.roomId,
                    checkOutDate: booking.checkOut,
                    totalAmount: Number(booking.totalAmount),
                    pointsAwarded,
                },
            });

            revalidatePath("/");
            return { success: true };
        } catch (error) {
            console.error("Error checking out:", error);
            return { success: false, error: "Failed to check out" };
        }
    }
