"use server";

import { db } from "@repo/db";
import { bookings, rooms, hotels, loyaltyPoints, activityLog, roomInventory, hotelStaff, housekeepingTasks, reviews, promotions } from "@repo/db/schema";
import { eq, and, desc, sql, gte, lte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "../../auth";
import { pushRealtimeEvent } from "../lib/realtime";

export interface PartnerHotel {
    id: string;
    name: string;
    city: string;
    status: string;
}

/**
 * Get the current partner's hotel from session
 */
/**
 * Get the current partner's hotel from session or selection
 */
export async function getPartnerHotel(hotelId?: string): Promise<PartnerHotel | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        // 1. If explicit ID provided, check ownership and return
        if (hotelId) {
            const hotel = await db.query.hotels.findFirst({
                where: and(eq(hotels.id, hotelId), eq(hotels.ownerId, session.user.id)),
                columns: {
                    id: true,
                    name: true,
                    city: true,
                    status: true,
                },
            });
            if (hotel) return hotel;
        }

        // 2. Check cookie for selected hotel
        const cookieStore = await cookies();
        const storedHotelId = cookieStore.get("partner_hotel_id")?.value;

        if (storedHotelId) {
            const hotel = await db.query.hotels.findFirst({
                where: and(eq(hotels.id, storedHotelId), eq(hotels.ownerId, session.user.id)),
                columns: {
                    id: true,
                    name: true,
                    city: true,
                    status: true,
                },
            });
            if (hotel) return hotel;
        }

        // 3. Fallback: Return the first hotel owned by user
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
 * Extended hotel info with stats for switcher
 */
export interface PartnerHotelWithStats extends PartnerHotel {
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
}

/**
 * Get ALL hotels the partner has access to (owner OR staff)
 * Includes occupancy stats for each hotel
 */
export async function getAllPartnerHotels(): Promise<PartnerHotelWithStats[]> {
    try {
        const session = await auth();
        if (!session?.user?.id) return [];

        // Get hotels where user is owner
        const ownedHotels = await db.query.hotels.findMany({
            where: eq(hotels.ownerId, session.user.id),
            columns: {
                id: true,
                name: true,
                city: true,
                status: true,
            },
            orderBy: desc(hotels.createdAt),
        });

        // Get hotels where user is staff (ACTIVE status)
        const staffHotels = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                city: hotels.city,
                status: hotels.status,
            })
            .from(hotelStaff)
            .innerJoin(hotels, eq(hotels.id, hotelStaff.hotelId))
            .where(
                and(
                    eq(hotelStaff.userId, session.user.id),
                    eq(hotelStaff.status, "ACTIVE"),
                    ne(hotelStaff.role, "OWNER") // Exclude owner entries (already in ownedHotels)
                )
            );

        // Combine and deduplicate
        const allHotels = [...ownedHotels];
        for (const sh of staffHotels) {
            if (!allHotels.find((h) => h.id === sh.id)) {
                allHotels.push(sh);
            }
        }

        // Calculate occupancy for each hotel
        const today = new Date().toISOString().split("T")[0]!;
        const hotelsWithStats: PartnerHotelWithStats[] = await Promise.all(
            allHotels.map(async (hotel) => {
                // Total rooms
                const totalRoomsResult = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(rooms)
                    .where(eq(rooms.hotelId, hotel.id));

                // Occupied rooms today
                const occupiedResult = await db
                    .select({ count: sql<number>`count(DISTINCT ${bookings.roomId})` })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            lte(bookings.checkIn, today),
                            gte(bookings.checkOut, today),
                            eq(bookings.status, "CHECKED_IN")
                        )
                    );

                const totalRooms = Number(totalRoomsResult[0]?.count) || 0;
                const occupiedRooms = Number(occupiedResult[0]?.count) || 0;
                const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

                return {
                    ...hotel,
                    totalRooms,
                    occupiedRooms,
                    occupancyRate,
                };
            })
        );

        // Sort by city for grouping, then by name
        hotelsWithStats.sort((a, b) => {
            if (a.city < b.city) return -1;
            if (a.city > b.city) return 1;
            return a.name.localeCompare(b.name);
        });

        return hotelsWithStats;
    } catch (error) {
        console.error("Error fetching all partner hotels:", error);
        return [];
    }
}

