/**
 * Vibe Branding Utilities
 * 
 * OYO-style branding system for consistent hotel naming:
 * - Auto-generates unique Vibe codes (VB10001, VB10002, etc.)
 * - Formats display names with branding (Vibe VB10001 Hotel Sunrise)
 * - Category-based branding (Vibe Classic, Vibe Premium, Vibe Business)
 */

export type HotelCategory = "CLASSIC" | "PREMIUM" | "BUSINESS";

/**
 * Generate a unique Vibe code for a hotel
 * Format: VB + 5-digit number (e.g., VB10001)
 * 
 * @param existingCodes - Array of existing vibe codes to avoid duplicates
 * @returns A unique vibe code
 */
export function generateVibeCode(existingCodes: string[] = []): string {
    const prefix = "VB";
    const startNumber = 10001;

    // Find the highest existing number
    let maxNumber = startNumber - 1;
    for (const code of existingCodes) {
        if (code.startsWith(prefix)) {
            const num = parseInt(code.slice(prefix.length), 10);
            if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
            }
        }
    }

    // Generate next code
    const nextNumber = maxNumber + 1;
    return `${prefix}${nextNumber}`;
}

/**
 * Format hotel display name with Vibe branding
 * 
 * Examples:
 * - formatVibeDisplayName({ name: "Hotel Sunrise", vibeCode: "VB10001" }) 
 *   => "Vibe VB10001 Hotel Sunrise"
 * - formatVibeDisplayName({ name: "Hotel Sunrise", vibeCode: "VB10001", category: "PREMIUM" }) 
 *   => "Vibe Premium VB10001"
 * - formatVibeDisplayName({ name: "Hotel Sunrise", vibeCode: "VB10001", showCategory: true }) 
 *   => "Vibe Classic VB10001"
 */
export function formatVibeDisplayName(options: {
    name: string;
    vibeCode?: string | null;
    category?: HotelCategory | null;
    showCategory?: boolean;
    shortFormat?: boolean; // Only show "Vibe VB10001" without hotel name
}): string {
    const { name, vibeCode, category, showCategory = false, shortFormat = false } = options;

    // If no vibe code, just return original name
    if (!vibeCode) {
        return name;
    }

    const categoryLabel = getCategoryLabel(category);

    if (shortFormat) {
        // Short format: "Vibe VB10001" or "Vibe Premium VB10001"
        return showCategory && categoryLabel
            ? `Vibe ${categoryLabel} ${vibeCode}`
            : `Vibe ${vibeCode}`;
    }

    // Full format: "Vibe VB10001 Hotel Sunrise" or "Vibe Premium VB10001 Hotel Sunrise"
    if (showCategory && categoryLabel) {
        return `Vibe ${categoryLabel} ${vibeCode}`;
    }

    return `Vibe ${vibeCode} ${name}`;
}

/**
 * Get display label for hotel category
 */
export function getCategoryLabel(category?: HotelCategory | null): string | null {
    switch (category) {
        case "CLASSIC":
            return "Classic";
        case "PREMIUM":
            return "Premium";
        case "BUSINESS":
            return "Business";
        default:
            return null;
    }
}

/**
 * Determine hotel category based on price
 * 
 * @param lowestPrice - Hotel's lowest room price
 * @returns Suggested category
 */
export function suggestCategory(lowestPrice: number): HotelCategory {
    if (lowestPrice >= 8000) {
        return "PREMIUM";
    } else if (lowestPrice <= 3000) {
        return "CLASSIC";
    } else {
        return "CLASSIC"; // Default to classic for mid-range
    }
}

/**
 * Get category badge color for UI
 */
export function getCategoryColor(category?: HotelCategory | null): string {
    switch (category) {
        case "PREMIUM":
            return "#F59E0B"; // Amber/Gold
        case "BUSINESS":
            return "#3B82F6"; // Blue
        case "CLASSIC":
        default:
            return "#10B981"; // Green
    }
}
