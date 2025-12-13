/**
 * Competitive Pricing Intelligence Schema
 * 
 * Tables for tracking competitor hotels and their rates.
 */

import {
    pgTable,
    text,
    timestamp,
    integer,
    decimal,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels } from "./business";

// ==================
// Enums
// ==================

export const competitorSourceEnum = pgEnum("competitorSource", [
    "MANUAL",           // Manually entered by partner
    "OTA_SCRAPE",       // Scraped from OTA sites
    "API",              // From partner API
]);

export const pricePositionEnum = pgEnum("pricePosition", [
    "LOWEST",
    "BELOW_AVERAGE",
    "AVERAGE",
    "ABOVE_AVERAGE",
    "HIGHEST",
]);

// ==================
// Tables
// ==================

/**
 * Competitor Hotels - hotels tracked as competitors
 */
export const competitorHotels = pgTable("competitorHotels", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    source: competitorSourceEnum("source").default("MANUAL").notNull(),
    externalId: text("externalId"), // ID on external platform
    externalUrl: text("externalUrl"), // URL on booking site
    address: text("address"),
    distance: decimal("distance", { precision: 5, scale: 2 }), // Distance in km
    starRating: integer("starRating"), // 1-5 star
    avgRating: decimal("avgRating", { precision: 2, scale: 1 }), // Review rating
    reviewCount: integer("reviewCount"),
    isActive: text("isActive").default("true").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Competitor Rates - historical rate data for competitors
 */
export const competitorRates = pgTable("competitorRates", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    competitorId: text("competitorId")
        .notNull()
        .references(() => competitorHotels.id, { onDelete: "cascade" }),
    checkInDate: timestamp("checkInDate", { mode: "date" }).notNull(),
    roomType: text("roomType"), // e.g., "Standard", "Deluxe"
    rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("BDT").notNull(),
    source: text("source"), // Where the rate was fetched from
    fetchedAt: timestamp("fetchedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Price Recommendations - AI-generated pricing suggestions
 */
export const priceRecommendations = pgTable("priceRecommendations", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    date: timestamp("date", { mode: "date" }).notNull(),
    roomType: text("roomType"),
    currentPrice: decimal("currentPrice", { precision: 10, scale: 2 }).notNull(),
    recommendedPrice: decimal("recommendedPrice", { precision: 10, scale: 2 }).notNull(),
    minCompetitorPrice: decimal("minCompetitorPrice", { precision: 10, scale: 2 }),
    maxCompetitorPrice: decimal("maxCompetitorPrice", { precision: 10, scale: 2 }),
    avgCompetitorPrice: decimal("avgCompetitorPrice", { precision: 10, scale: 2 }),
    pricePosition: pricePositionEnum("pricePosition"),
    confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0-1 confidence score
    reasoning: text("reasoning"), // Why this price is recommended
    isApplied: text("isApplied").default("false").notNull(),
    appliedAt: timestamp("appliedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// ==================
// Relations
// ==================

export const competitorHotelsRelations = relations(competitorHotels, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [competitorHotels.hotelId],
        references: [hotels.id],
    }),
    rates: many(competitorRates),
}));

export const competitorRatesRelations = relations(competitorRates, ({ one }) => ({
    competitor: one(competitorHotels, {
        fields: [competitorRates.competitorId],
        references: [competitorHotels.id],
    }),
}));

export const priceRecommendationsRelations = relations(priceRecommendations, ({ one }) => ({
    hotel: one(hotels, {
        fields: [priceRecommendations.hotelId],
        references: [hotels.id],
    }),
}));

// ==================
// Types
// ==================

export type CompetitorHotel = typeof competitorHotels.$inferSelect;
export type NewCompetitorHotel = typeof competitorHotels.$inferInsert;
export type CompetitorRate = typeof competitorRates.$inferSelect;
export type NewCompetitorRate = typeof competitorRates.$inferInsert;
export type PriceRecommendation = typeof priceRecommendations.$inferSelect;
export type NewPriceRecommendation = typeof priceRecommendations.$inferInsert;
