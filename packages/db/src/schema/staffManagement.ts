import {
    pgTable,
    text,
    timestamp,
    date,
    time,
    jsonb,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { hotels } from "./business";
import { hotelStaff } from "./hotelStaff";

// ====================
// STAFF SHIFTS
// ====================

// Shift Status Enum
export type ShiftStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export const staffShifts = pgTable(
    "staffShifts",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        hotelId: text("hotelId")
            .notNull()
            .references(() => hotels.id, { onDelete: "cascade" }),
        staffId: text("staffId")
            .notNull()
            .references(() => hotelStaff.id, { onDelete: "cascade" }),
        shiftDate: date("shiftDate", { mode: "string" }).notNull(),
        startTime: time("startTime").notNull(), // e.g., "08:00"
        endTime: time("endTime").notNull(),     // e.g., "16:00"
        status: text("status", { enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] })
            .default("SCHEDULED")
            .notNull(),
        notes: text("notes"),
        createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
        updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        // Each staff can only have one shift per date (simplification)
        uniqueIndex("staff_shift_date_unique").on(table.staffId, table.shiftDate),
    ]
);

export const staffShiftsRelations = relations(staffShifts, ({ one }) => ({
    hotel: one(hotels, {
        fields: [staffShifts.hotelId],
        references: [hotels.id],
    }),
    staff: one(hotelStaff, {
        fields: [staffShifts.staffId],
        references: [hotelStaff.id],
    }),
}));

// ====================
// STAFF ATTENDANCE (Clock In/Out)
// ====================

export const staffAttendance = pgTable("staffAttendance", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    staffId: text("staffId")
        .notNull()
        .references(() => hotelStaff.id, { onDelete: "cascade" }),
    shiftId: text("shiftId")
        .references(() => staffShifts.id, { onDelete: "set null" }), // Optional link to scheduled shift
    clockInTime: timestamp("clockInTime", { mode: "date" }).notNull(),
    clockOutTime: timestamp("clockOutTime", { mode: "date" }),
    clockInNote: text("clockInNote"),
    clockOutNote: text("clockOutNote"),
    // Calculated on clock-out
    totalHoursWorked: text("totalHoursWorked"), // Stored as decimal string
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const staffAttendanceRelations = relations(staffAttendance, ({ one }) => ({
    hotel: one(hotels, {
        fields: [staffAttendance.hotelId],
        references: [hotels.id],
    }),
    staff: one(hotelStaff, {
        fields: [staffAttendance.staffId],
        references: [hotelStaff.id],
    }),
    shift: one(staffShifts, {
        fields: [staffAttendance.shiftId],
        references: [staffShifts.id],
    }),
}));

// ====================
// SHIFT HANDOVER REPORTS
// ====================

// Task status for handover
export interface HandoverTask {
    id: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    roomNumber?: string; // Optional room reference
    bookingId?: string;  // Optional booking reference
}

export const shiftHandoverReports = pgTable("shiftHandoverReports", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    fromStaffId: text("fromStaffId")
        .notNull()
        .references(() => hotelStaff.id, { onDelete: "cascade" }),
    toStaffId: text("toStaffId")
        .references(() => hotelStaff.id, { onDelete: "set null" }), // May be null if next staff not yet assigned
    // Task tracking
    pendingTasks: jsonb("pendingTasks").$type<HandoverTask[]>().default([]),
    completedTasks: jsonb("completedTasks").$type<HandoverTask[]>().default([]),
    // General notes for the next shift
    notes: text("notes"),
    // Key metrics from the shift
    checkInsHandled: text("checkInsHandled").default("0"),
    checkOutsHandled: text("checkOutsHandled").default("0"),
    walkInsRecorded: text("walkInsRecorded").default("0"),
    issuesReported: text("issuesReported").default("0"),
    // Timestamp
    handoverTime: timestamp("handoverTime", { mode: "date" }).defaultNow().notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const shiftHandoverReportsRelations = relations(shiftHandoverReports, ({ one }) => ({
    hotel: one(hotels, {
        fields: [shiftHandoverReports.hotelId],
        references: [hotels.id],
    }),
    fromStaff: one(hotelStaff, {
        fields: [shiftHandoverReports.fromStaffId],
        references: [hotelStaff.id],
    }),
    toStaff: one(hotelStaff, {
        fields: [shiftHandoverReports.toStaffId],
        references: [hotelStaff.id],
    }),
}));

// Type exports
export type StaffShift = typeof staffShifts.$inferSelect;
export type NewStaffShift = typeof staffShifts.$inferInsert;
export type StaffAttendance = typeof staffAttendance.$inferSelect;
export type NewStaffAttendance = typeof staffAttendance.$inferInsert;
export type ShiftHandoverReport = typeof shiftHandoverReports.$inferSelect;
export type NewShiftHandoverReport = typeof shiftHandoverReports.$inferInsert;
