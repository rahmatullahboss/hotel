// Revenue management and yield rules schema
import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels } from "./business";

// Enums
export const yieldRuleTypeEnum = pgEnum("yield_rule_type", [
    "OCCUPANCY_THRESHOLD",
    "ADVANCE_BOOKING",
    "DAY_OF_WEEK",
    "SEASONAL",
]);

// Yield Management Rules
export const yieldRules = pgTable("yield_rules", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: yieldRuleTypeEnum("type").notNull(),
    condition: jsonb("condition").$type<{
        threshold?: number;
        daysInAdvance?: number;
        daysOfWeek?: number[];
        dateRange?: { start: string; end: string };
    }>().notNull(),
    action: jsonb("action").$type<{
        priceAdjustment: number; // percentage: -50 to +100
        minStay?: number;
    }>().notNull(),
    isActive: boolean("is_active").default(true),
    priority: integer("priority").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Demand Forecast Cache (pre-computed forecasts)
export const demandForecasts = pgTable("demand_forecasts", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD format
    predictedOccupancy: integer("predicted_occupancy").notNull(), // 0-100
    predictedDemand: text("predicted_demand").notNull(), // LOW, MEDIUM, HIGH, VERY_HIGH
    suggestedPriceMultiplier: real("suggested_price_multiplier").notNull(), // 0.5 - 2.0
    events: jsonb("events").$type<string[]>(), // holidays, events
    confidence: integer("confidence").notNull(), // 0-100
    computedAt: timestamp("computed_at").defaultNow().notNull(),
});

// Price History (for analytics)
export const priceHistory = pgTable("price_history", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    roomTypeId: text("room_type_id"),
    date: text("date").notNull(), // YYYY-MM-DD
    basePrice: integer("base_price").notNull(),
    adjustedPrice: integer("adjusted_price").notNull(),
    appliedRules: jsonb("applied_rules").$type<string[]>(), // Rule IDs that were applied
    source: text("source").default("MANUAL"), // MANUAL, AI_RECOMMENDATION, YIELD_RULE
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Scheduled Reports
export const scheduledReports = pgTable("scheduled_reports", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    reportType: text("report_type").notNull(), // REVENUE, OCCUPANCY, BOOKING, PERFORMANCE
    frequency: text("frequency").notNull(), // DAILY, WEEKLY, MONTHLY
    format: text("format").default("PDF"), // PDF, EXCEL, CSV
    recipients: jsonb("recipients").$type<string[]>().notNull(),
    isActive: boolean("is_active").default(true),
    lastSentAt: timestamp("last_sent_at"),
    nextScheduledAt: timestamp("next_scheduled_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const yieldRulesRelations = relations(yieldRules, ({ one }) => ({
    hotel: one(hotels, {
        fields: [yieldRules.hotelId],
        references: [hotels.id],
    }),
}));

export const demandForecastsRelations = relations(demandForecasts, ({ one }) => ({
    hotel: one(hotels, {
        fields: [demandForecasts.hotelId],
        references: [hotels.id],
    }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
    hotel: one(hotels, {
        fields: [priceHistory.hotelId],
        references: [hotels.id],
    }),
}));

export const scheduledReportsRelations = relations(scheduledReports, ({ one }) => ({
    hotel: one(hotels, {
        fields: [scheduledReports.hotelId],
        references: [hotels.id],
    }),
}));
