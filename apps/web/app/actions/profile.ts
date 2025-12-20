"use server";

import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface UpdateProfileInput {
    userId: string;
    name?: string;
    phone?: string;
}

/**
 * Update user profile information
 */
export async function updateProfile(input: UpdateProfileInput): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const { userId, name, phone } = input;

        if (!userId) {
            return { success: false, error: "User ID is required" };
        }

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!existingUser) {
            return { success: false, error: "User not found" };
        }

        // Prepare update data
        const updateData: Partial<typeof users.$inferInsert> = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (phone !== undefined) {
            updateData.phone = phone;
        }

        // Update user
        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId));

        revalidatePath("/profile");
        revalidatePath("/profile/edit");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

/**
 * Get user profile data
 */
export async function getUserProfile(userId: string) {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
            role: user.role,
        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

/**
 * Soft delete user account
 * Account will be marked for deletion and permanently deleted after 30 days
 * User can recover account by logging in before the scheduled deletion date
 */
export async function deleteAccount(userId: string): Promise<{
    success: boolean;
    error?: string;
    deleteScheduledFor?: Date;
}> {
    try {
        if (!userId) {
            return { success: false, error: "User ID is required" };
        }

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!existingUser) {
            return { success: false, error: "User not found" };
        }

        // Set deletion date to 30 days from now
        const deletedAt = new Date();
        const deleteScheduledFor = new Date();
        deleteScheduledFor.setDate(deleteScheduledFor.getDate() + 30);

        // Soft delete - mark account for deletion
        await db
            .update(users)
            .set({
                deletedAt,
                deleteScheduledFor,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        return { success: true, deleteScheduledFor };
    } catch (error) {
        console.error("Error deleting account:", error);
        return { success: false, error: "Failed to delete account" };
    }
}

/**
 * Recover a soft-deleted account
 * This should be called when a user with a pending deletion logs in
 */
export async function recoverAccount(userId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        if (!userId) {
            return { success: false, error: "User ID is required" };
        }

        // Clear the deletion fields
        await db
            .update(users)
            .set({
                deletedAt: null,
                deleteScheduledFor: null,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

        revalidatePath("/profile");

        return { success: true };
    } catch (error) {
        console.error("Error recovering account:", error);
        return { success: false, error: "Failed to recover account" };
    }
}

/**
 * Check if a user's account is scheduled for deletion
 */
export async function checkAccountDeletionStatus(userId: string): Promise<{
    isScheduledForDeletion: boolean;
    deletedAt?: Date | null;
    deleteScheduledFor?: Date | null;
}> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                deletedAt: true,
                deleteScheduledFor: true,
            },
        });

        if (!user) {
            return { isScheduledForDeletion: false };
        }

        return {
            isScheduledForDeletion: !!user.deletedAt,
            deletedAt: user.deletedAt,
            deleteScheduledFor: user.deleteScheduledFor,
        };
    } catch (error) {
        console.error("Error checking account deletion status:", error);
        return { isScheduledForDeletion: false };
    }
}

