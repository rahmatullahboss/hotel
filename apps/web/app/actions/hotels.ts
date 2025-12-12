"use server";

import { db } from "@repo/db";
import { hotels, rooms } from "@repo/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

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
    distance?: number; // km from search point
}

export interface SearchParams {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    payAtHotel?: boolean;
    sortBy?: "price" | "rating" | "distance";
    // Geo-based search
    latitude?: number;
    longitude?: number;
    radiusKm?: number; // Max distance in km
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Search hotels by city and/or proximity
 */
export async function searchHotels(params: SearchParams): Promise<HotelWithPrice[]> {
    const { city, minPrice, maxPrice, payAtHotel, sortBy = "rating", latitude, longitude, radiusKm = 10 } = params;

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

        // Transform and filter results
        let filtered = result.map((h) => {
            const hotelLat = h.latitude ? parseFloat(h.latitude) : null;
            const hotelLng = h.longitude ? parseFloat(h.longitude) : null;

            // Calculate distance if user location provided
            let distance: number | undefined;
            if (latitude && longitude && hotelLat && hotelLng) {
                distance = calculateDistance(latitude, longitude, hotelLat, hotelLng);
            }

            return {
                id: h.id,
                name: h.name,
                location: h.location,
                city: h.city,
                latitude: hotelLat,
                longitude: hotelLng,
                rating: h.rating ? parseFloat(h.rating) : 0,
                reviewCount: h.reviewCount,
                imageUrl: h.imageUrl ?? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                amenities: h.amenities ?? [],
                payAtHotel: h.payAtHotel,
                lowestPrice: h.lowestPrice ?? 0,
                distance,
            };
        });

        // Apply geo filter if location provided
        if (latitude && longitude) {
            filtered = filtered.filter((h) => h.distance !== undefined && h.distance <= radiusKm);
        }

        // Apply price filters
        if (minPrice !== undefined) {
            filtered = filtered.filter((h) => h.lowestPrice >= minPrice);
        }
        if (maxPrice !== undefined) {
            filtered = filtered.filter((h) => h.lowestPrice <= maxPrice);
        }
        if (payAtHotel) {
            filtered = filtered.filter((h) => h.payAtHotel === true);
        }

        // Sort by distance if geo-searching
        if (sortBy === "distance" && latitude && longitude) {
            filtered.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        }

        return filtered;
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
 * Get featured hotels for home page (cached for 60 seconds)
 */
const _getFeaturedHotels = async (limit: number): Promise<HotelWithPrice[]> => {
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
};

export const getFeaturedHotels = unstable_cache(
    _getFeaturedHotels,
    ["featured-hotels"],
    { tags: ["hotels"], revalidate: 60 }
);

/**
 * Room data with availability and full details for display
 */
export interface RoomWithDetails {
    id: string;
    name: string;
    type: string;
    basePrice: string;
    dynamicPrice: number;      // Calculated dynamic price per night
    totalDynamicPrice: number; // Total for all nights
    nights: number;
    maxGuests: number;
    description: string | null;
    photos: string[];
    amenities: string[];
    isAvailable: boolean;
    unavailableReason?: string;
    priceBreakdown?: {
        multiplier: number;
        rules: Array<{ name: string; description: string }>;
    };
}

/**
 * Get available rooms for a hotel on specific dates
 * Returns room with availability status, full details, and dynamic pricing
 */
export async function getAvailableRooms(
    hotelId: string,
    checkIn: string,
    checkOut: string
): Promise<RoomWithDetails[]> {
    try {
        // Import bookings and seasonalRules for availability check and pricing
        const { bookings, seasonalRules: seasonalRulesTable } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd } = await import("drizzle-orm");
        const { calculateTotalDynamicPrice } = await import("@repo/api/pricing");

        // Get all active rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)),
        });

        // Get active seasonal rules for dynamic pricing
        const seasonalRules = await db.query.seasonalRules?.findMany?.({
            where: eq(seasonalRulesTable.isActive, true),
        }) ?? [];

        // Calculate hotel occupancy for demand-based pricing
        // Count rooms with active bookings for the date range
        const totalRooms = hotelRooms.length;
        let occupiedRooms = 0;
        if (totalRooms > 0) {
            for (const room of hotelRooms) {
                const booking = await db.query.bookings.findFirst({
                    where: drizzleAnd(
                        eq(bookings.roomId, room.id),
                        ne(bookings.status, "CANCELLED"),
                        lt(bookings.checkIn, checkOut),
                        gt(bookings.checkOut, checkIn)
                    ),
                });
                if (booking) occupiedRooms++;
            }
        }
        const hotelOccupancy = totalRooms > 0 ? occupiedRooms / totalRooms : 0;

        // Check each room for booking conflicts and calculate dynamic price
        const roomsWithAvailability = await Promise.all(
            hotelRooms.map(async (room) => {
                // Check for overlapping bookings (not cancelled)
                const existingBooking = await db.query.bookings.findFirst({
                    where: drizzleAnd(
                        eq(bookings.roomId, room.id),
                        ne(bookings.status, "CANCELLED"),
                        lt(bookings.checkIn, checkOut),
                        gt(bookings.checkOut, checkIn)
                    ),
                });

                // Calculate dynamic price
                const basePrice = Number(room.basePrice) || 0;
                const pricingResult = calculateTotalDynamicPrice({
                    basePrice,
                    checkIn,
                    checkOut,
                    hotelOccupancy,
                    seasonalRules: seasonalRules.map(r => ({
                        id: r.id,
                        name: r.name,
                        startDate: r.startDate,
                        endDate: r.endDate,
                        multiplier: Number(r.multiplier),
                    })),
                });

                // Format dates for display
                const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

                return {
                    id: room.id,
                    name: room.name,
                    type: room.type,
                    basePrice: room.basePrice,
                    dynamicPrice: pricingResult.finalPrice,
                    totalDynamicPrice: pricingResult.totalPrice,
                    nights: pricingResult.nights,
                    maxGuests: room.maxGuests,
                    description: room.description,
                    photos: room.photos ?? [],
                    amenities: room.amenities ?? [],
                    isAvailable: !existingBooking,
                    unavailableReason: existingBooking
                        ? `Booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}`
                        : undefined,
                    priceBreakdown: pricingResult.appliedRules.length > 0 ? {
                        multiplier: pricingResult.totalMultiplier,
                        rules: pricingResult.appliedRules.map(r => ({
                            name: r.name,
                            description: r.description,
                        })),
                    } : undefined,
                };
            })
        );

        return roomsWithAvailability;
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        return [];
    }
}

