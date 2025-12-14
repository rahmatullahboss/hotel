import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    date,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// ====================
// GAMIFICATION SYSTEM
// ====================

// Badge category enum
export const badgeCategoryEnum = pgEnum("badge_category", [
    "BOOKING",      // Booking milestones
    "LOYALTY",      // Loyalty tier achievements
    "SPENDING",     // Total spending milestones
    "STREAK",       // Login/booking streaks
    "EXPLORER",     // Cities visited
    "REVIEWER",     // Reviews written
    "REFERRAL",     // Referral milestones
    "SPECIAL",      // Special/seasonal badges
]);

// Badge definitions - platform-wide badge templates
export const badges = pgTable("badges", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),  // e.g., "FIRST_BOOKING", "STREAK_7"
    name: text("name").notNull(),           // e.g., "First Adventure"
    nameBn: text("nameBn"),                 // Bengali name
    description: text("description").notNull(),
    descriptionBn: text("descriptionBn"),
    category: badgeCategoryEnum("category").notNull(),
    icon: text("icon").notNull(),           // Emoji or icon name
    requirement: integer("requirement").default(1).notNull(), // e.g., 7 for 7-day streak
    points: integer("points").default(10).notNull(), // Points awarded when earned
    isSecret: boolean("isSecret").default(false).notNull(), // Hidden until earned
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// User badges - earned badges per user
export const userBadges = pgTable("userBadges", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    badgeId: text("badgeId")
        .notNull()
        .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earnedAt", { mode: "date" }).defaultNow().notNull(),
    notified: boolean("notified").default(false).notNull(), // Has user been notified?
});

// Login streaks - daily login tracking
export const loginStreaks = pgTable("loginStreaks", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    currentStreak: integer("currentStreak").default(0).notNull(),
    longestStreak: integer("longestStreak").default(0).notNull(),
    lastLoginDate: date("lastLoginDate", { mode: "string" }),
    totalLoginDays: integer("totalLoginDays").default(0).notNull(),
    // Reward tracking
    lastRewardStreak: integer("lastRewardStreak").default(0).notNull(), // Last streak level rewarded
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Booking streaks - weekly/monthly booking tracking  
export const bookingStreaks = pgTable("bookingStreaks", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    totalBookings: integer("totalBookings").default(0).notNull(),
    monthlyBookings: integer("monthlyBookings").default(0).notNull(),
    lastBookingMonth: text("lastBookingMonth"), // "2024-12" format
    consecutiveMonths: integer("consecutiveMonths").default(0).notNull(),
    citiesVisited: integer("citiesVisited").default(0).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const badgesRelations = relations(badges, ({ many }) => ({
    userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
    user: one(users, {
        fields: [userBadges.userId],
        references: [users.id],
    }),
    badge: one(badges, {
        fields: [userBadges.badgeId],
        references: [badges.id],
    }),
}));

export const loginStreaksRelations = relations(loginStreaks, ({ one }) => ({
    user: one(users, {
        fields: [loginStreaks.userId],
        references: [users.id],
    }),
}));

export const bookingStreaksRelations = relations(bookingStreaks, ({ one }) => ({
    user: one(users, {
        fields: [bookingStreaks.userId],
        references: [users.id],
    }),
}));

// Type exports
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserBadge = typeof userBadges.$inferSelect;
export type LoginStreak = typeof loginStreaks.$inferSelect;
export type BookingStreak = typeof bookingStreaks.$inferSelect;
