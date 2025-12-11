"use server";

import { put, del } from "@vercel/blob";
import { optimizeImage, getOptimizedFilename } from "../lib/image-optimizer";

/**
 * Upload room photo to Vercel Blob storage with automatic optimization
 * - Compresses and converts to WebP format
 * - Resizes to max 1920px width
 */
export async function uploadRoomPhoto(
    formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return { success: false, error: "Only image files allowed" };
        }

        // Validate file size (max 10MB before compression)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: "File too large. Max 10MB" };
        }

        // Optimize image (resize + convert to WebP)
        const optimizedBuffer = await optimizeImage(file, {
            maxWidth: 1920,
            quality: 80,
        });

        // Generate filename with .webp extension
        const filename = getOptimizedFilename(file.name, "rooms");

        // Upload to Vercel Blob
        const blob = await put(filename, optimizedBuffer, {
            access: "public",
            contentType: "image/webp",
        });

        return { success: true, url: blob.url };
    } catch (error) {
        console.error("Error uploading room photo:", error);
        return { success: false, error: "Failed to upload photo" };
    }
}


/**
 * Delete a room photo from Vercel Blob storage
 */
export async function deleteRoomPhoto(
    url: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await del(url);
        return { success: true };
    } catch (error) {
        console.error("Error deleting room photo:", error);
        return { success: false, error: "Failed to delete photo" };
    }
}