/**
 * Switch the active hotel (sets a cookie)
 */
export async function switchHotel(hotelId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const hotel = await db.query.hotels.findFirst({
        where: and(eq(hotels.id, hotelId), eq(hotels.ownerId, session.user.id)),
    });

    if (!hotel) throw new Error("You do not own this hotel");

    const cookieStore = await cookies();
    cookieStore.set("partner_hotel_id", hotelId, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidatePath("/");
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

        const totalAmount = Number(booking.totalAmount);
        const advancePaid = Number(booking.bookingFee || 0);

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
                totalAmount,
                paymentStatus: booking.paymentStatus,
                paymentMethod: booking.paymentMethod,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                bookingFeeStatus: booking.bookingFeeStatus,
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
    advancePaid: number;
    remainingAmount: number;
    paymentStatus: string;
    paymentMethod: string | null;
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
            .where(and(
                eq(bookings.hotelId, hotelId),
                eq(bookings.checkIn, today),
                ne(bookings.status, "CANCELLED"),
                ne(bookings.status, "PENDING")
            ));

        // Today's check-outs
        const checkOuts = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(and(
                eq(bookings.hotelId, hotelId),
                eq(bookings.checkOut, today),
                ne(bookings.status, "CANCELLED"),
                ne(bookings.status, "PENDING")
            ));

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
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(
                eq(bookings.hotelId, hotelId),
                gte(bookings.checkIn, today),
                ne(bookings.status, "PENDING"), // Hide unpaid bookings from partner
                ne(bookings.status, "CANCELLED") // Also hide cancelled
            ))
            .orderBy(bookings.checkIn)
            .limit(limit);

        return result.map((b: typeof result[number]) => {
            const totalAmount = Number(b.totalAmount) || 0;
            // Only count advance as paid if bookingFeeStatus is PAID
            const advancePaid = b.bookingFeeStatus === "PAID" ? (Number(b.bookingFee) || 0) : 0;
            return {
                ...b,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                totalAmount,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                paymentStatus: b.paymentStatus ?? "PENDING",
                paymentMethod: b.paymentMethod,
            };
        });
    } catch (error) {
        console.error("Error fetching upcoming bookings:", error);
        return [];
    }
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
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(
                eq(bookings.hotelId, hotelId),
                eq(bookings.checkIn, today),
                ne(bookings.status, "PENDING"), // Hide unpaid bookings from partner
                ne(bookings.status, "CANCELLED") // Also hide cancelled
            ))
            .orderBy(bookings.createdAt);

        return result.map((b: typeof result[number]) => {
            const totalAmount = Number(b.totalAmount) || 0;
            // Only count advance as paid if bookingFeeStatus is PAID
            const advancePaid = b.bookingFeeStatus === "PAID" ? (Number(b.bookingFee) || 0) : 0;
            return {
                ...b,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                totalAmount,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                paymentStatus: b.paymentStatus ?? "PENDING",
                paymentMethod: b.paymentMethod,
            };
        });
    } catch (error) {
        console.error("Error fetching today's check-ins:", error);
        return [];
    }
}

/**
 * Get currently staying guests (checked in, not yet checked out)
 */
export async function getCurrentlyStaying(hotelId: string): Promise<BookingSummary[]> {
    try {
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
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(eq(bookings.hotelId, hotelId), eq(bookings.status, "CHECKED_IN")))
            .orderBy(bookings.checkOut);

        return result.map((b: typeof result[number]) => {
            const totalAmount = Number(b.totalAmount) || 0;
            // Only count advance as paid if bookingFeeStatus is PAID
            const advancePaid = b.bookingFeeStatus === "PAID" ? (Number(b.bookingFee) || 0) : 0;
            return {
                ...b,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                totalAmount,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                paymentStatus: b.paymentStatus ?? "PENDING",
                paymentMethod: b.paymentMethod,
            };
        });
    } catch (error) {
        console.error("Error fetching currently staying guests:", error);
        return [];
    }
}

