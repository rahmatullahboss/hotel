"use server";

import { db } from "@repo/db";
import { hotels } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface HotelProfile {
    id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    phone?: string;
    email?: string;
    amenities: string[];
    photos: string[];
    coverImage: string | null;
    commissionRate: string;
    status: string;
    payAtHotelEnabled: boolean;
}

/**
 * Get the current partner's hotel profile
 */
export async function getHotelProfile(): Promise<HotelProfile | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (!hotel) return null;

        return {
            id: hotel.id,
            name: hotel.name,
            description: hotel.description,
            address: hotel.address,
            city: hotel.city,
            amenities: (hotel.amenities as string[]) || [],
            photos: (hotel.photos as string[]) || [],
            coverImage: hotel.coverImage,
            commissionRate: hotel.commissionRate,
            status: hotel.status,
            payAtHotelEnabled: hotel.payAtHotelEnabled,
        };
    } catch (error) {
        console.error("Error fetching hotel profile:", error);
        return null;
    }
}

export interface UpdateProfileInput {
    name: string;
    description?: string;
    address: string;
    city: string;
    amenities: string[];
    payAtHotelEnabled: boolean;
}

/**
 * Update hotel profile
 */
export async function updateHotelProfile(
    input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        await db
            .update(hotels)
            .set({
                name: input.name,
                description: input.description || null,
                address: input.address,
                city: input.city,
                amenities: input.amenities,
                payAtHotelEnabled: input.payAtHotelEnabled,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotel.id));

        revalidatePath("/settings");
        revalidatePath("/settings/profile");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

/**
 * Update hotel cover image
 */
export async function updateCoverImage(
    imageUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        await db
            .update(hotels)
            .set({
                coverImage: imageUrl,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotel.id));

        revalidatePath("/settings/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating cover image:", error);
        return { success: false, error: "Failed to update cover image" };
    }
}

/**
 * Add photo to hotel gallery
 */
export async function addHotelPhoto(
    photoUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        const currentPhotos = (hotel.photos as string[]) || [];
        const updatedPhotos = [...currentPhotos, photoUrl];

        await db
            .update(hotels)
            .set({
                photos: updatedPhotos,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotel.id));

        revalidatePath("/settings/profile");
        return { success: true };
    } catch (error) {
        console.error("Error adding photo:", error);
        return { success: false, error: "Failed to add photo" };
    }
}

/**
 * Remove photo from hotel gallery
 */
export async function removeHotelPhoto(
    photoUrl: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const hotel = await db.query.hotels.findFirst({
            where: eq(hotels.ownerId, session.user.id),
        });

        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        const currentPhotos = (hotel.photos as string[]) || [];
        const updatedPhotos = currentPhotos.filter((p: string) => p !== photoUrl);

        await db
            .update(hotels)
            .set({
                photos: updatedPhotos,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, hotel.id));

        revalidatePath("/settings/profile");
        return { success: true };
    } catch (error) {
        console.error("Error removing photo:", error);
        return { success: false, error: "Failed to remove photo" };
    }
}
