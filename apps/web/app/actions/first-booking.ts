"use server";

import { db } from "@repo/db";
import { bookings } from "@repo/db/schema";
import { eq, and, ne, count } from "drizzle-orm";

import {
    FIRST_BOOKING_DISCOUNT_PERCENT,
    FIRST_BOOKING_MAX_DISCOUNT,
    FirstBookingEligibility
} from "../constants";

export type { FirstBookingEligibility }; // Re-export type if needed, or just let consumers import from constants


/**
 * Check if a user is eligible for the first booking offer
 * A user is eligible if they have no confirmed/completed bookings
 * Cancelled bookings do NOT count as first booking
 */
export async function checkFirstBookingEligibility(
    userId: string
): Promise<FirstBookingEligibility> {
    if (!userId) {
        return {
            eligible: false,
            discountPercent: 0,
            maxDiscount: 0,
            message: "User not authenticated",
        };
    }

    try {
        // Count confirmed or completed bookings (not cancelled/pending)
        const result = await db
            .select({ count: count() })
            .from(bookings)
            .where(
                and(
                    eq(bookings.userId, userId),
                    ne(bookings.status, "CANCELLED"),
                    ne(bookings.status, "PENDING") // Only count confirmed+ bookings
                )
            );

        const bookingCount = result[0]?.count || 0;

        if (bookingCount === 0) {
            return {
                eligible: true,
                discountPercent: FIRST_BOOKING_DISCOUNT_PERCENT,
                maxDiscount: FIRST_BOOKING_MAX_DISCOUNT,
                message: "🎉 First Booking Offer: Get 20% OFF!",
            };
        }

        return {
            eligible: false,
            discountPercent: 0,
            maxDiscount: 0,
            message: "You have already made a booking",
        };
    } catch (error) {
        console.error("Error checking first booking eligibility:", error);
        return {
            eligible: false,
            discountPercent: 0,
            maxDiscount: 0,
            message: "Error checking eligibility",
        };
    }
}

/**
 * Calculate the first booking discount amount
 * Returns 0 if user is not eligible
 */
export async function calculateFirstBookingDiscount(
    userId: string,
    totalAmount: number
): Promise<{ discount: number; eligible: boolean }> {
    const eligibility = await checkFirstBookingEligibility(userId);

    if (!eligibility.eligible) {
        return { discount: 0, eligible: false };
    }

    // Calculate 20% discount
    let discount = Math.round((totalAmount * eligibility.discountPercent) / 100);

    // Apply max discount cap
    discount = Math.min(discount, eligibility.maxDiscount);

    return { discount, eligible: true };
}

/**
 * Validate and get discount for booking
 * Used during the booking process to apply the discount
 */
export async function getFirstBookingOffer(
    userId: string,
    bookingAmount: number
): Promise<{
    eligible: boolean;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
    message: string;
}> {
    const eligibility = await checkFirstBookingEligibility(userId);

    if (!eligibility.eligible) {
        return {
            eligible: false,
            discountPercent: 0,
            discountAmount: 0,
            finalAmount: bookingAmount,
            message: eligibility.message || "Not eligible for first booking offer",
        };
    }

    const { discount } = await calculateFirstBookingDiscount(userId, bookingAmount);

    return {
        eligible: true,
        discountPercent: eligibility.discountPercent,
        discountAmount: discount,
        finalAmount: bookingAmount - discount,
        message: `🎉 ${eligibility.discountPercent}% First Booking Discount Applied!`,
    };
}
