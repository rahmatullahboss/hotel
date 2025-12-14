import {
    pgTable,
    text,
    timestamp,
    decimal,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { bookings } from "./business";

// ====================
// REFERRAL PROGRAM
// ====================

// Referral status enum
export const referralStatusEnum = pgEnum("referral_status", [
    "PENDING",      // Referred user signed up but hasn't booked
    "COMPLETED",    // Referred user completed a booking, rewards given
    "EXPIRED",      // Referral expired (e.g., 30 days without booking)
]);

// Referral codes - each user gets a unique code to share
export const referralCodes = pgTable("referralCodes", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(), // e.g., "VIBE-JOHN2024"
    usageCount: integer("usageCount").default(0).notNull(), // Times this code was used
    maxUses: integer("maxUses"), // Null = unlimited
    referrerReward: decimal("referrerReward", { precision: 10, scale: 2 })
        .default("100")
        .notNull(), // Reward for referrer (in BDT)
    referredReward: decimal("referredReward", { precision: 10, scale: 2 })
        .default("50")
        .notNull(), // Reward for referred user
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }), // Optional expiry
});

// Referrals - tracks each referral relationship
export const referrals = pgTable("referrals", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    referrerCodeId: text("referrerCodeId")
        .notNull()
        .references(() => referralCodes.id, { onDelete: "cascade" }),
    referredUserId: text("referredUserId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    bookingId: text("bookingId").references(() => bookings.id), // Booking that triggered completion
    status: referralStatusEnum("status").default("PENDING").notNull(),
    referrerReward: decimal("referrerReward", { precision: 10, scale: 2 }), // Actual reward given
    referredReward: decimal("referredReward", { precision: 10, scale: 2 }), // Actual reward given
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completedAt", { mode: "date" }), // When rewards were distributed
});

// Relations
export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
    user: one(users, {
        fields: [referralCodes.userId],
        references: [users.id],
    }),
    referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
    referrerCode: one(referralCodes, {
        fields: [referrals.referrerCodeId],
        references: [referralCodes.id],
    }),
    referredUser: one(users, {
        fields: [referrals.referredUserId],
        references: [users.id],
    }),
    booking: one(bookings, {
        fields: [referrals.bookingId],
        references: [bookings.id],
    }),
}));

// Type exports
export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type NewReferral = typeof referrals.$inferInsert;
