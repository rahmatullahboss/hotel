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

// Room Inventory Status Enum
export type InventoryStatus = "AVAILABLE" | "OCCUPIED" | "BLOCKED";

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
    coverImage: text("coverImage"),
    rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
    reviewCount: integer("reviewCount").default(0).notNull(),
    payAtHotelEnabled: boolean("payAtHotelEnabled").default(true).notNull(),
    status: text("status", { enum: ["PENDING", "ACTIVE", "SUSPENDED"] })
        .default("PENDING")
        .notNull(),
    commissionRate: decimal("commissionRate", { precision: 5, scale: 2 })
        .default("12.00")
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
    bookings: many(bookings),
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
    roomNumber: text("roomNumber").notNull(),
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
    date: date("date", { mode: "string" }).notNull(),
    status: text("status", { enum: ["AVAILABLE", "OCCUPIED", "BLOCKED"] })
        .default("AVAILABLE")
        .notNull(),
    price: decimal("price", { precision: 10, scale: 2 }), // Override price for specific date
    notes: text("notes"),
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

// Booking Source Enum - tracks where booking originated
export type BookingSource = "PLATFORM" | "WALK_IN";

// Commission Status Enum - tracks commission collection
export type CommissionStatus = "PENDING" | "PAID" | "WAIVED" | "NOT_APPLICABLE";

export const bookings = pgTable("bookings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    userId: text("userId")
        .references(() => users.id, { onDelete: "set null" }),
    roomId: text("roomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    checkIn: date("checkIn", { mode: "string" }).notNull(),
    checkOut: date("checkOut", { mode: "string" }).notNull(),
    numberOfNights: integer("numberOfNights").default(1).notNull(),
    guestCount: integer("guestCount").default(1).notNull(),
    guestName: text("guestName").notNull(),
    guestPhone: text("guestPhone").notNull(),
    guestEmail: text("guestEmail"),

    // Booking source - platform bookings have commission, walk-ins don't
    bookingSource: text("bookingSource", {
        enum: ["PLATFORM", "WALK_IN"],
    })
        .default("PLATFORM")
        .notNull(),

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

    // Commission tracking
    commissionStatus: text("commissionStatus", {
        enum: ["PENDING", "PAID", "WAIVED", "NOT_APPLICABLE"],
    })
        .default("PENDING")
        .notNull(),

    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).notNull(),
    netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(),

    // Booking Fee (Advance Payment) - Platform's guaranteed commission
    bookingFee: decimal("bookingFee", { precision: 10, scale: 2 }).default("0"),
    bookingFeeStatus: text("bookingFeeStatus", {
        enum: ["PENDING", "PAID", "WAIVED"],
    }).default("PENDING"),

    paymentMethod: text("paymentMethod"),
    paymentReference: text("paymentReference"),
    notes: text("notes"),
    qrCode: text("qrCode"),

    // Guest ID photo for security/verification (stored as URL)
    guestIdPhoto: text("guestIdPhoto"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
    hotel: one(hotels, {
        fields: [bookings.hotelId],
        references: [hotels.id],
    }),
    user: one(users, {
        fields: [bookings.userId],
        references: [users.id],
    }),
    room: one(rooms, {
        fields: [bookings.roomId],
        references: [rooms.id],
    }),
}));

// ====================
// PROMOTIONS
// ====================

// Promotion Type Enum
export type PromotionType = "PERCENTAGE" | "FIXED";

