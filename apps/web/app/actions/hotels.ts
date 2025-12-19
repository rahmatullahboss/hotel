"use server";

import { db } from "@repo/db";
import { hotels, rooms, promotions } from "@repo/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

/**
 * Get active promotion for a hotel and apply discount to price
 */
async function getPromotionDiscount(hotelId: string): Promise<number> {
    try {
        const activePromotion = await db.query.promotions.findFirst({
            where: and(
                eq(promotions.hotelId, hotelId),
                eq(promotions.isActive, true)
            ),
            orderBy: desc(promotions.createdAt)
        });

        if (activePromotion && activePromotion.type === "PERCENTAGE") {
            return parseFloat(activePromotion.value);
        }

        return 0;
    } catch (error) {
        console.error("[getPromotionDiscount] Error:", error);
        return 0;
    }
}

/**
 * Apply promotion discount to a price
 */
function applyPromotionDiscount(price: number, discountPercent: number): number {
    if (discountPercent <= 0) return price;
    const discountedPrice = price * (1 - discountPercent / 100);
    return Math.round(discountedPrice);
}

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
    zinuCode?: string | null;
    category?: string | null;
}

export interface SearchParams {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    payAtHotel?: boolean;
    minRating?: number;
    amenities?: string[];
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
    const { city, minPrice, maxPrice, payAtHotel, minRating, amenities, sortBy = "rating", latitude, longitude, radiusKm = 10 } = params;

