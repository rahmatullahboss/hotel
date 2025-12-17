// Pricing constants
// Separated from actions to avoid "use server" export restrictions

// Tax rate (15% for taxes and fees)
export const TAX_RATE = 0.15;

// First booking discount percentage (20%)
export const FIRST_BOOKING_DISCOUNT_PERCENT = 20;

// Maximum discount amount (optional cap)
export const FIRST_BOOKING_MAX_DISCOUNT = 1000; // ৳1000 max

export interface FirstBookingEligibility {
    eligible: boolean;
    discountPercent: number;
    maxDiscount: number;
    message?: string;
}