export const promotions = pgTable("promotions", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type", { enum: ["PERCENTAGE", "FIXED"] })
        .notNull()
        .default("PERCENTAGE"),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(), // % or fixed amount
    hotelId: text("hotelId").references(() => hotels.id, { onDelete: "cascade" }), // null = platform-wide
    minBookingAmount: decimal("minBookingAmount", { precision: 10, scale: 2 }),
    maxDiscountAmount: decimal("maxDiscountAmount", { precision: 10, scale: 2 }),
    maxUses: integer("maxUses"), // null = unlimited
    currentUses: integer("currentUses").default(0).notNull(),
    validFrom: date("validFrom", { mode: "string" }),
    validTo: date("validTo", { mode: "string" }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const promotionsRelations = relations(promotions, ({ one }) => ({
    hotel: one(hotels, {
        fields: [promotions.hotelId],
        references: [hotels.id],
    }),
}));

// ====================
// ACTIVITY LOG
// ====================

// Activity Type Enum
export type ActivityType =
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "CHECK_IN"
    | "CHECK_OUT"
    | "PAYMENT_RECEIVED"
    | "HOTEL_REGISTERED"
    | "HOTEL_APPROVED"
    | "HOTEL_SUSPENDED"
    | "PRICE_UPDATED"
    | "ROOM_BLOCKED"
    | "ROOM_UNBLOCKED";

export const activityLog = pgTable("activityLog", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    type: text("type", {
        enum: [
            "BOOKING_CREATED",
            "BOOKING_CONFIRMED",
            "BOOKING_CANCELLED",
            "CHECK_IN",
            "CHECK_OUT",
            "PAYMENT_RECEIVED",
            "HOTEL_REGISTERED",
            "HOTEL_APPROVED",
            "HOTEL_SUSPENDED",
            "PRICE_UPDATED",
            "ROOM_BLOCKED",
            "ROOM_UNBLOCKED",
        ],
    }).notNull(),
    actorId: text("actorId").references(() => users.id, { onDelete: "set null" }), // Who performed the action
    hotelId: text("hotelId").references(() => hotels.id, { onDelete: "cascade" }),
    bookingId: text("bookingId").references(() => bookings.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
    actor: one(users, {
        fields: [activityLog.actorId],
        references: [users.id],
    }),
    hotel: one(hotels, {
        fields: [activityLog.hotelId],
        references: [hotels.id],
    }),
    booking: one(bookings, {
        fields: [activityLog.bookingId],
        references: [bookings.id],
    }),
}));

// ====================
// WALLETS (Customer wallet for easy payments)
// ====================

export const wallets = pgTable("wallets", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    balance: decimal("balance", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const walletsRelations = relations(wallets, ({ one, many }) => ({
    user: one(users, {
        fields: [wallets.userId],
        references: [users.id],
    }),
    transactions: many(walletTransactions),
}));

// ====================
// WALLET TRANSACTIONS
// ====================

export type WalletTransactionType = "CREDIT" | "DEBIT";
export type WalletTransactionReason =
    | "TOP_UP"           // User added money
    | "BOOKING_FEE"      // Deducted for booking
    | "REFUND"           // Refunded amount
    | "REWARD"           // Loyalty reward
    | "CASHBACK";        // Promotional cashback

export const walletTransactions = pgTable("walletTransactions", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    walletId: text("walletId")
        .notNull()
        .references(() => wallets.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["CREDIT", "DEBIT"] }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason", {
        enum: ["TOP_UP", "BOOKING_FEE", "REFUND", "REWARD", "CASHBACK"],
    }).notNull(),
    bookingId: text("bookingId").references(() => bookings.id, { onDelete: "set null" }),
    description: text("description"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
    wallet: one(wallets, {
        fields: [walletTransactions.walletId],
        references: [wallets.id],
    }),
    booking: one(bookings, {
        fields: [walletTransactions.bookingId],
        references: [bookings.id],
    }),
}));

// ====================
// LOYALTY POINTS
// ====================

export type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export const loyaltyPoints = pgTable("loyaltyPoints", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    points: integer("points").default(0).notNull(),
    lifetimePoints: integer("lifetimePoints").default(0).notNull(), // Total earned ever
    tier: text("tier", { enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"] })
        .default("BRONZE")
        .notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const loyaltyPointsRelations = relations(loyaltyPoints, ({ one }) => ({
    user: one(users, {
        fields: [loyaltyPoints.userId],
        references: [users.id],
    }),
}));

// ====================
// HOTEL METRICS (For tracking suspicious activity)
// ====================

export const hotelMetrics = pgTable("hotelMetrics", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .unique()
        .references(() => hotels.id, { onDelete: "cascade" }),
    totalBookings: integer("totalBookings").default(0).notNull(),
    totalCancellations: integer("totalCancellations").default(0).notNull(),
    totalWalkIns: integer("totalWalkIns").default(0).notNull(),
    cancellationRate: decimal("cancellationRate", { precision: 5, scale: 2 }).default("0"),
    redFlags: integer("redFlags").default(0).notNull(),
    lastRedFlagDate: timestamp("lastRedFlagDate", { mode: "date" }),
    searchRankPenalty: integer("searchRankPenalty").default(0).notNull(), // Lower rank by this amount
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const hotelMetricsRelations = relations(hotelMetrics, ({ one }) => ({
    hotel: one(hotels, {
        fields: [hotelMetrics.hotelId],
        references: [hotels.id],
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
export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type NewLoyaltyPoints = typeof loyaltyPoints.$inferInsert;
export type HotelMetrics = typeof hotelMetrics.$inferSelect;
export type NewHotelMetrics = typeof hotelMetrics.$inferInsert;
