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
 * Uses pre-computed lowestDynamicPrice from cron job (single source of truth)
 */
export async function searchHotels(params: SearchParams): Promise<HotelWithPrice[]> {
    const { city, minPrice, maxPrice, payAtHotel, sortBy = "rating", latitude, longitude, radiusKm = 10 } = params;

    try {
        // Get all hotels with pre-computed dynamic price (or fallback to base price)
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
                // Use cached dynamic price if available, otherwise fallback to min base price
                lowestDynamicPrice: hotels.lowestDynamicPrice,
                lowestBasePrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestBasePrice"),
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
            .orderBy(sortBy === "price"
                ? sql`COALESCE(${hotels.lowestDynamicPrice}, MIN(${rooms.basePrice}))`
                : desc(hotels.rating));

        // Transform results - use cached price as single source of truth
        let filtered = result.map((h) => {
            const hotelLat = h.latitude ? parseFloat(h.latitude) : null;
            const hotelLng = h.longitude ? parseFloat(h.longitude) : null;

            // Calculate distance if user location provided
            let distance: number | undefined;
            if (latitude && longitude && hotelLat && hotelLng) {
                distance = calculateDistance(latitude, longitude, hotelLat, hotelLng);
            }

            // Use pre-computed price (single source of truth), fallback to base price
            const displayPrice = h.lowestDynamicPrice
                ? parseFloat(h.lowestDynamicPrice)
                : (h.lowestBasePrice ?? 0);

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
                lowestPrice: displayPrice,
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
 * Uses pre-computed lowestDynamicPrice from cron job (single source of truth)
 */
const _getFeaturedHotels = async (limit: number): Promise<HotelWithPrice[]> => {
    try {
        // Get hotels with pre-computed dynamic price (single source of truth)
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
                // Use cached dynamic price if available, otherwise fallback to min base price
                lowestDynamicPrice: hotels.lowestDynamicPrice,
                lowestBasePrice: sql<number>`MIN(${rooms.basePrice})`.as("lowestBasePrice"),
            })
            .from(hotels)
            .leftJoin(rooms, eq(rooms.hotelId, hotels.id))
            .where(eq(hotels.status, "ACTIVE"))
            .groupBy(hotels.id)
            .orderBy(desc(hotels.rating))
            .limit(limit);

        // Transform results - use cached price as single source of truth
        return result.map((h) => {
            // Use pre-computed price, fallback to base price if not yet computed
            const displayPrice = h.lowestDynamicPrice
                ? parseFloat(h.lowestDynamicPrice)
                : (h.lowestBasePrice ?? 0);

            return {
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
                lowestPrice: displayPrice,
            };
        });
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
 * Uses pre-computed prices from roomInventory (single source of truth)
 */
export async function getAvailableRooms(
    hotelId: string,
    checkIn: string,
    checkOut: string
): Promise<RoomWithDetails[]> {
    try {
        // Import bookings and inventory for availability/pricing check
        const { bookings, roomInventory } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd, eq, inArray } = await import("drizzle-orm");

        // Get all active rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)),
        });

        // If no active rooms, try getting all rooms
        let roomList = hotelRooms;
        if (hotelRooms.length === 0) {
            roomList = await db.query.rooms.findMany({
                where: eq(rooms.hotelId, hotelId),
            });
        }

        if (roomList.length === 0) {
            console.log("No rooms found for hotel:", hotelId);
            return [];
        }

        const roomIds = roomList.map(r => r.id);

        // Fetch pre-computed prices from inventory for the requested date range
        // This is the SINGLE SOURCE OF TRUTH for pricing
        // We need prices for dates: checkIn (inclusive) to checkOut (exclusive)
        // e.g., stay from Jan 1 to Jan 3 = need prices for Jan 1 and Jan 2
        const { gte, lt: drizzleLt } = await import("drizzle-orm");
        const inventoryPrices = await db.query.roomInventory.findMany({
            where: drizzleAnd(
                inArray(roomInventory.roomId, roomIds),
                gte(roomInventory.date, checkIn),   // Include check-in date
                drizzleLt(roomInventory.date, checkOut)  // Exclude check-out date
            ),
        });

        // Format dates for display
        const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        // We need price for each night of the stay
        const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
        const stayDates: string[] = [];
        for (let i = 0; i < nights; i++) {
            const d = new Date(checkIn);
            d.setDate(d.getDate() + i);
            stayDates.push(d.toISOString().split('T')[0]!);
        }

        // Check availability (existing bookings)
        const roomsWithAvailability = await Promise.all(
            roomList.map(async (room) => {
                let existingBooking: any = null;
                try {
                    existingBooking = await db.query.bookings.findFirst({
                        where: drizzleAnd(
                            eq(bookings.roomId, room.id),
                            ne(bookings.status, "CANCELLED"),
                            lt(bookings.checkIn, checkOut),
                            gt(bookings.checkOut, checkIn)
                        ),
                    });
                } catch (e) {
                    // Skip if bookings query fails
                }

                // Calculate total price using inventory data
                let totalDynamicPrice = 0;
                let missingInventory = false;

                for (const dateStr of stayDates) {
                    const priceEntry = inventoryPrices.find(
                        p => p.roomId === room.id && p.date === dateStr
                    );

                    if (priceEntry && priceEntry.price) {
                        totalDynamicPrice += parseFloat(priceEntry.price);
                    } else {
                        // Fallback to base price if no inventory (e.g. far future)
                        totalDynamicPrice += Number(room.basePrice);
                        missingInventory = true;
                    }
                }

                // Average nightly price
                const avgPrice = totalDynamicPrice / nights;
                const dynamicPrice = Math.round(avgPrice);

                return {
                    id: room.id,
                    name: room.name,
                    type: room.type,
                    basePrice: room.basePrice,
                    dynamicPrice,
                    totalDynamicPrice,
                    nights,
                    maxGuests: room.maxGuests,
                    description: room.description,
                    photos: room.photos ?? [],
                    amenities: room.amenities ?? [],
                    isAvailable: !existingBooking,
                    unavailableReason: existingBooking && existingBooking.checkIn && existingBooking.checkOut
                        ? `Booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}`
                        : undefined,
                    // We can reconstruct minimal breakdown if needed, or rely on total
                    priceBreakdown: missingInventory ? {
                        multiplier: 1,
                        rules: [{ name: "Base Rate", description: "Standard rate" }]
                    } : undefined
                };
            })
        );

        return roomsWithAvailability;
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        return [];
    }
}

