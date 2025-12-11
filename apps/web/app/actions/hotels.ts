"use server";

import { db } from "@repo/db";
import { hotels, rooms } from "@repo/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface HotelWithPrice {
    id: string;
    name: string;
    location: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    amenities: string[];
    payAtHotel: boolean;
    lowestPrice: number;
}

export interface SearchParams {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    payAtHotel?: boolean;
    sortBy?: "price" | "rating";
}

/**
 * Search hotels by city and availability
 */
export async function searchHotels(params: SearchParams): Promise<HotelWithPrice[]> {
    const { city, minPrice, maxPrice, payAtHotel, sortBy = "rating" } = params;

    try {
        // Get all hotels with their lowest room price
        const result = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                location: hotels.address,
                city: hotels.city,
                latitude: hotels.latitude,
                longitude: hotels.longitude,
                rating: hotels.rating,
                reviewCount: hotels.reviewCount,
                imageUrl: hotels.coverImage,
                amenities: hotels.amenities,
                payAtHotel: hotels.payAtHotelEnabled,
                lowestPrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestPrice"),
            })
            .from(hotels)
            .leftJoin(rooms, eq(rooms.hotelId, hotels.id))
            .where(
                and(
                    eq(hotels.status, "ACTIVE"),
                    city ? eq(hotels.city, city) : undefined
                )
            )
            .groupBy(hotels.id)
            .orderBy(sortBy === "price" ? sql`MIN(${rooms.basePrice})` : desc(hotels.rating));

        // Apply price filters and payAtHotel filter
        let filtered = result;

        if (minPrice !== undefined) {
            filtered = filtered.filter((h) => h.lowestPrice >= minPrice);
        }
        if (maxPrice !== undefined) {
            filtered = filtered.filter((h) => h.lowestPrice <= maxPrice);
        }
        if (payAtHotel) {
            filtered = filtered.filter((h) => h.payAtHotel === true);
        }

        return filtered.map((h) => ({
            id: h.id,
            name: h.name,
            location: h.location,
            city: h.city,
            latitude: h.latitude ? parseFloat(h.latitude) : null,
            longitude: h.longitude ? parseFloat(h.longitude) : null,
            rating: h.rating ? parseFloat(h.rating) : 0,
            reviewCount: h.reviewCount,
            imageUrl: h.imageUrl ?? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
            amenities: h.amenities ?? [],
            payAtHotel: h.payAtHotel,
            lowestPrice: h.lowestPrice ?? 0,
        }));
    } catch (error) {
        console.error("Error searching hotels:", error);
        return [];
    }
}

/**
 * Get hotel details by ID
 */
export async function getHotelById(hotelId: string) {
    try {
        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.id, hotelId),
            with: {
                rooms: true,
            },
        });

        if (!hotel) return null;

        return {
            ...hotel,
            images: hotel.photos ?? [hotel.coverImage ?? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"],
            amenities: hotel.amenities ?? [],
        };
    } catch (error) {
        console.error("Error fetching hotel:", error);
        return null;
    }
}

/**
 * Get featured hotels for home page
 */
export async function getFeaturedHotels(limit = 4): Promise<HotelWithPrice[]> {
    try {
        const result = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                location: hotels.address,
                city: hotels.city,
                latitude: hotels.latitude,
                longitude: hotels.longitude,
                rating: hotels.rating,
                reviewCount: hotels.reviewCount,
                imageUrl: hotels.coverImage,
                amenities: hotels.amenities,
                payAtHotel: hotels.payAtHotelEnabled,
                lowestPrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestPrice"),
            })
            .from(hotels)
            .leftJoin(rooms, eq(rooms.hotelId, hotels.id))
            .where(eq(hotels.status, "ACTIVE"))
            .groupBy(hotels.id)
            .orderBy(desc(hotels.rating))
            .limit(limit);

        return result.map((h) => ({
            id: h.id,
            name: h.name,
            location: h.location,
            city: h.city,
            latitude: h.latitude ? parseFloat(h.latitude) : null,
            longitude: h.longitude ? parseFloat(h.longitude) : null,
            rating: h.rating ? parseFloat(h.rating) : 0,
            reviewCount: h.reviewCount,
            imageUrl: h.imageUrl ?? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
            amenities: h.amenities ?? [],
            payAtHotel: h.payAtHotel,
            lowestPrice: h.lowestPrice ?? 0,
        }));
    } catch (error) {
        console.error("Error fetching featured hotels:", error);
        return [];
    }
}

/**
 * Get available rooms for a hotel on specific dates
 * Returns room with availability status
 */
export async function getAvailableRooms(
    hotelId: string,
    checkIn: string,
    checkOut: string
): Promise<{
    id: string;
    name: string;
    type: string;
    basePrice: string;
    maxGuests: number;
    isAvailable: boolean;
    unavailableReason?: string;
}[]> {
    try {
        // Import bookings for availability check
        const { bookings } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd } = await import("drizzle-orm");

        // Get all active rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)),
        });

        // Check each room for booking conflicts
        const roomsWithAvailability = await Promise.all(
            hotelRooms.map(async (room) => {
                // Check for overlapping bookings (not cancelled)
                // Overlap exists when: existingCheckIn < newCheckOut AND existingCheckOut > newCheckIn
                // This allows back-to-back bookings (checkout 12th, checkin 12th is OK)
                const existingBooking = await db.query.bookings.findFirst({
                    where: drizzleAnd(
                        eq(bookings.roomId, room.id),
                        ne(bookings.status, "CANCELLED"),
                        lt(bookings.checkIn, checkOut),  // existing starts before new ends
                        gt(bookings.checkOut, checkIn)   // existing ends after new starts
                    ),
                });

                // Format dates for display
                const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                return {
                    id: room.id,
                    name: room.name,
                    type: room.type,
                    basePrice: room.basePrice,
                    maxGuests: room.maxGuests,
                    isAvailable: !existingBooking,
                    unavailableReason: existingBooking
                        ? `Booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}`
                        : undefined,
                };
            })
        );

        return roomsWithAvailability;
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        return [];
    }
}
