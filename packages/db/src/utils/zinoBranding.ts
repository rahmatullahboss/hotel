/**
 * Zino Branding Utilities
 * 
 * OYO-style branding system for consistent hotel naming:
 * - Auto-generates unique Zino codes (ZR10001, ZR10002, etc.)
 * - Formats display names with branding (Zino ZR10001 Hotel Sunrise)
 * - Category-based branding (Zino Classic, Zino Premium, Zino Business)
 */

export type HotelCategory = "CLASSIC" | "PREMIUM" | "BUSINESS";

/**
 * Generate a unique Zino code for a hotel
 * Format: ZR + 5-digit number (e.g., ZR10001)
 * 
 * @param existingCodes - Array of existing zino codes to avoid duplicates
 * @returns A unique zino code
 */
export function generateZinoCode(existingCodes: string[] = []): string {
    const prefix = "ZR";
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
 * Format hotel display name with Zino branding
 * 
 * Examples:
 * - formatZinoDisplayName({ name: "Hotel Sunrise", zinoCode: "ZR10001" }) 
 *   => "Zino ZR10001 Hotel Sunrise"
 * - formatZinoDisplayName({ name: "Hotel Sunrise", zinoCode: "ZR10001", category: "PREMIUM" }) 
 *   => "Zino Premium ZR10001"
 * - formatZinoDisplayName({ name: "Hotel Sunrise", zinoCode: "ZR10001", showCategory: true }) 
 *   => "Zino Classic ZR10001"
 */
export function formatZinoDisplayName(options: {
    name: string;
    zinoCode?: string | null;
    category?: HotelCategory | null;
    showCategory?: boolean;
    shortFormat?: boolean; // Only show "Zino ZR10001" without hotel name
}): string {
    const { name, zinoCode, category, showCategory = false, shortFormat = false } = options;

    // If no zino code, just return original name
    if (!zinoCode) {
        return name;
    }

    const categoryLabel = getCategoryLabel(category);

    if (shortFormat) {
        // Short format: "Zino ZR10001" or "Zino Premium ZR10001"
        return showCategory && categoryLabel
            ? `Zino ${categoryLabel} ${zinoCode}`
            : `Zino ${zinoCode}`;
    }

    // Full format: "Zino ZR10001 Hotel Sunrise" or "Zino Premium ZR10001 Hotel Sunrise"
    if (showCategory && categoryLabel) {
        return `Zino ${categoryLabel} ${zinoCode}`;
    }

    return `Zino ${zinoCode} ${name}`;
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
