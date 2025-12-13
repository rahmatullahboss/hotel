import {
    pgTable,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { hotels } from "./business";

// Partner Role Enum - defines access levels for hotel staff
export type PartnerRole = "OWNER" | "MANAGER" | "RECEPTIONIST";

// Staff Status Enum - tracks invite lifecycle
export type StaffStatus = "PENDING" | "ACTIVE" | "REVOKED";

// ====================
// HOTEL STAFF
// ====================

export const hotelStaff = pgTable(
    "hotelStaff",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        hotelId: text("hotelId")
            .notNull()
            .references(() => hotels.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        role: text("role", { enum: ["OWNER", "MANAGER", "RECEPTIONIST"] })
            .notNull(),
        // Invitation tracking
        invitedBy: text("invitedBy")
            .references(() => users.id, { onDelete: "set null" }),
        invitedAt: timestamp("invitedAt", { mode: "date" }).defaultNow().notNull(),
        acceptedAt: timestamp("acceptedAt", { mode: "date" }),
        // Status for invite lifecycle
        status: text("status", { enum: ["PENDING", "ACTIVE", "REVOKED"] })
            .default("PENDING")
            .notNull(),
        createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
        updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        // Each user can only have one role per hotel
        uniqueIndex("hotel_user_unique").on(table.hotelId, table.userId),
    ]
);

export const hotelStaffRelations = relations(hotelStaff, ({ one }) => ({
    hotel: one(hotels, {
        fields: [hotelStaff.hotelId],
        references: [hotels.id],
    }),
    user: one(users, {
        fields: [hotelStaff.userId],
        references: [users.id],
    }),
    inviter: one(users, {
        fields: [hotelStaff.invitedBy],
        references: [users.id],
    }),
}));

// Type exports
export type HotelStaff = typeof hotelStaff.$inferSelect;
export type NewHotelStaff = typeof hotelStaff.$inferInsert;
