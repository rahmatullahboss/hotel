import {
    pgTable,
    text,
    timestamp,
    primaryKey,
    integer,
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
    role: text("role", { enum: ["TRAVELER", "PARTNER", "ADMIN"] })
        .default("TRAVELER")
        .notNull(),
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

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
