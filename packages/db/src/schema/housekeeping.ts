/**
 * Housekeeping Management Schema
 * 
 * Tables for tracking room cleaning status, tasks, and maintenance.
 */

import {
    pgTable,
    text,
    timestamp,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels, rooms } from "./business";
import { users } from "./auth";

// ==================
// Enums
// ==================

export const roomCleaningStatusEnum = pgEnum("roomCleaningStatus", [
    "CLEAN",
    "DIRTY",
    "INSPECTED",
    "OUT_OF_ORDER",
]);

export const housekeepingTaskTypeEnum = pgEnum("housekeepingTaskType", [
    "CHECKOUT_CLEAN",      // Deep clean after checkout
    "STAY_OVER",           // Light clean for staying guests
    "INSPECTION",          // Quality inspection
    "MAINTENANCE",         // Maintenance request
    "TURNDOWN",            // Evening turndown service
    "DEEP_CLEAN",          // Periodic deep cleaning
]);

export const housekeepingTaskStatusEnum = pgEnum("housekeepingTaskStatus", [
    "PENDING",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "VERIFIED",
    "CANCELLED",
]);

export const housekeepingPriorityEnum = pgEnum("housekeepingPriority", [
    "LOW",
    "NORMAL",
    "HIGH",
    "URGENT",
]);

// ==================
// Tables
// ==================

/**
 * Tracks the current cleaning status of each room
 */
export const roomCleaningStatuses = pgTable("roomCleaningStatuses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    roomId: text("roomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" })
        .unique(),
    status: roomCleaningStatusEnum("status").default("CLEAN").notNull(),
    lastCleanedAt: timestamp("lastCleanedAt", { mode: "date" }),
    lastCleanedBy: text("lastCleanedBy").references(() => users.id),
    lastInspectedAt: timestamp("lastInspectedAt", { mode: "date" }),
    lastInspectedBy: text("lastInspectedBy").references(() => users.id),
    notes: text("notes"),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Housekeeping tasks - individual cleaning/maintenance assignments
 */
export const housekeepingTasks = pgTable("housekeepingTasks", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    roomId: text("roomId")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    type: housekeepingTaskTypeEnum("type").notNull(),
    status: housekeepingTaskStatusEnum("status").default("PENDING").notNull(),
    priority: housekeepingPriorityEnum("priority").default("NORMAL").notNull(),
    // Assignment
    assignedTo: text("assignedTo").references(() => users.id),
    assignedAt: timestamp("assignedAt", { mode: "date" }),
    // Timing
    scheduledFor: timestamp("scheduledFor", { mode: "date" }),
    startedAt: timestamp("startedAt", { mode: "date" }),
    completedAt: timestamp("completedAt", { mode: "date" }),
    // Verification
    verifiedBy: text("verifiedBy").references(() => users.id),
    verifiedAt: timestamp("verifiedAt", { mode: "date" }),
    // Details
    notes: text("notes"),
    guestRequest: boolean("guestRequest").default(false).notNull(),
    checklistCompleted: boolean("checklistCompleted").default(false).notNull(),
    // Metadata
    createdBy: text("createdBy").references(() => users.id),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Housekeeping activity log - tracks all status changes and actions
 */
export const housekeepingLogs = pgTable("housekeepingLogs", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    taskId: text("taskId")
        .notNull()
        .references(() => housekeepingTasks.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // e.g., "CREATED", "ASSIGNED", "STARTED", "COMPLETED", "VERIFIED"
    performedBy: text("performedBy")
        .notNull()
        .references(() => users.id),
    previousStatus: text("previousStatus"),
    newStatus: text("newStatus"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Housekeeping checklist items - defines what needs to be done for each task type
 */
export const housekeepingChecklists = pgTable("housekeepingChecklists", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    taskType: housekeepingTaskTypeEnum("taskType").notNull(),
    itemOrder: integer("itemOrder").notNull(),
    itemText: text("itemText").notNull(),
    isRequired: boolean("isRequired").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// ==================
// Relations
// ==================

export const roomCleaningStatusesRelations = relations(roomCleaningStatuses, ({ one }) => ({
    room: one(rooms, {
        fields: [roomCleaningStatuses.roomId],
        references: [rooms.id],
    }),
    lastCleanedByUser: one(users, {
        fields: [roomCleaningStatuses.lastCleanedBy],
        references: [users.id],
    }),
    lastInspectedByUser: one(users, {
        fields: [roomCleaningStatuses.lastInspectedBy],
        references: [users.id],
    }),
}));

export const housekeepingTasksRelations = relations(housekeepingTasks, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [housekeepingTasks.hotelId],
        references: [hotels.id],
    }),
    room: one(rooms, {
        fields: [housekeepingTasks.roomId],
        references: [rooms.id],
    }),
    assignedToUser: one(users, {
        fields: [housekeepingTasks.assignedTo],
        references: [users.id],
    }),
    verifiedByUser: one(users, {
        fields: [housekeepingTasks.verifiedBy],
        references: [users.id],
    }),
    createdByUser: one(users, {
        fields: [housekeepingTasks.createdBy],
        references: [users.id],
    }),
    logs: many(housekeepingLogs),
}));

export const housekeepingLogsRelations = relations(housekeepingLogs, ({ one }) => ({
    task: one(housekeepingTasks, {
        fields: [housekeepingLogs.taskId],
        references: [housekeepingTasks.id],
    }),
    performedByUser: one(users, {
        fields: [housekeepingLogs.performedBy],
        references: [users.id],
    }),
}));

export const housekeepingChecklistsRelations = relations(housekeepingChecklists, ({ one }) => ({
    hotel: one(hotels, {
        fields: [housekeepingChecklists.hotelId],
        references: [hotels.id],
    }),
}));

// ==================
// Types
// ==================

export type RoomCleaningStatus = typeof roomCleaningStatuses.$inferSelect;
export type NewRoomCleaningStatus = typeof roomCleaningStatuses.$inferInsert;
export type HousekeepingTask = typeof housekeepingTasks.$inferSelect;
export type NewHousekeepingTask = typeof housekeepingTasks.$inferInsert;
export type HousekeepingLog = typeof housekeepingLogs.$inferSelect;
export type HousekeepingChecklist = typeof housekeepingChecklists.$inferSelect;

