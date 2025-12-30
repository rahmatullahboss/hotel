// Maintenance and work order management schema
import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { hotels } from "./business";
import { users } from "./auth";

// Enums for maintenance
export const maintenanceTypeEnum = pgEnum("maintenance_type", [
    "PLUMBING",
    "ELECTRICAL",
    "HVAC",
    "FURNITURE",
    "CLEANING",
    "APPLIANCE",
    "OTHER",
]);

export const maintenancePriorityEnum = pgEnum("maintenance_priority", [
    "LOW",
    "MEDIUM",
    "HIGH",
    "URGENT",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
    "OPEN",
    "IN_PROGRESS",
    "PENDING_PARTS",
    "COMPLETED",
    "CANCELLED",
]);

export const preventiveFrequencyEnum = pgEnum("preventive_frequency", [
    "DAILY",
    "WEEKLY",
    "MONTHLY",
    "QUARTERLY",
    "YEARLY",
]);

export const preventiveScopeEnum = pgEnum("preventive_scope", [
    "ALL_ROOMS",
    "SPECIFIC_ROOMS",
    "COMMON_AREAS",
]);

// Vendors Table (defined first as it's referenced by maintenanceRequests)
export const vendors = pgTable("vendors", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    categories: jsonb("categories").$type<string[]>().notNull(),
    contactName: text("contact_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    rating: integer("rating").default(0), // 0-5 stars * 10 for decimals (e.g., 45 = 4.5 stars)
    totalJobs: integer("total_jobs").default(0),
    isPreferred: boolean("is_preferred").default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Maintenance Requests Table
export const maintenanceRequests = pgTable("maintenance_requests", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    roomNumber: text("room_number"),
    location: text("location").notNull(),
    type: maintenanceTypeEnum("type").notNull(),
    priority: maintenancePriorityEnum("priority").notNull().default("MEDIUM"),
    status: maintenanceStatusEnum("status").notNull().default("OPEN"),
    description: text("description").notNull(),
    reportedBy: text("reported_by").notNull(),
    reportedByUserId: text("reported_by_user_id").references(() => users.id),
    assignedTo: text("assigned_to"),
    assignedVendorId: text("assigned_vendor_id").references(() => vendors.id),
    estimatedCost: integer("estimated_cost"),
    actualCost: integer("actual_cost"),
    photos: jsonb("photos").$type<string[]>(),
    notes: text("notes"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Preventive Maintenance Schedules
export const preventiveMaintenanceSchedules = pgTable("preventive_maintenance_schedules", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotel_id").notNull().references(() => hotels.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    frequency: preventiveFrequencyEnum("frequency").notNull(),
    scope: preventiveScopeEnum("scope").notNull(),
    description: text("description"),
    checklist: jsonb("checklist").$type<string[]>().notNull(),
    specificRooms: jsonb("specific_rooms").$type<string[]>(), // Room numbers if scope is SPECIFIC_ROOMS
    isActive: boolean("is_active").default(true),
    lastCompletedAt: timestamp("last_completed_at"),
    nextDueAt: timestamp("next_due_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Preventive Maintenance Logs (history of completed tasks)
export const preventiveMaintenanceLogs = pgTable("preventive_maintenance_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    scheduleId: text("schedule_id").notNull().references(() => preventiveMaintenanceSchedules.id, { onDelete: "cascade" }),
    completedBy: text("completed_by").notNull(),
    completedByUserId: text("completed_by_user_id").references(() => users.id),
    checklistResults: jsonb("checklist_results").$type<boolean[]>(),
    notes: text("notes"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Relations
export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
    hotel: one(hotels, {
        fields: [maintenanceRequests.hotelId],
        references: [hotels.id],
    }),
    reportedByUser: one(users, {
        fields: [maintenanceRequests.reportedByUserId],
        references: [users.id],
    }),
    assignedVendor: one(vendors, {
        fields: [maintenanceRequests.assignedVendorId],
        references: [vendors.id],
    }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [vendors.hotelId],
        references: [hotels.id],
    }),
    maintenanceRequests: many(maintenanceRequests),
}));

export const preventiveMaintenanceSchedulesRelations = relations(preventiveMaintenanceSchedules, ({ one, many }) => ({
    hotel: one(hotels, {
        fields: [preventiveMaintenanceSchedules.hotelId],
        references: [hotels.id],
    }),
    logs: many(preventiveMaintenanceLogs),
}));

export const preventiveMaintenanceLogsRelations = relations(preventiveMaintenanceLogs, ({ one }) => ({
    schedule: one(preventiveMaintenanceSchedules, {
        fields: [preventiveMaintenanceLogs.scheduleId],
        references: [preventiveMaintenanceSchedules.id],
    }),
    completedByUser: one(users, {
        fields: [preventiveMaintenanceLogs.completedByUserId],
        references: [users.id],
    }),
}));