    try {
        // Get all hotels with pre-computed dynamic price (or fallback to base price)
        const result = await db
            .select({
                id: hotels.id,
                name: hotels.name,
                zinuCode: hotels.zinuCode,
                category: hotels.category,
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
                    city ? or(
                        ilike(hotels.city, `%${city}%`),
                        ilike(hotels.address, `%${city}%`),
                        ilike(hotels.name, `%${city}%`)
                    ) : undefined
                )
            )
            .groupBy(hotels.id)
            .orderBy(sortBy === "price"
                ? sql`COALESCE(${hotels.lowestDynamicPrice}, MIN(${rooms.basePrice}))`
                : desc(hotels.rating));

        // Fetch active promotions for all hotels
        const hotelIds = result.map((h: typeof result[number]) => h.id);
        const activePromotions = hotelIds.length > 0 ? await db.query.promotions.findMany({
            where: and(
                sql`${promotions.hotelId} IN (${sql.join(hotelIds.map((id: string) => sql`${id}`), sql`, `)})`,
                eq(promotions.isActive, true)
            ),
        }) : [];

        // Create a map of hotelId -> discount percentage
        const promotionMap = new Map<string, number>();
        activePromotions.forEach((promo: typeof activePromotions[number]) => {
            if (promo.hotelId && promo.type === "PERCENTAGE") {
                promotionMap.set(promo.hotelId, parseFloat(promo.value));
            }
        });

        // Transform results - use cached price as single source of truth
        let filtered = result.map((h: typeof result[number]) => {
            const hotelLat = h.latitude ? parseFloat(h.latitude) : null;
            const hotelLng = h.longitude ? parseFloat(h.longitude) : null;

            // Calculate distance if user location provided
            let distance: number | undefined;
            if (latitude && longitude && hotelLat && hotelLng) {
                distance = calculateDistance(latitude, longitude, hotelLat, hotelLng);
            }

            // Use pre-computed price (single source of truth), fallback to base price
            let displayPrice = h.lowestDynamicPrice
                ? parseFloat(h.lowestDynamicPrice)
                : (h.lowestBasePrice ?? 0);

            // Apply promotion discount if hotel has active promotion
            const promotionDiscount = promotionMap.get(h.id) || 0;
            if (promotionDiscount > 0) {
                displayPrice = applyPromotionDiscount(displayPrice, promotionDiscount);
            }

            return {
                id: h.id,
                name: h.name,
                zinuCode: h.zinuCode,
                category: h.category,
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
            filtered = filtered.filter((h: typeof filtered[number]) => h.distance !== undefined && h.distance <= radiusKm);
        }

        // Apply price filters
        if (minPrice !== undefined) {
            filtered = filtered.filter((h: typeof filtered[number]) => h.lowestPrice >= minPrice);
        }
        if (maxPrice !== undefined) {
            filtered = filtered.filter((h: typeof filtered[number]) => h.lowestPrice <= maxPrice);
        }
        if (payAtHotel) {
            filtered = filtered.filter((h: typeof filtered[number]) => h.payAtHotel === true);
        }

        // Rating filter
        if (minRating !== undefined && minRating > 0) {
            filtered = filtered.filter((h: typeof filtered[number]) => h.rating >= minRating);
        }

        // Amenities filter (must have ALL specified amenities)
        if (amenities && amenities.length > 0) {
            filtered = filtered.filter((h: typeof filtered[number]) => {
                return amenities.every((amenity: string) =>
                    h.amenities.some((a: string) =>
                        a.toLowerCase().includes(amenity.toLowerCase())
                    )
                );
            });
        }

        // Sort by distance if geo-searching
        if (sortBy === "distance" && latitude && longitude) {
            filtered.sort((a: typeof filtered[number], b: typeof filtered[number]) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
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
                zinuCode: hotels.zinuCode,
                category: hotels.category,
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
        return result.map((h: typeof result[number]) => {
            // Use pre-computed price, fallback to base price if not yet computed
            const displayPrice = h.lowestDynamicPrice
                ? parseFloat(h.lowestDynamicPrice)
                : (h.lowestBasePrice ?? 0);

            return {
                id: h.id,
                name: h.name,
                zinuCode: h.zinuCode,
                category: h.category,
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
 * Supports room type grouping (OYO/Booking.com style)
 */
export interface RoomWithDetails {
    id: string;                // For grouped rooms, this is the first available room's ID
    name: string;
    type: string;
    basePrice: string;
    dynamicPrice: number;      // Calculated dynamic price per night (same for all rooms of this type)
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
    // Room grouping fields (for "X rooms available" display)
    availableCount: number;    // Number of rooms available of this type
    totalCount: number;        // Total rooms of this type
    roomIds: string[];         // All room IDs of this type (for auto-assignment during booking)
}

/**
 * Get available rooms for a hotel on specific dates
 * Groups rooms by (name, type, basePrice) - OYO/Booking.com style
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
        const { ne, lt, gt, and: drizzleAnd, eq, inArray, gte, lt: drizzleLt } = await import("drizzle-orm");

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

        const roomIds = roomList.map((r: typeof roomList[number]) => r.id);

        // Fetch pre-computed prices from inventory for the requested date range
        const inventoryPrices = await db.query.roomInventory.findMany({
            where: drizzleAnd(
                inArray(roomInventory.roomId, roomIds),
                gte(roomInventory.date, checkIn),
                drizzleLt(roomInventory.date, checkOut)
            ),
        });

        // Calculate nights
        const nights = Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
        const stayDates: string[] = [];
        for (let i = 0; i < nights; i++) {
            const d = new Date(checkIn);
            d.setDate(d.getDate() + i);
            stayDates.push(d.toISOString().split('T')[0]!);
        }

        // Check availability for each room
        const roomAvailability = await Promise.all(
            roomList.map(async (room: typeof roomList[number]) => {
                let isBooked = false;
                try {
                    const existingBooking = await db.query.bookings.findFirst({
                        where: drizzleAnd(
                            eq(bookings.roomId, room.id),
                            ne(bookings.status, "CANCELLED"),
                            lt(bookings.checkIn, checkOut),
                            gt(bookings.checkOut, checkIn)
                        ),
                    });
                    isBooked = !!existingBooking;
                } catch (e) {
                    // Skip if bookings query fails
                }

                return {
                    room,
                    isAvailable: !isBooked,
                };
            })
        );

        // Group rooms by (name, type, basePrice) - this is the room "type"
        const roomGroups = new Map<string, {
            rooms: typeof roomList;
            availableRooms: typeof roomList;
            availableRoomIds: string[];
        }>();

        for (const { room, isAvailable } of roomAvailability) {
            // Create a grouping key: name|type|basePrice
            const groupKey = `${room.name}|${room.type}|${room.basePrice}`;

            if (!roomGroups.has(groupKey)) {
                roomGroups.set(groupKey, {
                    rooms: [],
                    availableRooms: [],
                    availableRoomIds: [],
                });
            }

            const group = roomGroups.get(groupKey)!;
            group.rooms.push(room);

            if (isAvailable) {
                group.availableRooms.push(room);
                group.availableRoomIds.push(room.id);
            }
        }

        // Convert groups to RoomWithDetails array
        const groupedRooms: RoomWithDetails[] = [];

        for (const [groupKey, group] of roomGroups) {
            // Use the first room as the representative for this group
            const representativeRoom = group.availableRooms[0] ?? group.rooms[0]!;
            const totalCount = group.rooms.length;
            const availableCount = group.availableRooms.length;

            // Calculate dynamic price using inventory data
            // Use the first available room's inventory prices (all same-type rooms should have same price)
            let totalDynamicPrice = 0;
            let missingInventory = false;

            for (const dateStr of stayDates) {
                // Try to find inventory price from any room in the group
                // (they should all have the same computed price for same base price)
                let priceEntry = null;
                for (const roomId of group.availableRoomIds.length > 0 ? group.availableRoomIds : [representativeRoom.id]) {
                    priceEntry = inventoryPrices.find(
                        (p: typeof inventoryPrices[number]) => p.roomId === roomId && p.date === dateStr
                    );
                    if (priceEntry?.price) break;
                }

                if (priceEntry && priceEntry.price) {
                    totalDynamicPrice += parseFloat(priceEntry.price);
                } else {
                    // Fallback to base price if no inventory
                    totalDynamicPrice += Number(representativeRoom.basePrice);
                    missingInventory = true;
                }
            }

            // Average nightly price
            const avgPrice = totalDynamicPrice / nights;
            let dynamicPrice = Math.round(avgPrice);
            let finalTotalPrice = totalDynamicPrice;

            // Apply promotion discount if hotel has active promotion
            const promotionDiscount = await getPromotionDiscount(hotelId);
            if (promotionDiscount > 0) {
                dynamicPrice = applyPromotionDiscount(dynamicPrice, promotionDiscount);
                finalTotalPrice = applyPromotionDiscount(totalDynamicPrice, promotionDiscount);
            }

            groupedRooms.push({
                id: representativeRoom.id, // First available room's ID (or first room if none available)
                name: representativeRoom.name,
                type: representativeRoom.type,
                basePrice: representativeRoom.basePrice,
                dynamicPrice,
                totalDynamicPrice: finalTotalPrice,
                nights,
                maxGuests: representativeRoom.maxGuests,
                description: representativeRoom.description,
                photos: representativeRoom.photos ?? [],
                amenities: representativeRoom.amenities ?? [],
                isAvailable: availableCount > 0,
                unavailableReason: availableCount === 0 ? "All rooms booked for these dates" : undefined,
                priceBreakdown: missingInventory ? {
                    multiplier: 1,
                    rules: [{ name: "Base Rate", description: "Standard rate" }]
                } : undefined,
                // Room grouping fields
                availableCount,
                totalCount,
                roomIds: group.availableRoomIds, // Only available room IDs for booking
            });
        }

        // Sort: available rooms first, then by price
        groupedRooms.sort((a, b) => {
            if (a.isAvailable !== b.isAvailable) {
                return a.isAvailable ? -1 : 1;
            }
            return a.dynamicPrice - b.dynamicPrice;
        });

        return groupedRooms;
    } catch (error) {
        console.error("Error fetching available rooms:", error);
        return [];
    }
}

