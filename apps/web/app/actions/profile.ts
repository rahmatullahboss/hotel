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
