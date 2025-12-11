"use server";

import { put, del } from "@vercel/blob";

/**
 * Upload room photo to Vercel Blob storage
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
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Invalid file type. Use JPG, PNG, or WebP" };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: "File too large. Max 5MB" };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const filename = `rooms/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: "public",
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
