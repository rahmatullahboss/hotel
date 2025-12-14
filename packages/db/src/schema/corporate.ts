import {
    pgTable,
    text,
    timestamp,
    decimal,
    integer,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { hotels } from "./business";

// ====================
// CORPORATE BOOKING SYSTEM
// ====================

// Corporate account status enum
export const corporateStatusEnum = pgEnum("corporate_status", [
    "PENDING",      // Application submitted, awaiting approval
    "APPROVED",     // Active corporate account
    "SUSPENDED",    // Temporarily suspended
    "REJECTED",     // Application rejected
]);

// Corporate accounts - B2B company accounts
export const corporateAccounts = pgTable("corporateAccounts", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    companyName: text("companyName").notNull(),
    companyNameBn: text("companyNameBn"),
    registrationNumber: text("registrationNumber"), // Trade license / TIN
    industry: text("industry"), // e.g., "IT", "Manufacturing", "Healthcare"
    companySize: text("companySize"), // e.g., "1-50", "51-200", "200+"
    website: text("website"),
    // Contact person
    contactName: text("contactName").notNull(),
    contactEmail: text("contactEmail").notNull().unique(),
    contactPhone: text("contactPhone").notNull(),
    contactDesignation: text("contactDesignation"),
    // Address
    address: text("address"),
    city: text("city"),
    // Billing preferences
    billingEmail: text("billingEmail"),
    billingCycle: text("billingCycle", {
        enum: ["PREPAID", "MONTHLY", "QUARTERLY"],
    }).default("PREPAID"),
    creditLimit: decimal("creditLimit", { precision: 10, scale: 2 }).default("0"),
    currentBalance: decimal("currentBalance", { precision: 10, scale: 2 }).default("0"),
    // Discount
    discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).default("0"),
    // Status
    status: corporateStatusEnum("status").default("PENDING").notNull(),
    approvedBy: text("approvedBy").references(() => users.id, { onDelete: "set null" }),
    approvedAt: timestamp("approvedAt", { mode: "date" }),
    rejectionReason: text("rejectionReason"),
    // Timestamps
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Corporate users - employees linked to corporate account
export const corporateUsers = pgTable("corporateUsers", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    corporateAccountId: text("corporateAccountId")
        .notNull()
        .references(() => corporateAccounts.id, { onDelete: "cascade" }),
    role: text("role", {
        enum: ["ADMIN", "MANAGER", "EMPLOYEE"],
    }).default("EMPLOYEE").notNull(),
    department: text("department"),
    employeeId: text("employeeId"), // Internal employee ID
    canApproveBookings: boolean("canApproveBookings").default(false).notNull(),
    monthlyLimit: decimal("monthlyLimit", { precision: 10, scale: 2 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// Corporate bookings - bulk/corporate bookings with invoice tracking
export const corporateBookings = pgTable("corporateBookings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    corporateAccountId: text("corporateAccountId")
        .notNull()
        .references(() => corporateAccounts.id, { onDelete: "cascade" }),
    hotelId: text("hotelId")
        .notNull()
        .references(() => hotels.id, { onDelete: "cascade" }),
    bookedBy: text("bookedBy")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    approvedBy: text("approvedBy").references(() => users.id, { onDelete: "set null" }),
    // Booking details
    bookingReference: text("bookingReference").notNull().unique(), // e.g., "CORP-2024-001"
    checkIn: text("checkIn").notNull(),
    checkOut: text("checkOut").notNull(),
    roomCount: integer("roomCount").notNull(),
    guestsPerRoom: integer("guestsPerRoom").default(2).notNull(),
    specialRequests: text("specialRequests"),
    // Pricing
    baseAmount: decimal("baseAmount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    // Status
    status: text("status", {
        enum: ["PENDING_APPROVAL", "APPROVED", "CONFIRMED", "COMPLETED", "CANCELLED"],
    }).default("PENDING_APPROVAL").notNull(),
    paymentStatus: text("paymentStatus", {
        enum: ["PENDING", "INVOICED", "PAID"],
    }).default("PENDING").notNull(),
    invoiceNumber: text("invoiceNumber"),
    invoicedAt: timestamp("invoicedAt", { mode: "date" }),
    paidAt: timestamp("paidAt", { mode: "date" }),
    // Timestamps
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

// Corporate invoices - monthly/quarterly invoices
export const corporateInvoices = pgTable("corporateInvoices", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    corporateAccountId: text("corporateAccountId")
        .notNull()
        .references(() => corporateAccounts.id, { onDelete: "cascade" }),
    invoiceNumber: text("invoiceNumber").notNull().unique(), // e.g., "INV-2024-001"
    periodStart: text("periodStart").notNull(),
    periodEnd: text("periodEnd").notNull(),
    totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
    grandTotal: decimal("grandTotal", { precision: 10, scale: 2 }).notNull(),
    status: text("status", {
        enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"],
    }).default("DRAFT").notNull(),
    dueDate: text("dueDate").notNull(),
    paidAt: timestamp("paidAt", { mode: "date" }),
    paymentReference: text("paymentReference"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const corporateAccountsRelations = relations(corporateAccounts, ({ one, many }) => ({
    approver: one(users, {
        fields: [corporateAccounts.approvedBy],
        references: [users.id],
    }),
    users: many(corporateUsers),
    bookings: many(corporateBookings),
    invoices: many(corporateInvoices),
}));

export const corporateUsersRelations = relations(corporateUsers, ({ one }) => ({
    user: one(users, {
        fields: [corporateUsers.userId],
        references: [users.id],
    }),
    corporateAccount: one(corporateAccounts, {
        fields: [corporateUsers.corporateAccountId],
        references: [corporateAccounts.id],
    }),
}));

export const corporateBookingsRelations = relations(corporateBookings, ({ one }) => ({
    corporateAccount: one(corporateAccounts, {
        fields: [corporateBookings.corporateAccountId],
        references: [corporateAccounts.id],
    }),
    hotel: one(hotels, {
        fields: [corporateBookings.hotelId],
        references: [hotels.id],
    }),
    booker: one(users, {
        fields: [corporateBookings.bookedBy],
        references: [users.id],
        relationName: "booker",
    }),
    approver: one(users, {
        fields: [corporateBookings.approvedBy],
        references: [users.id],
        relationName: "approver",
    }),
}));

export const corporateInvoicesRelations = relations(corporateInvoices, ({ one }) => ({
    corporateAccount: one(corporateAccounts, {
        fields: [corporateInvoices.corporateAccountId],
        references: [corporateAccounts.id],
    }),
}));

// Type exports
export type CorporateAccount = typeof corporateAccounts.$inferSelect;
export type NewCorporateAccount = typeof corporateAccounts.$inferInsert;
export type CorporateUser = typeof corporateUsers.$inferSelect;
export type CorporateBooking = typeof corporateBookings.$inferSelect;
export type CorporateInvoice = typeof corporateInvoices.$inferSelect;