/**
 * Get today's expected check-outs (guests who are checked in and should leave today)
 */
export async function getTodaysCheckOuts(hotelId: string): Promise<BookingSummary[]> {
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
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(
                and(
                    eq(bookings.hotelId, hotelId),
                    eq(bookings.checkOut, today),
                    eq(bookings.status, "CHECKED_IN")
                )
            )
            .orderBy(bookings.createdAt);

        return result.map((b: typeof result[number]) => {
            const totalAmount = Number(b.totalAmount) || 0;
            // Only count advance as paid if bookingFeeStatus is PAID
            const advancePaid = b.bookingFeeStatus === "PAID" ? (Number(b.bookingFee) || 0) : 0;
            return {
                ...b,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                totalAmount,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                paymentStatus: b.paymentStatus ?? "PENDING",
                paymentMethod: b.paymentMethod,
            };
        });
    } catch (error) {
        console.error("Error fetching today's check-outs:", error);
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

        // Mark room inventory as OCCUPIED for all booking dates
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const dates: string[] = [];
        const current = new Date(checkInDate);
        while (current < checkOutDate) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, booking.roomId),
                    eq(roomInventory.date, date)
                ),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "OCCUPIED", updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            } else {
                await db.insert(roomInventory).values({
                    roomId: booking.roomId,
                    date,
                    status: "OCCUPIED",
                });
            }
        }

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

        // Push realtime event
        pushRealtimeEvent({
            type: "GUEST_CHECKED_IN",
            hotelId,
            data: {
                bookingId,
                guestName: booking.guestName,
                roomId: booking.roomId,
            },
        }).catch((err) => console.error("Failed to push realtime event:", err));

        revalidatePath("/");
        revalidatePath("/scanner");
        revalidatePath("/inventory");
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

        // Mark room inventory as AVAILABLE for all booking dates
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const dates: string[] = [];
        const current = new Date(checkInDate);
        while (current < checkOutDate) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, booking.roomId),
                    eq(roomInventory.date, date)
                ),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "AVAILABLE", updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            }
        }

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

        // Push realtime event
        pushRealtimeEvent({
            type: "GUEST_CHECKED_OUT",
            hotelId,
            data: {
                bookingId,
                guestName: booking.guestName,
                roomId: booking.roomId,
                pointsAwarded,
            },
        }).catch((err) => console.error("Failed to push realtime event:", err));

        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error checking out:", error);
        return { success: false, error: "Failed to check out" };
    }
}

/**
 * Extend a guest's stay by adding more nights
 */
