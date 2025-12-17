// Zinu Branding Utilities
// Centralizes logic for "Zinu" naming conventions

interface ZinuDisplayNameOptions {
    name: string;
    zinuCode?: string | null;
    category?: "CLASSIC" | "PREMIUM" | "BUSINESS";
    showCategory?: boolean; // If true, includes category in name (e.g. "Zinu Classic Hotel Name")
    shortFormat?: boolean;  // If true, returns shorter version (e.g. "Zinu Hotel Name")
}

/**
 * Generates a unique 7-character Zinu Code (e.g., "ZR10001", "ZR99999")
 * ensuring no collision with existing codes.
 *
 * Format: "ZR" + 5 digits (random)
 */
export function generateZinuCode(existingCodes: (string | null)[]): string {
    const prefix = "ZR";
    let code = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
        // Generate 5 random digits
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 10000-99999
        code = `${prefix}${randomNum}`;

        if (!existingCodes.includes(code)) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error("Failed to generate unique Zinu Code after 100 attempts");
    }

    return code;
}

/**
 * Formats the hotel display name according to Zinu branding rules.
 *
 * Rules:
 * 1. If zinuCode is present, prefix with "Zinu" or "Zinu [Category]"
 * 2. If no zinuCode (unverified/pending), show original name only
 *
 * Examples:
 * - formatZinuDisplayName({ name: "Hotel Sunrise", zinuCode: "ZR10001" }) 
 *   => "Zinu Hotel Sunrise"
 * - formatZinuDisplayName({ name: "Hotel Sunrise", zinuCode: "ZR10001", category: "PREMIUM" }) 
 *   => "Zinu Premium Hotel Sunrise"
 * - formatZinuDisplayName({ name: "Hotel Sunrise", zinuCode: "ZR10001", showCategory: true }) 
 *   => "Zinu Classic Hotel Sunrise"
 */
export function formatZinuDisplayName(options: ZinuDisplayNameOptions): string {
    const { name, zinuCode, category, showCategory = false, shortFormat = false } = options;

    if (!zinuCode) {
        return name;
    }

    // Clean up original name if it already has "Hotel" or "Resort" to avoid redundancy if needed
    // For now, we prepend "Zinu"
    let brandPrefix = "Zinu";

    if (showCategory && category) {
        const categoryLabel = category.charAt(0) + category.slice(1).toLowerCase(); // "Classic"
        brandPrefix = `Zinu ${categoryLabel}`;
    }

    // Check if name already starts with Zinu (legacy data protection)
    if (name.toLowerCase().startsWith("zinu")) {
        return name;
    }

    return `${brandPrefix} ${name}`;
}

/**
 * Returns the Brand Color based on category
 */
export function getZinuBrandColor(category?: "CLASSIC" | "PREMIUM" | "BUSINESS"): string {
    switch (category) {
        case "PREMIUM":
            return "#E63946"; // Red
        case "BUSINESS":
            return "#1D3557"; // Navy
        case "CLASSIC":
        default:
            return "#E63946"; // Default Zinu Red
    }
}
