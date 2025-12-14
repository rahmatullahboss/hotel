/**
 * System Settings Schema
 * 
 * Key-value store for system-wide settings and feature toggles.
 */

import {
    pgTable,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

/**
 * System Settings - key-value store for feature toggles and configurations
 */
export const systemSettings = pgTable("systemSettings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    description: text("description"),
    updatedBy: text("updatedBy"),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// ==================
// Types
// ==================

export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

// ==================
// Setting Keys
// ==================

export const SETTING_KEYS = {
    HOTEL_INCENTIVES_ENABLED: "hotelIncentivesEnabled",
    MIN_RATING_FOR_INCENTIVES: "minRatingForIncentives",
    SUSPENSION_RATING_THRESHOLD: "suspensionRatingThreshold",
} as const;
