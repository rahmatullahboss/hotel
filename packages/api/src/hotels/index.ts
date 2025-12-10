import { z } from "zod";

// Hotel validation schemas
export const createHotelSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    address: z.string().min(5).max(500),
    city: z.string().min(2).max(100),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    amenities: z.array(z.string()).default([]),
});

export const updateHotelSchema = createHotelSchema.partial().extend({
    hotelId: z.string().uuid(),
});

// Room validation schemas
export const createRoomSchema = z.object({
    hotelId: z.string().uuid(),
    name: z.string().min(1).max(100),
    type: z.enum(["SINGLE", "DOUBLE", "SUITE", "DORMITORY"]),
    description: z.string().max(1000).optional(),
    basePrice: z.number().positive(),
    maxGuests: z.number().int().min(1).max(20),
    amenities: z.array(z.string()).default([]),
});

export const toggleRoomInventorySchema = z.object({
    roomId: z.string().uuid(),
    date: z.coerce.date(),
    isBlocked: z.boolean(),
});

// Hotel search schema
export const searchHotelsSchema = z.object({
    city: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.number().int().min(1).max(10).default(2),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional(),
    amenities: z.array(z.string()).optional(),
    payAtHotel: z.boolean().optional(),
});

// Standard amenities list
export const STANDARD_AMENITIES = [
    "AC",
    "WiFi",
    "TV",
    "Hot Water",
    "Parking",
    "Room Service",
    "Laundry",
    "Restaurant",
    "24/7 Reception",
    "CCTV",
    "Power Backup",
    "Elevator",
] as const;

export type StandardAmenity = (typeof STANDARD_AMENITIES)[number];

// Type exports
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type ToggleRoomInventoryInput = z.infer<typeof toggleRoomInventorySchema>;
export type SearchHotelsInput = z.infer<typeof searchHotelsSchema>;
