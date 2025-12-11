import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { optimizeImage, getOptimizedFilename } from "../../lib/image-optimizer";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type (images only)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
        }

        // Limit size to 50MB before compression
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
        }

        // Optimize image (resize to 1280px max for ID photos + convert to WebP)
        const optimizedBuffer = await optimizeImage(file, {
            maxWidth: 1280,
            quality: 80,
        });

        // Generate filename with .webp extension
        const filename = getOptimizedFilename(file.name, "guest-ids");

        // Upload to Vercel Blob
        const blob = await put(filename, optimizedBuffer, {
            access: "public",
            contentType: "image/webp",
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

