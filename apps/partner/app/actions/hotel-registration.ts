"use server";

import { db } from "@repo/db";
import { hotels, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface HotelRegistrationInput {
    name: string;
    description: string;
    address: string;
    city: string;
    amenities: string[];
    phone?: string;
}

/**
 * Submit hotel registration - creates hotel with PENDING status
 */
export async function submitHotelRegistration(
    input: HotelRegistrationInput
): Promise<{ success: boolean; hotelId?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const userId = session.user.id;

        // Check if user already has a hotel
        const existingHotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, userId),
        });

        if (existingHotel) {
            return { success: false, error: "You already have a hotel registered" };
        }

        // Create hotel with PENDING status
        const [newHotel] = await db
            .insert(hotels)
            .values({
                ownerId: userId,
                name: input.name,
                description: input.description,
                address: input.address,
                city: input.city,
                amenities: input.amenities,
                status: "PENDING",
            })
            .returning({ id: hotels.id });

        if (!newHotel) {
            return { success: false, error: "Failed to create hotel" };
        }

        // Update user role to HOTEL_OWNER if not already
        await db
            .update(users)
            .set({ role: "HOTEL_OWNER" })
            .where(eq(users.id, userId));

        revalidatePath("/");
        return { success: true, hotelId: newHotel.id };
    } catch (error) {
        console.error("Error submitting hotel registration:", error);
        return { success: false, error: "Failed to submit registration" };
    }
}

/**
 * Get the current user's hotel registration status
 */
export async function getHotelRegistrationStatus(): Promise<{
    hasHotel: boolean;
    hotel?: {
        id: string;
        name: string;
        status: string;
    };
    userRole?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { hasHotel: false };
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
            columns: {
                id: true,
                name: true,
                status: true,
            },
        });

        return {
            hasHotel: !!hotel,
            hotel: hotel || undefined,
            userRole: (session.user as { role?: string }).role,
        };
    } catch (error) {
        console.error("Error getting registration status:", error);
        return { hasHotel: false };
    }
}
