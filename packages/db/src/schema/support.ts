import {
    pgTable,
    text,
    timestamp,
    boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { hotels } from "./business";

// Support Ticket Status
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

// Support Ticket Priority
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// Support Ticket Category
export type TicketCategory =
    | "BOOKING_ISSUE"
    | "PAYMENT_ISSUE"
    | "TECHNICAL_ISSUE"
    | "ACCOUNT_ISSUE"
    | "PAYOUT_ISSUE"
    | "OTHER";

// ====================
// SUPPORT TICKETS
// ====================

export const supportTickets = pgTable("supportTickets", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    hotelId: text("hotelId")
        .references(() => hotels.id, { onDelete: "set null" }),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    category: text("category", {
        enum: ["BOOKING_ISSUE", "PAYMENT_ISSUE", "TECHNICAL_ISSUE", "ACCOUNT_ISSUE", "PAYOUT_ISSUE", "OTHER"],
    }).default("OTHER").notNull(),
    priority: text("priority", {
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    }).default("MEDIUM").notNull(),
    status: text("status", {
        enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    }).default("OPEN").notNull(),
    assignedTo: text("assignedTo")
        .references(() => users.id, { onDelete: "set null" }),
    resolution: text("resolution"),
    resolvedAt: timestamp("resolvedAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
    user: one(users, {
        fields: [supportTickets.userId],
        references: [users.id],
    }),
    hotel: one(hotels, {
        fields: [supportTickets.hotelId],
        references: [hotels.id],
    }),
    assignee: one(users, {
        fields: [supportTickets.assignedTo],
        references: [users.id],
    }),
    replies: many(ticketReplies),
}));

// ====================
// TICKET REPLIES
// ====================

export const ticketReplies = pgTable("ticketReplies", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    ticketId: text("ticketId")
        .notNull()
        .references(() => supportTickets.id, { onDelete: "cascade" }),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    isStaffReply: boolean("isStaffReply").default(false).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const ticketRepliesRelations = relations(ticketReplies, ({ one }) => ({
    ticket: one(supportTickets, {
        fields: [ticketReplies.ticketId],
        references: [supportTickets.id],
    }),
    user: one(users, {
        fields: [ticketReplies.userId],
        references: [users.id],
    }),
}));

// Type exports
export type SupportTicket = typeof supportTickets.$inferSelect;
export type NewSupportTicket = typeof supportTickets.$inferInsert;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type NewTicketReply = typeof ticketReplies.$inferInsert;
