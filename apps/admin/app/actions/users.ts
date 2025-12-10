"use server";

import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get all users for admin
 */
export async function getAdminUsers() {
    try {
        // Since we don't have createdAt in users schema (based on adapter), we might order by email or id
        // Or if we added createdAt, use that. Let's assume basic fetch for now.
        const allUsers = await db.query.users.findMany();
        return allUsers;
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return [];
    }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
    try {
        await db
            .update(users)
            .set({ role: role as any })
            .where(eq(users.id, userId));

        revalidatePath("/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update role" };
    }
}
