import sharp from "sharp";

export interface ImageOptimizeOptions {
    /** Maximum width in pixels. Height scales proportionally. */
    maxWidth?: number;
    /** Quality from 1-100. Default: 80 */
    quality?: number;
}

const DEFAULT_OPTIONS: Required<ImageOptimizeOptions> = {
    maxWidth: 1920,
    quality: 80,
};

/**
 * Optimize an image file for web upload.
 * - Resizes to max dimensions while maintaining aspect ratio
 * - Converts to WebP format for best compression
 * - Applies quality compression
 *
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Buffer of optimized WebP image
 */
export async function optimizeImage(
    file: File,
    options: ImageOptimizeOptions = {}
): Promise<Buffer> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process with sharp
    const optimized = await sharp(buffer)
        .resize({
            width: opts.maxWidth,
            withoutEnlargement: true, // Don't upscale smaller images
        })
        .webp({
            quality: opts.quality,
        })
        .toBuffer();

    return optimized;
}

/**
 * Get optimized filename with .webp extension
 */
export function getOptimizedFilename(
    originalFilename: string,
    prefix: string
): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    return `${prefix}/${timestamp}-${randomSuffix}.webp`;
}
