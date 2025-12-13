"use server";

import { db } from "@repo/db";
import { hotelStaff, users, type PartnerRole } from "@repo/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";
import { getPartnerRole, requirePermission } from "./getPartnerRole";

export interface StaffMember {
    id: string;
    userId: string;
    email: string;
    name: string | null;
    role: PartnerRole;
    status: "PENDING" | "ACTIVE" | "REVOKED";
    invitedAt: Date;
    acceptedAt: Date | null;
}

/**
 * Get all staff members for the current user's hotel
 */
export async function getStaffMembers(): Promise<StaffMember[]> {
    try {
        const roleInfo = await requirePermission("canManageStaff");

        const staff = await db
            .select({
                id: hotelStaff.id,
                userId: hotelStaff.userId,
                email: users.email,
                name: users.name,
                role: hotelStaff.role,
                status: hotelStaff.status,
                invitedAt: hotelStaff.invitedAt,
                acceptedAt: hotelStaff.acceptedAt,
            })
            .from(hotelStaff)
            .innerJoin(users, eq(users.id, hotelStaff.userId))
            .where(eq(hotelStaff.hotelId, roleInfo.hotelId))
            .orderBy(desc(hotelStaff.invitedAt));

        return staff.map((s) => ({
            ...s,
            email: s.email || "unknown@email.com",
            role: s.role as PartnerRole,
            status: s.status as "PENDING" | "ACTIVE" | "REVOKED",
        }));
    } catch (error) {
        console.error("Error getting staff members:", error);
        return [];
    }
}

/**
 * Invite a new staff member by email
 */
export async function inviteStaffMember(
    email: string,
    role: "MANAGER" | "RECEPTIONIST"
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await requirePermission("canManageStaff");

        // Check if user with this email exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
        });

        if (!existingUser) {
            return {
                success: false,
                error: "User not found. They must create an account first.",
            };
        }

        // Check if user is already staff
        const existingStaff = await db.query.hotelStaff.findFirst({
            where: and(
                eq(hotelStaff.hotelId, roleInfo.hotelId),
                eq(hotelStaff.userId, existingUser.id)
            ),
        });

        if (existingStaff) {
            if (existingStaff.status === "ACTIVE") {
                return {
                    success: false,
                    error: "This user is already a staff member.",
                };
            }
            // Reactivate revoked staff
            if (existingStaff.status === "REVOKED") {
                await db
                    .update(hotelStaff)
                    .set({
                        role,
                        status: "ACTIVE",
                        acceptedAt: new Date(),
                    })
                    .where(eq(hotelStaff.id, existingStaff.id));

                revalidatePath("/settings/staff");
                return { success: true };
            }
        }

        // Get current user for invitedBy
        const session = await auth();

        // Create staff entry
        await db.insert(hotelStaff).values({
            hotelId: roleInfo.hotelId,
            userId: existingUser.id,
            role,
            status: "ACTIVE", // Auto-accept for now (no email verification)
            invitedBy: session?.user?.id,
            acceptedAt: new Date(),
        });

        revalidatePath("/settings/staff");
        return { success: true };
    } catch (error) {
        console.error("Error inviting staff member:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to invite staff member",
        };
    }
}

/**
 * Update a staff member's role
 */
export async function updateStaffRole(
    staffId: string,
    newRole: "MANAGER" | "RECEPTIONIST"
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await requirePermission("canManageStaff");

        // Verify staff belongs to this hotel
        const staff = await db.query.hotelStaff.findFirst({
            where: and(
                eq(hotelStaff.id, staffId),
                eq(hotelStaff.hotelId, roleInfo.hotelId)
            ),
        });

        if (!staff) {
            return { success: false, error: "Staff member not found" };
        }

        if (staff.role === "OWNER") {
            return { success: false, error: "Cannot change owner role" };
        }

        await db
            .update(hotelStaff)
            .set({ role: newRole })
            .where(eq(hotelStaff.id, staffId));

        revalidatePath("/settings/staff");
        return { success: true };
    } catch (error) {
        console.error("Error updating staff role:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update role",
        };
    }
}

/**
 * Revoke a staff member's access
 */
export async function revokeStaffAccess(
    staffId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await requirePermission("canManageStaff");

        // Verify staff belongs to this hotel
        const staff = await db.query.hotelStaff.findFirst({
            where: and(
                eq(hotelStaff.id, staffId),
                eq(hotelStaff.hotelId, roleInfo.hotelId)
            ),
        });

        if (!staff) {
            return { success: false, error: "Staff member not found" };
        }

        if (staff.role === "OWNER") {
            return { success: false, error: "Cannot revoke owner access" };
        }

        await db
            .update(hotelStaff)
            .set({ status: "REVOKED" })
            .where(eq(hotelStaff.id, staffId));

        revalidatePath("/settings/staff");
        return { success: true };
    } catch (error) {
        console.error("Error revoking staff access:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to revoke access",
        };
    }
}

/**
 * Remove a staff member completely
 */
export async function removeStaffMember(
    staffId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await requirePermission("canManageStaff");

        // Verify staff belongs to this hotel
        const staff = await db.query.hotelStaff.findFirst({
            where: and(
                eq(hotelStaff.id, staffId),
                eq(hotelStaff.hotelId, roleInfo.hotelId)
            ),
        });

        if (!staff) {
            return { success: false, error: "Staff member not found" };
        }

        if (staff.role === "OWNER") {
            return { success: false, error: "Cannot remove owner" };
        }

        await db.delete(hotelStaff).where(eq(hotelStaff.id, staffId));

        revalidatePath("/settings/staff");
        return { success: true };
    } catch (error) {
        console.error("Error removing staff member:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to remove staff member",
        };
    }
}