export async function extendStay(
    bookingId: string,
    hotelId: string,
    additionalNights: number = 1
): Promise<{ success: boolean; error?: string; newCheckOut?: string; additionalAmount?: number }> {
    try {
        const session = await auth();
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
            with: { room: true },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.status !== "CHECKED_IN") {
            return { success: false, error: "Guest must be checked in to extend stay" };
        }

        // Calculate new checkout date
        const currentCheckOut = new Date(booking.checkOut);
        const newCheckOut = new Date(currentCheckOut);
        newCheckOut.setDate(newCheckOut.getDate() + additionalNights);
        const newCheckOutStr = newCheckOut.toISOString().split("T")[0]!;

        // Check if room is available for extended dates
        const conflictingBooking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.roomId, booking.roomId),
                sql`${bookings.id} != ${bookingId}`,
                lte(bookings.checkIn, newCheckOutStr),
                gte(bookings.checkOut, booking.checkOut),
                sql`${bookings.status} NOT IN ('CANCELLED', 'CHECKED_OUT')`
            ),
        });

        if (conflictingBooking) {
            return {
                success: false,
                error: "Room is not available for the extended dates. There is another booking."
            };
        }

        // Calculate additional amount
        const pricePerNight = booking.room?.basePrice
            ? Number(booking.room.basePrice)
            : Number(booking.totalAmount) / (booking.numberOfNights || 1);
        const additionalAmount = pricePerNight * additionalNights;
        const newTotal = Number(booking.totalAmount) + additionalAmount;
        const newNumberOfNights = (booking.numberOfNights || 1) + additionalNights;

        // Update booking
        await db
            .update(bookings)
            .set({
                checkOut: newCheckOutStr,
                totalAmount: newTotal.toFixed(2),
                numberOfNights: newNumberOfNights,
                paymentStatus: "PENDING", // Reset to pending since extra payment is due
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));

        // Add room inventory for extended dates
        const dates: string[] = [];
        const current = new Date(currentCheckOut);
        while (current < newCheckOut) {
            dates.push(current.toISOString().split("T")[0]!);
            current.setDate(current.getDate() + 1);
        }

        for (const date of dates) {
            const existing = await db.query.roomInventory.findFirst({
                where: and(
                    eq(roomInventory.roomId, booking.roomId),
                    eq(roomInventory.date, date)
                ),
            });

            if (existing) {
                await db
                    .update(roomInventory)
                    .set({ status: "OCCUPIED", updatedAt: new Date() })
                    .where(eq(roomInventory.id, existing.id));
            } else {
                await db.insert(roomInventory).values({
                    roomId: booking.roomId,
                    date,
                    status: "OCCUPIED",
                });
            }
        }

        // Log activity
        await db.insert(activityLog).values({
            type: "BOOKING_CONFIRMED", // Using BOOKING_CONFIRMED as closest match for extended stay
            actorId: session?.user?.id,
            hotelId: hotelId,
            bookingId: bookingId,
            description: `Extended stay for ${booking.guestName} by ${additionalNights} night(s)`,
            metadata: {
                guestName: booking.guestName,
                previousCheckOut: booking.checkOut,
                newCheckOut: newCheckOutStr,
                additionalNights,
                additionalAmount,
            },
        });

        revalidatePath("/");
        revalidatePath("/inventory");
        return {
            success: true,
            newCheckOut: newCheckOutStr,
            additionalAmount,
        };
    } catch (error) {
        console.error("Error extending stay:", error);
        return { success: false, error: "Failed to extend stay" };
    }
}

/**
 * Collect remaining payment from guest at hotel
 * Called when guest pays the remaining amount (after 20% advance) at check-in
 */
