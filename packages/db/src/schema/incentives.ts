/**
 * Incentive/Bonus Tracking Schema
 * 
 * Tables for managing incentive programs and tracking partner progress.
 */

import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    decimal,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels } from "./business";

// ==================
// Enums
// ==================

export const incentiveProgramStatusEnum = pgEnum("incentiveProgramStatus", [
    "ACTIVE",
    "UPCOMING",
    "EXPIRED",
    "PAUSED",
]);

export const incentiveTypeEnum = pgEnum("incentiveType", [
    "BOOKING_COUNT",        // Reach X bookings in a period
    "REVENUE_TARGET",       // Achieve X revenue in a period
    "OCCUPANCY_RATE",       // Maintain X% occupancy
    "RATING_IMPROVEMENT",   // Improve rating by X
    "FIRST_MILESTONE",      // First X bookings ever
    "STREAK",               // X consecutive days with bookings
    "SEASONAL_BONUS",       // Period-specific bonus
]);

export const claimStatusEnum = pgEnum("claimStatus", [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "PAID",
]);

// ==================
// Tables
// ==================

/**
 * Incentive Programs - defines available bonus programs
 */
export const incentivePrograms = pgTable("incentivePrograms", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    type: incentiveTypeEnum("type").notNull(),
    status: incentiveProgramStatusEnum("status").default("ACTIVE").notNull(),
    // Targets
    targetValue: integer("targetValue").notNull(), // e.g., 50 bookings, 100000 revenue
    targetUnit: text("targetUnit").notNull(), // e.g., "bookings", "BDT", "percent"
    // Rewards
    rewardAmount: decimal("rewardAmount", { precision: 10, scale: 2 }).notNull(),
    rewardType: text("rewardType").default("CASH").notNull(), // CASH, CREDIT, COMMISSION_DISCOUNT
    // Duration
    startDate: timestamp("startDate", { mode: "date" }).notNull(),
    endDate: timestamp("endDate", { mode: "date" }).notNull(),
    // Eligibility
    minHotelRating: decimal("minHotelRating", { precision: 2, scale: 1 }),
    requiredTier: text("requiredTier"), // e.g., "SILVER", "GOLD", "PLATINUM"
    isRecurring: boolean("isRecurring").default(false).notNull(),
    // Display
    badgeIcon: text("badgeIcon"), // Emoji or icon name
    badgeColor: text("badgeColor"), // Hex color
    // Metadata
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Hotel Incentives - tracks hotel participation and progress in programs
 */
export const hotelIncentives = pgTable("hotelIncentives", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    programId: text("programId")
        .notNull()
        .references(() => incentivePrograms.id, { onDelete: "cascade" }),
    // Progress
    currentProgress: integer("currentProgress").default(0).notNull(),
    progressPercentage: decimal("progressPercentage", { precision: 5, scale: 2 }).default("0").notNull(),
    isCompleted: boolean("isCompleted").default(false).notNull(),
    completedAt: timestamp("completedAt", { mode: "date" }),
    // Claim
    claimStatus: claimStatusEnum("claimStatus"),
    claimedAt: timestamp("claimedAt", { mode: "date" }),
    paidAt: timestamp("paidAt", { mode: "date" }),
    payoutAmount: decimal("payoutAmount", { precision: 10, scale: 2 }),
    // Tracking
    lastProgressUpdate: timestamp("lastProgressUpdate", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Incentive History - log of all incentive events
 */
export const incentiveHistory = pgTable("incentiveHistory", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelIncentiveId: text("hotelIncentiveId")
        .notNull()
        .references(() => hotelIncentives.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // ENROLLED, PROGRESS_UPDATE, COMPLETED, CLAIMED, PAID
    previousProgress: integer("previousProgress"),
    newProgress: integer("newProgress"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// ==================
// Relations
// ==================

export const incentiveProgramsRelations = relations(incentivePrograms, ({ many }) => ({
    hotelIncentives: many(hotelIncentives),
}));

export const hotelIncentivesRelations = relations(hotelIncentives, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [hotelIncentives.hotelId],
        references: [hotels.id],
    }),
    program: one(incentivePrograms, {
        fields: [hotelIncentives.programId],
        references: [incentivePrograms.id],
    }),
    history: many(incentiveHistory),
}));

export const incentiveHistoryRelations = relations(incentiveHistory, ({ one }) => ({
    hotelIncentive: one(hotelIncentives, {
        fields: [incentiveHistory.hotelIncentiveId],
        references: [hotelIncentives.id],
    }),
}));

// ==================
// Types
// ==================

export type IncentiveProgram = typeof incentivePrograms.$inferSelect;
export type NewIncentiveProgram = typeof incentivePrograms.$inferInsert;
export type HotelIncentive = typeof hotelIncentives.$inferSelect;
export type NewHotelIncentive = typeof hotelIncentives.$inferInsert;
export type IncentiveHistory = typeof incentiveHistory.$inferSelect;
