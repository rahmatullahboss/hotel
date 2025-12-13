import {
    pgTable,
    text,
    timestamp,
    boolean,
    jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels, rooms, bookings } from "./business";

// ====================
// CHANNEL TYPES
// ====================

export type ChannelType =
    | "BOOKING_COM"
    | "EXPEDIA"
    | "AGODA"
    | "SHARETRIP"
    | "GOZAYAAN";

export type SyncStatus = "IDLE" | "SYNCING" | "ERROR";
export type SyncOperation = "PUSH_INVENTORY" | "PULL_BOOKINGS" | "PUSH_RATES";
export type SyncResultStatus = "SUCCESS" | "FAILED" | "PARTIAL";

// ====================
// CHANNEL CONNECTIONS
// Per-hotel OTA connection settings
// ====================

export const channelConnections = pgTable("channelConnections", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    channelType: text("channelType", {
        enum: ["BOOKING_COM", "EXPEDIA", "AGODA", "SHARETRIP", "GOZAYAAN"],
    }).notNull(),
    externalPropertyId: text("externalPropertyId"), // OTA's hotel ID
    // Encrypted API credentials (keys, tokens, secrets)
    apiCredentials: jsonb("apiCredentials").$type<{
        apiKey?: string;
        apiSecret?: string;
        propertyId?: string;
        accessToken?: string;
        refreshToken?: string;
        [key: string]: string | undefined;
    }>(),
    isActive: boolean("isActive").default(false).notNull(),
    lastSyncAt: timestamp("lastSyncAt", { mode: "date" }),
    syncStatus: text("syncStatus", {
        enum: ["IDLE", "SYNCING", "ERROR"],
    }).default("IDLE"),
    syncError: text("syncError"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const channelConnectionsRelations = relations(
    channelConnections,
    ({ one, many }) => ({
        hotel: one(hotels, {
            fields: [channelConnections.hotelId],
            references: [hotels.id],
        }),
        roomMappings: many(channelRoomMappings),
        syncLogs: many(syncLogs),
    })
);

// ====================
// CHANNEL ROOM MAPPINGS
// Map local rooms to OTA room types
// ====================

export const channelRoomMappings = pgTable("channelRoomMappings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    channelConnectionId: text("channelConnectionId")
        .notNull()
        .references(() => channelConnections.id, { onDelete: "cascade" }),
    localRoomId: text("localRoomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    externalRoomTypeId: text("externalRoomTypeId").notNull(), // OTA's room type ID
    externalRatePlanId: text("externalRatePlanId"), // OTA's rate plan ID (if applicable)
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const channelRoomMappingsRelations = relations(
    channelRoomMappings,
    ({ one }) => ({
        channelConnection: one(channelConnections, {
            fields: [channelRoomMappings.channelConnectionId],
            references: [channelConnections.id],
        }),
        room: one(rooms, {
            fields: [channelRoomMappings.localRoomId],
            references: [rooms.id],
        }),
    })
);

// ====================
// SYNC LOGS
// Audit trail for all sync operations
// ====================

export const syncLogs = pgTable("syncLogs", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    channelConnectionId: text("channelConnectionId")
        .notNull()
        .references(() => channelConnections.id, { onDelete: "cascade" }),
    operation: text("operation", {
        enum: ["PUSH_INVENTORY", "PULL_BOOKINGS", "PUSH_RATES"],
    }).notNull(),
    status: text("status", {
        enum: ["SUCCESS", "FAILED", "PARTIAL"],
    }).notNull(),
    requestPayload: jsonb("requestPayload").$type<Record<string, unknown>>(),
    responsePayload: jsonb("responsePayload").$type<Record<string, unknown>>(),
    errorMessage: text("errorMessage"),
    affectedRooms: jsonb("affectedRooms").$type<string[]>(), // Room IDs affected
    bookingsCreated: jsonb("bookingsCreated").$type<string[]>(), // Booking IDs created
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
    channelConnection: one(channelConnections, {
        fields: [syncLogs.channelConnectionId],
        references: [channelConnections.id],
    }),
}));

// ====================
// TYPE EXPORTS
// ====================

export type ChannelConnection = typeof channelConnections.$inferSelect;
export type NewChannelConnection = typeof channelConnections.$inferInsert;
export type ChannelRoomMapping = typeof channelRoomMappings.$inferSelect;
export type NewChannelRoomMapping = typeof channelRoomMappings.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
