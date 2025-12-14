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
        // Import bookings for occupancy calculation (same as getAvailableRooms)
        const { bookings } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd } = await import("drizzle-orm");

        // Try to import pricing module with occupancy support
        let calculateTotalDynamicPrice: ((input: {
            basePrice: number;
            checkIn: string;
            checkOut: string;
            hotelOccupancy?: number;
        }) => { finalPrice: number }) | null = null;

        try {
            const pricingModule = await import("@repo/api/pricing");
            calculateTotalDynamicPrice = pricingModule.calculateTotalDynamicPrice;
        } catch (e) {
            console.log("Pricing module not available for search:", e);
        }

        // Get today and tomorrow for dynamic pricing calculation
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkIn = today.toISOString().split('T')[0]!;
        const checkOut = tomorrow.toISOString().split('T')[0]!;

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

        // Transform and filter results with occupancy-based pricing
        let filtered = await Promise.all(result.map(async (h) => {
            const hotelLat = h.latitude ? parseFloat(h.latitude) : null;
            const hotelLng = h.longitude ? parseFloat(h.longitude) : null;

            // Calculate distance if user location provided
            let distance: number | undefined;
            if (latitude && longitude && hotelLat && hotelLng) {
                distance = calculateDistance(latitude, longitude, hotelLat, hotelLng);
            }

            // Calculate hotel occupancy (same logic as getAvailableRooms)
            const basePrice = h.lowestPrice ?? 0;
            let displayPrice = basePrice;
            let hotelOccupancy: number | undefined;

            try {
                const hotelRooms = await db.query.rooms.findMany({
                    where: eq(rooms.hotelId, h.id),
                });

                if (hotelRooms.length > 0) {
                    let occupiedRooms = 0;
                    for (const room of hotelRooms) {
                        try {
                            const existingBooking = await db.query.bookings.findFirst({
                                where: drizzleAnd(
                                    eq(bookings.roomId, room.id),
                                    ne(bookings.status, "CANCELLED"),
                                    lt(bookings.checkIn, checkOut),
                                    gt(bookings.checkOut, checkIn)
                                ),
                            });
                            if (existingBooking) occupiedRooms++;
                        } catch (e) {
                            // Skip if booking check fails
                        }
                    }
                    hotelOccupancy = occupiedRooms / hotelRooms.length;
                }
            } catch (e) {
                console.log("Error calculating occupancy for hotel:", h.id, e);
            }

            // Apply dynamic pricing with occupancy
            if (calculateTotalDynamicPrice && basePrice > 0) {
                try {
                    const priceResult = calculateTotalDynamicPrice({
                        basePrice,
                        checkIn,
                        checkOut,
                        hotelOccupancy,
                    });
                    displayPrice = priceResult.finalPrice;
                } catch (e) {
                    console.log("Error calculating dynamic price:", e);
                }
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
                lowestPrice: displayPrice,
                distance,
            };
        }));

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
 * Applies dynamic pricing for today's date (same logic as room details)
 */
