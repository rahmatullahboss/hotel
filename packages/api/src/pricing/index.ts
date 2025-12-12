/**
 * Dynamic Pricing Engine
 * 
 * Platform-wide automatic pricing rules that adjust room prices based on:
 * - Day of week (BD weekend = Friday/Saturday)
 * - Hotel occupancy levels
 * - Lead time (days until check-in)
 * - Length of stay
 * - Seasonal factors
 */

// ============================================
// PLATFORM-WIDE PRICING CONFIGURATION
// ============================================

export const PRICING_CONFIG = {
    // Day of week multipliers (BD weekend = Friday/Saturday)
    dayOfWeek: {
        5: 1.15,  // Friday: +15%
        6: 1.15,  // Saturday: +15% (same as Friday)
        4: 1.05,  // Thursday (pre-weekend): +5%
    } as Record<number, number>,

    // Occupancy-based pricing (hotel-level)
    occupancy: {
        above80: { threshold: 0.80, multiplier: 1.15 },  // +15%
        above60: { threshold: 0.60, multiplier: 1.10 },  // +10%
        below30: { threshold: 0.30, multiplier: 0.90 },  // -10% flash deal
    },

    // Lead time pricing (days until check-in)
    leadTime: {
        sameDay: { maxDays: 0, multiplier: 1.10 },   // +10% urgent
        under7: { maxDays: 7, multiplier: 1.00 },    // normal
        under30: { maxDays: 30, multiplier: 0.95 },  // -5% early bird
        over30: { maxDays: Infinity, multiplier: 0.90 }, // -10% advance
    },

    // Length of stay discounts
    lengthOfStay: {
        nights7Plus: { minNights: 7, multiplier: 0.85 },  // -15%
        nights3Plus: { minNights: 3, multiplier: 0.95 },  // -5%
    },

    // Seasonal pricing (month-based)
    seasonal: {
        peak: {
            months: [11, 12, 1, 4], // Nov, Dec, Jan, Apr (winter + pohela boishakh)
            multiplier: 1.10,       // +10%
        },
        offPeak: {
            months: [6, 7, 8],      // Jun, Jul, Aug (monsoon)
            multiplier: 0.90,       // -10%
        },
    },

    // Price bounds (prevent extreme pricing)
    bounds: {
        minMultiplier: 0.70,  // Never go below 70% of base
        maxMultiplier: 1.50,  // Never go above 150% of base
    },
} as const;

// ============================================
// TYPES
// ============================================

export interface PriceBreakdown {
    basePrice: number;
    finalPrice: number;
    totalMultiplier: number;
    appliedRules: AppliedRule[];
}

export interface AppliedRule {
    name: string;
    type: 'dayOfWeek' | 'occupancy' | 'leadTime' | 'lengthOfStay' | 'seasonal' | 'holiday';
    multiplier: number;
    description: string;
}

export interface SeasonalRule {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    multiplier: number;
}

