"use server";

import { db } from "@repo/db";
import {
    corporateAccounts,
    corporateUsers,
    corporateBookings,
    corporateInvoices,
} from "@repo/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

// ====================
// CORPORATE ACTIONS
// ====================

/**
 * Submit a corporate account application
 */
export async function submitCorporateApplication(data: {
    companyName: string;
    registrationNumber?: string;
    industry?: string;
    companySize?: string;
    website?: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactDesignation?: string;
    address?: string;
    city?: string;
    billingEmail?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Check if already has corporate account
        const existing = await db.query.corporateAccounts.findFirst({
            where: eq(corporateAccounts.contactEmail, data.contactEmail),
        });

        if (existing) {
            return { success: false, error: "A corporate account with this email already exists" };
        }

        // Create the application
        const [account] = await db
            .insert(corporateAccounts)
            .values({
                ...data,
                status: "PENDING",
            })
            .returning();

        // Link the submitting user as admin
        if (account) {
            await db.insert(corporateUsers).values({
                userId: session.user.id,
                corporateAccountId: account.id,
                role: "ADMIN",
                canApproveBookings: true,
            });
        }

        revalidatePath("/corporate");

        return {
            success: true,
            accountId: account?.id,
            message: "Application submitted successfully. We'll review it within 24-48 hours.",
        };
    } catch (error) {
        console.error("Error submitting corporate application:", error);
        return { success: false, error: "Failed to submit application" };
    }
}

/**
 * Get current user's corporate account
 */
export async function getCorporateAccount() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    try {
        // Find user's corporate link
        const corpUser = await db.query.corporateUsers.findFirst({
            where: eq(corporateUsers.userId, session.user.id),
            with: {
                corporateAccount: true,
            },
        });

        if (!corpUser) {
            return null;
        }

        return {
            account: corpUser.corporateAccount,
            role: corpUser.role,
            canApproveBookings: corpUser.canApproveBookings,
        };
    } catch (error) {
        console.error("Error getting corporate account:", error);
        return null;
    }
}

/**
 * Get corporate booking history
 */
export async function getCorporateBookings() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const corpUser = await db.query.corporateUsers.findFirst({
            where: eq(corporateUsers.userId, session.user.id),
        });

        if (!corpUser) {
            return [];
        }

        const bookings = await db.query.corporateBookings.findMany({
            where: eq(corporateBookings.corporateAccountId, corpUser.corporateAccountId),
            with: {
                hotel: {
                    columns: { id: true, name: true, city: true },
                },
            },
            orderBy: [desc(corporateBookings.createdAt)],
        });

        return bookings;
    } catch (error) {
        console.error("Error getting corporate bookings:", error);
        return [];
    }
}

/**
 * Create a corporate booking
 */
export async function createCorporateBooking(data: {
    hotelId: string;
    checkIn: string;
    checkOut: string;
    roomCount: number;
    guestsPerRoom?: number;
    specialRequests?: string;
    totalAmount: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const corpUser = await db.query.corporateUsers.findFirst({
            where: and(
                eq(corporateUsers.userId, session.user.id),
                eq(corporateUsers.isActive, true)
            ),
            with: {
                corporateAccount: true,
            },
        });

        if (!corpUser || corpUser.corporateAccount.status !== "APPROVED") {
            return { success: false, error: "Corporate account not found or not approved" };
        }

        const account = corpUser.corporateAccount;
        const discountAmount = data.totalAmount * (Number(account.discountPercentage) / 100);
        const finalAmount = data.totalAmount - discountAmount;

        // Generate booking reference
        const timestamp = Date.now().toString(36).toUpperCase();
        const bookingReference = `CORP-${timestamp}`;

        // Determine if needs approval
        const needsApproval = !corpUser.canApproveBookings;

        const [booking] = await db
            .insert(corporateBookings)
            .values({
                corporateAccountId: account.id,
                hotelId: data.hotelId,
                bookedBy: session.user.id,
                bookingReference,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                roomCount: data.roomCount,
                guestsPerRoom: data.guestsPerRoom || 2,
                specialRequests: data.specialRequests,
                baseAmount: data.totalAmount.toString(),
                discountAmount: discountAmount.toString(),
                totalAmount: finalAmount.toString(),
                status: needsApproval ? "PENDING_APPROVAL" : "APPROVED",
            })
            .returning();

        revalidatePath("/corporate/bookings");

        return {
            success: true,
            bookingId: booking?.id,
            bookingReference,
            needsApproval,
            message: needsApproval
                ? "Booking submitted for manager approval"
                : "Booking confirmed",
        };
    } catch (error) {
        console.error("Error creating corporate booking:", error);
        return { success: false, error: "Failed to create booking" };
    }
}

/**
 * Get corporate invoices
 */
export async function getCorporateInvoices() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const corpUser = await db.query.corporateUsers.findFirst({
            where: eq(corporateUsers.userId, session.user.id),
        });

        if (!corpUser) {
            return [];
        }

        const invoices = await db.query.corporateInvoices.findMany({
            where: eq(corporateInvoices.corporateAccountId, corpUser.corporateAccountId),
            orderBy: [desc(corporateInvoices.createdAt)],
        });

        return invoices;
    } catch (error) {
        console.error("Error getting corporate invoices:", error);
        return [];
    }
}

/**
 * Add employee to corporate account
 */
export async function addCorporateEmployee(data: {
    email: string;
    role: "ADMIN" | "MANAGER" | "EMPLOYEE";
    department?: string;
    employeeId?: string;
    canApproveBookings?: boolean;
    monthlyLimit?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Check if caller is admin
        const callerCorpUser = await db.query.corporateUsers.findFirst({
            where: and(
                eq(corporateUsers.userId, session.user.id),
                eq(corporateUsers.role, "ADMIN")
            ),
        });

        if (!callerCorpUser) {
            return { success: false, error: "Only corporate admins can add employees" };
        }

        // Find the user by email (they must already have an account)
        const targetUser = await db.query.users.findFirst({
            where: eq(sql`email`, data.email),
        });

        if (!targetUser) {
            return { success: false, error: "User not found. They must create an account first." };
        }

        // Check if already a member
        const existingMember = await db.query.corporateUsers.findFirst({
            where: and(
                eq(corporateUsers.userId, targetUser.id),
                eq(corporateUsers.corporateAccountId, callerCorpUser.corporateAccountId)
            ),
        });

        if (existingMember) {
            return { success: false, error: "User is already a member of this corporate account" };
        }

        // Add the employee
        await db.insert(corporateUsers).values({
            userId: targetUser.id,
            corporateAccountId: callerCorpUser.corporateAccountId,
            role: data.role,
            department: data.department,
            employeeId: data.employeeId,
            canApproveBookings: data.canApproveBookings || data.role === "ADMIN" || data.role === "MANAGER",
            monthlyLimit: data.monthlyLimit?.toString(),
        });

        revalidatePath("/corporate/team");

        return {
            success: true,
            message: `${data.email} has been added to your corporate account`,
        };
    } catch (error) {
        console.error("Error adding corporate employee:", error);
        return { success: false, error: "Failed to add employee" };
    }
}
