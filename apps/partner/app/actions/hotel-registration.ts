"use server";

import { db } from "@repo/db";
import { hotels, users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";
import { generateVibeCode } from "@repo/db/utils/vibeBranding";

export interface HotelRegistrationInput {
    name: string;
    description: string;
    address: string;
    city: string;
    amenities: string[];
    phone?: string;
    latitude?: number;
    longitude?: number;
}

/**
 * Submit hotel registration - creates hotel with PENDING status
 * Auto-generates a unique Vibe code (e.g., VB10001)
 */
export async function submitHotelRegistration(
    input: HotelRegistrationInput
): Promise<{ success: boolean; hotelId?: string; vibeCode?: string; error?: string }> {
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

        // Get all existing vibe codes to generate a unique one
        const existingCodes = await db
            .select({ vibeCode: hotels.vibeCode })
            .from(hotels);
        const codes = existingCodes
            .map(h => h.vibeCode)
            .filter((code): code is string => code !== null);

        const vibeCode = generateVibeCode(codes);

        // Create hotel with PENDING status and auto-generated vibeCode
        const [newHotel] = await db
            .insert(hotels)
            .values({
                ownerId: userId,
                name: input.name,
                vibeCode: vibeCode,
                category: "CLASSIC", // Default category, can be updated later
                description: input.description,
                address: input.address,
                city: input.city,
                amenities: input.amenities,
                latitude: input.latitude?.toString(),
                longitude: input.longitude?.toString(),
                status: "PENDING",
            })
            .returning({ id: hotels.id, vibeCode: hotels.vibeCode });

        if (!newHotel) {
            return { success: false, error: "Failed to create hotel" };
        }

        // Update user role to HOTEL_OWNER if not already
        await db
            .update(users)
            .set({ role: "HOTEL_OWNER" })
            .where(eq(users.id, userId));

        revalidatePath("/");
        return {
            success: true,
            hotelId: newHotel.id,
            vibeCode: newHotel.vibeCode || vibeCode
        };
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