export async function collectRemainingPayment(
    bookingId: string,
    hotelId: string
): Promise<{ success: boolean; error?: string; amountCollected?: number }> {
    try {
        const session = await auth();
        const booking = await db.query.bookings.findFirst({
            where: and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.paymentStatus === "PAID") {
            return { success: false, error: "Payment already completed" };
        }

        // Calculate remaining amount
        const totalAmount = Number(booking.totalAmount);
        const advancePaid = Number(booking.bookingFee || 0);
        const remainingAmount = totalAmount - advancePaid;

        if (remainingAmount <= 0) {
            return { success: false, error: "No remaining payment due" };
        }

        // Update booking payment status to PAID
        await db
            .update(bookings)
            .set({
                paymentStatus: "PAID",
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId));

        // Log activity
        await db.insert(activityLog).values({
            type: "PAYMENT_RECEIVED",
            actorId: session?.user?.id,
            hotelId: hotelId,
            bookingId: bookingId,
            description: `Collected remaining payment ৳${remainingAmount} from ${booking.guestName}`,
            metadata: {
                guestName: booking.guestName,
                amountCollected: remainingAmount,
                totalAmount: totalAmount,
                advancePaid: advancePaid,
            },
        });

        // Push realtime event
        pushRealtimeEvent({
            type: "PAYMENT_RECEIVED",
            hotelId,
            data: {
                bookingId,
                guestName: booking.guestName,
                amountCollected: remainingAmount,
                totalAmount,
            },
        }).catch((err) => console.error("Failed to push realtime event:", err));

        revalidatePath("/");
        revalidatePath("/scanner");
        return { success: true, amountCollected: remainingAmount };
    } catch (error) {
        console.error("Error collecting payment:", error);
        return { success: false, error: "Failed to collect payment" };
    }
}

/**
 * Get booking details with payment info for partner
 */
export async function getBookingDetails(
    bookingId: string,
    hotelId: string
): Promise<{
    success: boolean;
    error?: string;
    booking?: {
        id: string;
        guestName: string;
        guestPhone: string;
        roomNumber: string;
        roomName: string;
        checkIn: string;
        checkOut: string;
        status: string;
        paymentStatus: string;
        paymentMethod: string | null;
        totalAmount: number;
        advancePaid: number;
        remainingAmount: number;
        bookingFeeStatus: string | null;
    };
}> {
    try {
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
                paymentStatus: bookings.paymentStatus,
                paymentMethod: bookings.paymentMethod,
                totalAmount: bookings.totalAmount,
                bookingFee: bookings.bookingFee,
                bookingFeeStatus: bookings.bookingFeeStatus,
            })
            .from(bookings)
            .leftJoin(rooms, eq(rooms.id, bookings.roomId))
            .where(and(eq(bookings.id, bookingId), eq(bookings.hotelId, hotelId)))
            .limit(1);

        if (result.length === 0) {
            return { success: false, error: "Booking not found" };
        }

        const b = result[0]!;
        const totalAmount = Number(b.totalAmount) || 0;
        // Only count advance as paid if bookingFeeStatus is PAID
        const advancePaid = b.bookingFeeStatus === "PAID" ? (Number(b.bookingFee) || 0) : 0;

        return {
            success: true,
            booking: {
                id: b.id,
                guestName: b.guestName,
                guestPhone: b.guestPhone,
                roomNumber: b.roomNumber ?? "",
                roomName: b.roomName ?? "",
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                status: b.status,
                paymentStatus: b.paymentStatus ?? "PENDING",
                paymentMethod: b.paymentMethod,
                totalAmount,
                advancePaid,
                remainingAmount: totalAmount - advancePaid,
                bookingFeeStatus: b.bookingFeeStatus,
            },
        };
    } catch (error) {
        console.error("Error fetching booking details:", error);
        return { success: false, error: "Failed to fetch booking" };
    }
}

/**
 * Get daily occupancy for charts (last 30 days, sampled to 5 points)
 */
export async function getOccupancyHistory(hotelId: string) {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const bookingsInWindow = await db.query.bookings.findMany({
            where: and(
                eq(bookings.hotelId, hotelId),
                ne(bookings.status, "CANCELLED"),
                ne(bookings.status, "PENDING"),
                gte(bookings.checkOut, thirtyDaysAgo.toISOString().split("T")[0]!),
                lte(bookings.checkIn, today.toISOString().split("T")[0]!)
            ),
        });

        const totalRooms = await db
            .select({ count: sql<number>`count(*)` })
            .from(rooms)
            .where(eq(rooms.hotelId, hotelId))
            .then((res: { count: number }[]) => Number(res[0]?.count) || 20);

        const dailyOccupancy: { date: string; value: number; cityAvg: number }[] = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0]!;

            const occupiedCount = bookingsInWindow.filter((b: { checkIn: string; checkOut: string }) =>
                b.checkIn <= dateStr && b.checkOut > dateStr
            ).length;

            const rate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

            dailyOccupancy.push({
                date: i === 0 ? "Today" : `${date.getDate()}th`,
                value: rate,
                cityAvg: Math.max(0, rate - 10 + Math.floor(Math.random() * 20))
            });
        }

        // Return 5 sample points
        const samples = [
            dailyOccupancy[0],
            dailyOccupancy[7],
            dailyOccupancy[14],
            dailyOccupancy[21],
            dailyOccupancy[29]
        ];
        return samples.filter((item): item is { date: string; value: number; cityAvg: number } => item !== undefined);
    } catch (error) {
        console.error("Error fetching occupancy history:", error);
        return [];
    }
}

/**
 * Get booking sources distribution
 */
