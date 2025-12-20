import {
    pgTable,
    text,
    timestamp,
    primaryKey,
    integer,
    boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// Auth.js v5 Schema
// Reference: https://authjs.dev/getting-started/adapters/drizzle

export const users = pgTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    phone: text("phone"),
    // Password hash for email/password login (null for OAuth-only users)
    passwordHash: text("passwordHash"),
    role: text("role", { enum: ["TRAVELER", "HOTEL_OWNER", "PARTNER", "ADMIN"] })
        .default("TRAVELER")
        .notNull(),
    // Trust score for cancellation policy (0-100, default 100)
    trustScore: integer("trustScore").default(100).notNull(),
    // Count of late cancellations (no-show after check-in time)
    lateCancellationCount: integer("lateCancellationCount").default(0).notNull(),
    // Whether user can use "Pay at Hotel" option (disabled after 3 late cancellations)
    payAtHotelAllowed: boolean("payAtHotelAllowed").default(true).notNull(),
    // Soft delete fields - account is marked for deletion but not immediately removed
    // User can recover account by logging in before deleteScheduledFor date
    deletedAt: timestamp("deletedAt", { mode: "date" }),
    // Date when account will be permanently deleted (30 days after deletedAt)
    deleteScheduledFor: timestamp("deleteScheduledFor", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
    "accounts",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
);

export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationTokens",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
);

// Push Notification Subscriptions
// Stores Web Push API subscription data and Expo push tokens for each user's device
export const pushSubscriptions = pgTable("pushSubscriptions", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    // Platform discriminator: 'web', 'ios', 'android'
    platform: text("platform", { enum: ["web", "ios", "android"] }).notNull().default("web"),
    // Expo push token (for mobile apps)
    expoPushToken: text("expoPushToken"),
    // Web Push API fields (for web apps) - nullable for mobile tokens
    endpoint: text("endpoint"),
    p256dh: text("p256dh"), // Public key for encryption
    auth: text("auth"), // Authentication secret
    deviceName: text("deviceName"), // Optional device identifier (browser/OS)
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// Notification Preferences
// Controls which types of notifications each user wants to receive
export const notificationPreferences = pgTable("notificationPreferences", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" })
        .unique(),
    // Partner notifications
    newBooking: boolean("newBooking").default(true).notNull(),
    cancellation: boolean("cancellation").default(true).notNull(),
    checkInReminder: boolean("checkInReminder").default(true).notNull(),
    paymentReceived: boolean("paymentReceived").default(true).notNull(),
    lowInventory: boolean("lowInventory").default(true).notNull(),
    // Guest notifications
    bookingConfirmation: boolean("bookingConfirmation").default(true).notNull(),
    checkInInstructions: boolean("checkInInstructions").default(true).notNull(),
    promotions: boolean("promotions").default(true).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