const _getFeaturedHotels = async (limit: number): Promise<HotelWithPrice[]> => {
    try {
        // Import bookings for occupancy calculation (same as getAvailableRooms)
        const { bookings } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd } = await import("drizzle-orm");

        // Try to import pricing module - use the same function as room details
        let calculateTotalDynamicPrice: ((input: {
            basePrice: number;
            checkIn: string;
            checkOut: string;
            hotelOccupancy?: number;
            seasonalRules?: Array<{ id: string; name: string; startDate: string; endDate: string; multiplier: number }>;
        }) => { finalPrice: number; totalPrice: number; nights: number; totalMultiplier: number; appliedRules: Array<{ name: string; description: string }> }) | null = null;

        try {
            const pricingModule = await import("@repo/api/pricing");
            calculateTotalDynamicPrice = pricingModule.calculateTotalDynamicPrice;
        } catch (e) {
            console.log("Pricing module not available for featured hotels:", e);
        }

        // Get today and tomorrow for dynamic pricing calculation
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const checkIn = today.toISOString().split('T')[0]!;
        const checkOut = tomorrow.toISOString().split('T')[0]!;

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

        // Calculate occupancy and dynamic price for each hotel
        const hotelsWithPricing = await Promise.all(
            result.map(async (h) => {
                const basePrice = h.lowestPrice ?? 0;
                let displayPrice = basePrice;

                // Calculate hotel occupancy (same logic as getAvailableRooms)
                let hotelOccupancy: number | undefined;
                try {
                    const hotelRooms = await db.query.rooms.findMany({
                        where: eq(rooms.hotelId, h.id),
                    });

                    if (hotelRooms.length > 0) {
                        let occupiedRooms = 0;
                        for (const room of hotelRooms) {
                            try {
                                const existingBooking = await db.query.bookings.findFirst({
                                    where: drizzleAnd(
                                        eq(bookings.roomId, room.id),
                                        ne(bookings.status, "CANCELLED"),
                                        lt(bookings.checkIn, checkOut),
                                        gt(bookings.checkOut, checkIn)
                                    ),
                                });
                                if (existingBooking) occupiedRooms++;
                            } catch (e) {
                                // Skip if booking check fails
                            }
                        }
                        hotelOccupancy = occupiedRooms / hotelRooms.length;
                    }
                } catch (e) {
                    console.log("Error calculating occupancy for hotel:", h.id, e);
                }

                // Apply dynamic pricing if available (now includes occupancy like getAvailableRooms)
                if (calculateTotalDynamicPrice && basePrice > 0) {
                    try {
                        const priceResult = calculateTotalDynamicPrice({
                            basePrice,
                            checkIn,
                            checkOut,
                            hotelOccupancy, // Now includes occupancy data for consistent pricing
                        });
                        displayPrice = priceResult.finalPrice;
                    } catch (e) {
                        console.log("Error calculating dynamic price:", e);
                    }
                }

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
            })
        );

        return hotelsWithPricing;
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
        // Import bookings for availability check
        const { bookings, seasonalRules: seasonalRulesTable } = await import("@repo/db/schema");
        const { ne, lt, gt, and: drizzleAnd } = await import("drizzle-orm");

        // Get all active rooms for the hotel
        const hotelRooms = await db.query.rooms.findMany({
            where: and(eq(rooms.hotelId, hotelId), eq(rooms.isActive, true)),
        });

        // If no active rooms, try getting all rooms (backwards compatibility)
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

        // Try to get seasonal rules, but don't fail if table doesn't exist
        let seasonalRules: Array<{
            id: string;
            name: string;
            startDate: string;
            endDate: string;
            multiplier: number;
        }> = [];
        try {
            const rules = await db.query.seasonalRules?.findMany?.({
                where: eq(seasonalRulesTable.isActive, true),
            });
            if (rules) {
                seasonalRules = rules.map(r => ({
                    id: r.id,
                    name: r.name,
                    startDate: r.startDate,
                    endDate: r.endDate,
                    multiplier: Number(r.multiplier),
                }));
            }
        } catch (e) {
            // Seasonal rules table might not exist yet
            console.log("Seasonal rules not available:", e);
        }

        // Calculate hotel occupancy for demand-based pricing
        const totalRooms = roomList.length;
        let occupiedRooms = 0;
        for (const room of roomList) {
            try {
                const booking = await db.query.bookings.findFirst({
                    where: drizzleAnd(
                        eq(bookings.roomId, room.id),
                        ne(bookings.status, "CANCELLED"),
                        lt(bookings.checkIn, checkOut),
                        gt(bookings.checkOut, checkIn)
                    ),
                });
                if (booking) occupiedRooms++;
            } catch (e) {
                // Skip booking check if fails
            }
        }
        const hotelOccupancy = totalRooms > 0 ? occupiedRooms / totalRooms : 0;

        // Try to import pricing module
        let calculateTotalDynamicPrice: ((input: {
            basePrice: number;
            checkIn: string;
            checkOut: string;
            hotelOccupancy?: number;
            seasonalRules?: typeof seasonalRules;
        }) => { finalPrice: number; totalPrice: number; nights: number; totalMultiplier: number; appliedRules: Array<{ name: string; description: string }> }) | null = null;

        try {
            const pricingModule = await import("@repo/api/pricing");
            calculateTotalDynamicPrice = pricingModule.calculateTotalDynamicPrice;
        } catch (e) {
            console.log("Pricing module not available, using base price:", e);
        }

        // Format dates for display
        const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        // Calculate nights between dates
        const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

        // Check each room for booking conflicts and calculate dynamic price
        const roomsWithAvailability = await Promise.all(
            roomList.map(async (room) => {
                // Check for overlapping bookings (not cancelled)
                let existingBooking = null;
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

                // Calculate dynamic price or use base price
                const basePrice = Number(room.basePrice) || 0;
                let dynamicPrice = basePrice;
                let totalDynamicPrice = basePrice * nights;
                let appliedRules: Array<{ name: string; description: string }> = [];
                let totalMultiplier = 1;

                if (calculateTotalDynamicPrice) {
                    try {
                        const pricingResult = calculateTotalDynamicPrice({
                            basePrice,
                            checkIn,
                            checkOut,
                            hotelOccupancy,
                            seasonalRules,
                        });
                        dynamicPrice = pricingResult.finalPrice;
                        totalDynamicPrice = pricingResult.totalPrice;
                        totalMultiplier = pricingResult.totalMultiplier;
                        appliedRules = pricingResult.appliedRules.map(r => ({
                            name: r.name,
                            description: r.description,
                        }));
                    } catch (e) {
                        console.log("Error calculating dynamic price:", e);
                    }
                }

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
                    unavailableReason: existingBooking
                        ? `Booked ${formatDate(existingBooking.checkIn)} - ${formatDate(existingBooking.checkOut)}`
                        : undefined,
                    priceBreakdown: appliedRules.length > 0 ? {
                        multiplier: totalMultiplier,
                        rules: appliedRules,
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