export async function getBookingSources(hotelId: string) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sources = await db
            .select({
                source: bookings.bookingSource,
                count: sql<number>`count(*)`,
                revenue: sql<number>`sum(${bookings.totalAmount})`
            })
            .from(bookings)
            .where(and(
                eq(bookings.hotelId, hotelId),
                gte(bookings.createdAt, thirtyDaysAgo),
                ne(bookings.status, "CANCELLED")
            ))
            .groupBy(bookings.bookingSource);

        return sources.map((s: { source: string | null; count: number; revenue: number }) => ({
            source: s.source?.replace("_", " ") || "Other",
            count: Number(s.count),
            revenue: Number(s.revenue)
        }));
    } catch (error) {
        console.error("Error fetching booking sources:", error);
        return [];
    }
}

/**
 * Get maintenance/housekeeping issues grouped by type
 */
export async function getMaintenanceIssues(hotelId: string) {
    try {
        const issues = await db.query.housekeepingTasks.findMany({
            where: and(
                eq(housekeepingTasks.hotelId, hotelId),
                eq(housekeepingTasks.type, "MAINTENANCE"),
                ne(housekeepingTasks.status, "COMPLETED"),
                ne(housekeepingTasks.status, "VERIFIED"),
                ne(housekeepingTasks.status, "CANCELLED")
            ),
            with: { room: true },
            limit: 10
        });

        type IssueType = "ac" | "wifi" | "washroom" | "other";
        const grouped: { type: IssueType; roomCount: number; roomNumbers: string[]; issues: string[] }[] = [];

        const addToGroup = (type: IssueType, issue: typeof issues[0]) => {
            let group = grouped.find(g => g.type === type);
            if (!group) {
                group = { type, roomCount: 0, roomNumbers: [], issues: [] };
                grouped.push(group);
            }
            group.roomCount++;
            if (issue.room) group.roomNumbers.push(issue.room.roomNumber);
            if (issue.notes) group.issues.push(issue.notes);
        };

        issues.forEach((issue: typeof issues[0]) => {
            const notes = (issue.notes || "").toLowerCase();
            if (notes.includes("ac") || notes.includes("air") || notes.includes("cooling")) addToGroup("ac", issue);
            else if (notes.includes("wifi") || notes.includes("internet")) addToGroup("wifi", issue);
            else if (notes.includes("washroom") || notes.includes("toilet") || notes.includes("bath")) addToGroup("washroom", issue);
            else addToGroup("other", issue);
        });

        return grouped.map(g => ({
            ...g,
            roomNumbers: g.roomNumbers.join(", "),
            issues: [...new Set(g.issues)]
        }));
    } catch (error) {
        console.error("Error fetching maintenance issues:", error);
        return [];
    }
}

/**
 * Get guest review stats
 */
export async function getGuestReviewsSummary(hotelId: string) {
    try {
        const reviewStats = await db
            .select({
                avgRating: sql<number>`avg(${reviews.rating})`,
                count: sql<number>`count(*)`
            })
            .from(reviews)
            .where(eq(reviews.hotelId, hotelId));

        const happyCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(reviews)
            .where(and(eq(reviews.hotelId, hotelId), gte(reviews.rating, 4)))
            .then((res: { count: number }[]) => Number(res[0]?.count) || 0);

        const total = Number(reviewStats[0]?.count) || 0;
        const avg = Number(reviewStats[0]?.avgRating) || 0;
        const happyPercent = total > 0 ? Math.round((happyCount / total) * 100) : 80;

        return {
            averageRating: Math.round(avg * 10) / 10,
            totalReviews: total,
            happyPercent,
            unhappyPercent: 100 - happyPercent
        };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { averageRating: 0, totalReviews: 0, happyPercent: 80, unhappyPercent: 20 };
    }
}

/**
 * Get active promotion for hotel
 */
export async function getActivePromotion(hotelId: string) {
    try {
        const promo = await db.query.promotions.findFirst({
            where: and(
                eq(promotions.hotelId, hotelId),
                eq(promotions.isActive, true)
            ),
            orderBy: desc(promotions.createdAt)
        });
        return promo;
    } catch (error) {
        console.error("Error fetching promotion:", error);
        return null;
    }
}

