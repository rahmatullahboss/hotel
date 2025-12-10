import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    decimal,
    jsonb,
    date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// Hotel Status Enum
export type HotelStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

// Room Type Enum
export type RoomType = "SINGLE" | "DOUBLE" | "SUITE" | "DORMITORY";

// Booking Status Enum
export type BookingStatus =
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED";

// Payment Status Enum
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "PAY_AT_HOTEL";

// ====================
// HOTELS
// ====================

export const hotels = pgTable("hotels", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("ownerId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    photos: jsonb("photos").$type<string[]>().default([]),
    status: text("status", { enum: ["PENDING", "ACTIVE", "SUSPENDED"] })
        .default("PENDING")
        .notNull(),
    commissionRate: decimal("commissionRate", { precision: 5, scale: 2 })
        .default("20.00")
        .notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const hotelsRelations = relations(hotels, ({ one, many }) => ({
    owner: one(users, {
        fields: [hotels.ownerId],
        references: [users.id],
    }),
    rooms: many(rooms),
}));

// ====================
// ROOMS
// ====================

export const rooms = pgTable("rooms", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: ["SINGLE", "DOUBLE", "SUITE", "DORMITORY"] })
        .default("DOUBLE")
        .notNull(),
    description: text("description"),
    basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
    maxGuests: integer("maxGuests").default(2).notNull(),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    photos: jsonb("photos").$type<string[]>().default([]),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [rooms.hotelId],
        references: [hotels.id],
    }),
    inventory: many(roomInventory),
    bookings: many(bookings),
}));

// ====================
// ROOM INVENTORY
// ====================

export const roomInventory = pgTable("roomInventory", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    roomId: text("roomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    date: date("date", { mode: "date" }).notNull(),
    availableCount: integer("availableCount").default(1).notNull(),
    isBlocked: boolean("isBlocked").default(false).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }), // Override price for specific date
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const roomInventoryRelations = relations(roomInventory, ({ one }) => ({
    room: one(rooms, {
        fields: [roomInventory.roomId],
        references: [rooms.id],
    }),
}));

// ====================
// BOOKINGS
// ====================

export const bookings = pgTable("bookings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    roomId: text("roomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    checkIn: date("checkIn", { mode: "date" }).notNull(),
    checkOut: date("checkOut", { mode: "date" }).notNull(),
    guestCount: integer("guestCount").default(1).notNull(),
    guestName: text("guestName").notNull(),
    guestPhone: text("guestPhone").notNull(),
    guestEmail: text("guestEmail"),
    status: text("status", {
        enum: ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"],
    })
        .default("PENDING")
        .notNull(),
    paymentStatus: text("paymentStatus", {
        enum: ["PENDING", "PAID", "REFUNDED", "PAY_AT_HOTEL"],
    })
        .default("PENDING")
        .notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: text("paymentMethod"),
    paymentReference: text("paymentReference"),
    notes: text("notes"),
    qrCode: text("qrCode"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
    user: one(users, {
        fields: [bookings.userId],
        references: [users.id],
    }),
    room: one(rooms, {
        fields: [bookings.roomId],
        references: [rooms.id],
    }),
}));

// Type exports
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type RoomInventory = typeof roomInventory.$inferSelect;
export type NewRoomInventory = typeof roomInventory.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
