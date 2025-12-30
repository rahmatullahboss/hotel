// Guest communication and messaging schema
import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels, bookings } from "./business";

// Enums
export const messageTypeEnum = pgEnum("message_type", [
    "PRE_ARRIVAL",
    "WELCOME",
    "POST_STAY",
    "CUSTOM",
]);

export const messageStatusEnum = pgEnum("message_status", [
    "PENDING",
    "SENT",
    "FAILED",
]);

// Message Templates
export const messageTemplates = pgTable("message_templates", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: messageTypeEnum("type").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    isActive: boolean("is_active").default(true),
    sendTiming: integer("send_timing").default(0), // Hours before/after event
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Automation Settings (per hotel)
export const messagingAutomationSettings = pgTable("messaging_automation_settings", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().unique().references(() => hotels.id, { onDelete: "cascade" }),
    preArrivalEnabled: boolean("pre_arrival_enabled").default(true),
    preArrivalHours: integer("pre_arrival_hours").default(24),
    welcomeMessageEnabled: boolean("welcome_message_enabled").default(true),
    postStayEnabled: boolean("post_stay_enabled").default(true),
    postStayHours: integer("post_stay_hours").default(2),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Guest Messages (sent/pending messages)
export const guestMessages = pgTable("guest_messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    bookingId: text("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    guestName: text("guest_name").notNull(),
    guestEmail: text("guest_email"),
    guestPhone: text("guest_phone"),
    type: messageTypeEnum("type").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: messageStatusEnum("status").notNull().default("PENDING"),
    sentAt: timestamp("sent_at"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const messageTemplatesRelations = relations(messageTemplates, ({ one }) => ({
    hotel: one(hotels, {
        fields: [messageTemplates.hotelId],
        references: [hotels.id],
    }),
}));

export const messagingAutomationSettingsRelations = relations(messagingAutomationSettings, ({ one }) => ({
    hotel: one(hotels, {
        fields: [messagingAutomationSettings.hotelId],
        references: [hotels.id],
    }),
}));

export const guestMessagesRelations = relations(guestMessages, ({ one }) => ({
    hotel: one(hotels, {
        fields: [guestMessages.hotelId],
        references: [hotels.id],
    }),
    booking: one(bookings, {
        fields: [guestMessages.bookingId],
        references: [bookings.id],
    }),
}));