/**
 * Get today's pricing from rooms
 */
export async function getTodaysPricing(hotelId: string) {
    try {
        // Fetch actual rooms for this hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: eq(rooms.hotelId, hotelId),
            orderBy: rooms.basePrice,
            limit: 10 // Show up to 10 different room types
        });

        // Return actual room data with name, type, and price
        return hotelRooms.map((room: typeof hotelRooms[number]) => ({
            id: room.id,
            name: room.name,
            type: room.type,
            basePrice: Number(room.basePrice),
            currentPrice: Number(room.basePrice) // Can be enhanced with dynamic pricing later
        }));
    } catch (error) {
        console.error("Error fetching room pricing:", error);
        return [];
    }
}

/**
 * Save or update a hotel promotion
 */
export async function savePromotion(
    hotelId: string,
    data: {
        enabled: boolean;
        discountPercent: number;
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.error("[savePromotion] No session found");
            return { success: false, error: "Unauthorized" };
        }

        // Validate input
        if (data.discountPercent < 0 || data.discountPercent > 100) {
            console.error("[savePromotion] Invalid discount:", data.discountPercent);
            return { success: false, error: "Discount must be between 0% and 100%" };
        }

        // Check if user owns this hotel
        const hotel = await db.query.hotels.findFirst({
            where: and(eq(hotels.id, hotelId), eq(hotels.ownerId, session.user.id)),
        });

        if (!hotel) {
            console.error("[savePromotion] Hotel not found or unauthorized:", { hotelId, userId: session.user.id });
            return { success: false, error: "Hotel not found or not authorized" };
        }

        // Format value as decimal with 2 decimal places
        const formattedValue = data.discountPercent.toFixed(2);
        console.log("[savePromotion] Saving promotion:", {
            hotelId,
            enabled: data.enabled,
            discountPercent: data.discountPercent,
            formattedValue
        });

        // Find existing "BASIC_PROMO" promotion for this hotel
        const existingPromo = await db.query.promotions.findFirst({
            where: and(
                eq(promotions.hotelId, hotelId),
                eq(promotions.code, `BASIC_${hotelId.substring(0, 8).toUpperCase()}`)
            ),
        });

        const promoCode = `BASIC_${hotelId.substring(0, 8).toUpperCase()}`;

        if (existingPromo) {
            // Update existing promotion
            console.log("[savePromotion] Updating existing promotion:", existingPromo.id);
            await db
                .update(promotions)
                .set({
                    isActive: data.enabled,
                    value: formattedValue,
                    updatedAt: new Date(),
                })
                .where(eq(promotions.id, existingPromo.id));
        } else {
            // Create new promotion
            console.log("[savePromotion] Creating new promotion");
            await db.insert(promotions).values({
                hotelId,
                code: promoCode,
                name: "Basic Promotion",
                description: "Partner discount to attract more customers",
                type: "PERCENTAGE",
                value: formattedValue,
                isActive: data.enabled,
            });
        }

        revalidatePath("/");
        console.log("[savePromotion] Success!");
        return { success: true };
    } catch (error) {
        console.error("[savePromotion] Error saving promotion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save promotion"
        };
    }
}

/**
 * Get platform-wide promotion (managed by Zinu admin)
 * These are promotions where hotelId is NULL - apply to all hotels
 */
export async function getPlatformPromotion() {
    try {
        const platformPromo = await db.query.promotions.findFirst({
            where: and(
                eq(promotions.hotelId, null as unknown as string),
                eq(promotions.isActive, true),
                eq(promotions.type, "PERCENTAGE")
            ),
            orderBy: desc(promotions.createdAt),
        });

        if (!platformPromo) {
            return null;
        }

        return {
            id: platformPromo.id,
            code: platformPromo.code,
            name: platformPromo.name,
            value: platformPromo.value,
            isActive: platformPromo.isActive,
        };
    } catch (error) {
        console.error("Error fetching platform promotion:", error);
        return null;
    }
}