export interface DynamicPriceInput {
    basePrice: number;
    checkIn: string;  // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    hotelOccupancy?: number; // 0-1 (percentage)
    seasonalRules?: SeasonalRule[]; // Admin-defined holidays
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the number of nights between two dates
 */
function getNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get days until check-in from today
 */
function getDaysUntilCheckIn(checkIn: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDate = new Date(checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    return Math.floor((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date falls within a seasonal rule
 */
function isDateInRange(date: string, startDate: string, endDate: string): boolean {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return d >= start && d <= end;
}

// ============================================
// MAIN PRICING FUNCTIONS
// ============================================

/**
 * Calculate day-of-week multiplier
 * Uses the check-in date's day of week
 */
function getDayOfWeekMultiplier(checkIn: string): AppliedRule | null {
    const date = new Date(checkIn);
    const dayOfWeek = date.getDay(); // 0=Sunday, 5=Friday, 6=Saturday
    const multiplier = PRICING_CONFIG.dayOfWeek[dayOfWeek];

    if (multiplier && multiplier !== 1.0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const change = multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}%` : `${Math.round((multiplier - 1) * 100)}%`;
        return {
            name: `${dayNames[dayOfWeek]} Rate`,
            type: 'dayOfWeek',
            multiplier,
            description: `${dayNames[dayOfWeek]} check-in (${change})`,
        };
    }
    return null;
}

/**
 * Calculate occupancy-based multiplier
 */
function getOccupancyMultiplier(occupancy: number | undefined): AppliedRule | null {
    if (occupancy === undefined) return null;

    const { above80, above60, below30 } = PRICING_CONFIG.occupancy;

    if (occupancy >= above80.threshold) {
        return {
            name: 'High Demand',
            type: 'occupancy',
            multiplier: above80.multiplier,
            description: `High demand (+${Math.round((above80.multiplier - 1) * 100)}%)`,
        };
    }
    if (occupancy >= above60.threshold) {
        return {
            name: 'Moderate Demand',
            type: 'occupancy',
            multiplier: above60.multiplier,
            description: `Good availability (+${Math.round((above60.multiplier - 1) * 100)}%)`,
        };
    }
    if (occupancy < below30.threshold) {
        return {
            name: 'Flash Deal',
            type: 'occupancy',
            multiplier: below30.multiplier,
            description: `Limited time offer (${Math.round((below30.multiplier - 1) * 100)}%)`,
        };
    }
    return null;
}

/**
 * Calculate lead time multiplier
 */
function getLeadTimeMultiplier(checkIn: string): AppliedRule | null {
    const daysUntil = getDaysUntilCheckIn(checkIn);
    const { sameDay, under30, over30 } = PRICING_CONFIG.leadTime;

    if (daysUntil <= sameDay.maxDays) {
        return {
            name: 'Last Minute',
            type: 'leadTime',
            multiplier: sameDay.multiplier,
            description: `Same-day booking (+${Math.round((sameDay.multiplier - 1) * 100)}%)`,
        };
    }
    if (daysUntil > 30) {
        return {
            name: 'Advance Booking',
            type: 'leadTime',
            multiplier: over30.multiplier,
            description: `Booked ${daysUntil} days ahead (${Math.round((over30.multiplier - 1) * 100)}%)`,
        };
    }
    if (daysUntil > 7) {
        return {
            name: 'Early Bird',
            type: 'leadTime',
            multiplier: under30.multiplier,
            description: `Booked ${daysUntil} days ahead (${Math.round((under30.multiplier - 1) * 100)}%)`,
        };
    }
    return null;
}

/**
 * Calculate length of stay discount
 */
function getLengthOfStayMultiplier(checkIn: string, checkOut: string): AppliedRule | null {
    const nights = getNights(checkIn, checkOut);
    const { nights7Plus, nights3Plus } = PRICING_CONFIG.lengthOfStay;

    if (nights >= nights7Plus.minNights) {
        return {
            name: 'Weekly Stay',
            type: 'lengthOfStay',
            multiplier: nights7Plus.multiplier,
            description: `${nights} nights stay (${Math.round((nights7Plus.multiplier - 1) * 100)}%)`,
        };
    }
    if (nights >= nights3Plus.minNights) {
        return {
            name: 'Extended Stay',
            type: 'lengthOfStay',
            multiplier: nights3Plus.multiplier,
            description: `${nights} nights stay (${Math.round((nights3Plus.multiplier - 1) * 100)}%)`,
        };
    }
    return null;
}

/**
 * Calculate seasonal multiplier (month-based)
 */
function getSeasonalMultiplier(checkIn: string): AppliedRule | null {
    const month = new Date(checkIn).getMonth() + 1; // 1-12
    const peakMonths: number[] = [11, 12, 1, 4];
    const offPeakMonths: number[] = [6, 7, 8];
    const { peak, offPeak } = PRICING_CONFIG.seasonal;

    if (peakMonths.includes(month)) {
        return {
            name: 'Peak Season',
            type: 'seasonal',
            multiplier: peak.multiplier,
            description: `Peak season (+${Math.round((peak.multiplier - 1) * 100)}%)`,
        };
    }
    if (offPeakMonths.includes(month)) {
        return {
            name: 'Off Season',
            type: 'seasonal',
            multiplier: offPeak.multiplier,
            description: `Off-peak season (${Math.round((offPeak.multiplier - 1) * 100)}%)`,
        };
    }
    return null;
}

/**
 * Check for admin-defined holiday/seasonal rules
 */
function getHolidayMultiplier(checkIn: string, seasonalRules?: SeasonalRule[]): AppliedRule | null {
    if (!seasonalRules || seasonalRules.length === 0) return null;

    for (const rule of seasonalRules) {
        if (isDateInRange(checkIn, rule.startDate, rule.endDate)) {
            const change = rule.multiplier > 1
                ? `+${Math.round((rule.multiplier - 1) * 100)}%`
                : `${Math.round((rule.multiplier - 1) * 100)}%`;
            return {
                name: rule.name,
                type: 'holiday',
                multiplier: rule.multiplier,
                description: `${rule.name} (${change})`,
            };
        }
    }
    return null;
}

// ============================================
// MAIN EXPORT
// ============================================

/**
 * Calculate dynamic price for a room booking
 * 
 * @param input - Pricing input parameters
 * @returns Price breakdown with final price and applied rules
 */
export function calculateDynamicPrice(input: DynamicPriceInput): PriceBreakdown {
    const { basePrice, checkIn, checkOut, hotelOccupancy, seasonalRules } = input;
    const appliedRules: AppliedRule[] = [];

    // Collect all applicable rules
    const dayOfWeekRule = getDayOfWeekMultiplier(checkIn);
    if (dayOfWeekRule) appliedRules.push(dayOfWeekRule);

    const occupancyRule = getOccupancyMultiplier(hotelOccupancy);
    if (occupancyRule) appliedRules.push(occupancyRule);

    const leadTimeRule = getLeadTimeMultiplier(checkIn);
    if (leadTimeRule) appliedRules.push(leadTimeRule);

    const lengthRule = getLengthOfStayMultiplier(checkIn, checkOut);
    if (lengthRule) appliedRules.push(lengthRule);

    // Holiday rules take precedence over general seasonal rules
    const holidayRule = getHolidayMultiplier(checkIn, seasonalRules);
    if (holidayRule) {
        appliedRules.push(holidayRule);
    } else {
        const seasonalRule = getSeasonalMultiplier(checkIn);
        if (seasonalRule) appliedRules.push(seasonalRule);
    }

    // Calculate total multiplier (all rules stack)
    let totalMultiplier = appliedRules.reduce((acc, rule) => acc * rule.multiplier, 1.0);

    // Apply bounds
    const { minMultiplier, maxMultiplier } = PRICING_CONFIG.bounds;
    totalMultiplier = Math.max(minMultiplier, Math.min(maxMultiplier, totalMultiplier));

    // Calculate final price (round to nearest integer for BDT)
    const finalPrice = Math.round(basePrice * totalMultiplier);

    return {
        basePrice,
        finalPrice,
        totalMultiplier,
        appliedRules,
    };
}

/**
 * Calculate average dynamic price for a date range
 * Useful for multi-night bookings where price may vary by night
 */
export function calculateTotalDynamicPrice(input: DynamicPriceInput): PriceBreakdown & { totalPrice: number; nights: number } {
    const { basePrice, checkIn, checkOut, hotelOccupancy, seasonalRules } = input;
    const nights = getNights(checkIn, checkOut);

    if (nights <= 0) {
        return {
            basePrice,
            finalPrice: basePrice,
            totalMultiplier: 1.0,
            appliedRules: [],
            totalPrice: basePrice,
            nights: 1,
        };
    }

    // For simplicity, calculate based on check-in date
    // In a more complex system, you might average across all nights
    const breakdown = calculateDynamicPrice(input);

    return {
        ...breakdown,
        totalPrice: breakdown.finalPrice * nights,
        nights,
    };
}

/**
 * Get price forecast for next N days
 * Useful for partner dashboard to see upcoming price adjustments
 */
export function getPriceForecast(
    basePrice: number,
    days: number = 14,
    hotelOccupancy?: number,
    seasonalRules?: SeasonalRule[]
): Array<{ date: string; price: number; multiplier: number; rules: string[] }> {
    const forecast: Array<{ date: string; price: number; multiplier: number; rules: string[] }> = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0]!;

        // Calculate for single night stay on this date
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const checkOut = nextDay.toISOString().split('T')[0]!;

        const breakdown = calculateDynamicPrice({
            basePrice,
            checkIn: dateStr,
            checkOut,
            hotelOccupancy,
            seasonalRules,
        });

        forecast.push({
            date: dateStr,
            price: breakdown.finalPrice,
            multiplier: breakdown.totalMultiplier,
            rules: breakdown.appliedRules.map(r => r.name),
        });
    }

    return forecast;
}
