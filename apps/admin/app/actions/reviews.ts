"use server";

import { db, reviews, hotels, users, bookings } from "@repo/db";
import { eq, desc, and, sql, avg, count, gte, lte, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================
// Types
// ==================

interface ReviewWithDetails {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    hotelName: string;
    hotelId: string;
    guestName: string | null;
    guestEmail: string | null;
    hotelResponse: string | null;
    isVisible: boolean;
    createdAt: Date;
    cleanlinessRating: number | null;
    serviceRating: number | null;
    valueRating: number | null;
    locationRating: number | null;
}

// ==================
// Get Functions
// ==================

/**
 * Get review dashboard stats
 */
export async function getReviewStats() {
    const allReviews = await db.query.reviews.findMany();

    const total = allReviews.length;
    const visible = allReviews.filter((r) => r.isVisible).length;
    const hidden = allReviews.filter((r) => !r.isVisible).length;
    const withResponse = allReviews.filter((r) => r.hotelResponse).length;

    // Rating breakdown
    const fiveStar = allReviews.filter((r) => r.rating === 5).length;
    const fourStar = allReviews.filter((r) => r.rating === 4).length;
    const threeStar = allReviews.filter((r) => r.rating === 3).length;
    const twoStar = allReviews.filter((r) => r.rating === 2).length;
    const oneStar = allReviews.filter((r) => r.rating === 1).length;

    const avgRating = total > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / total
        : 0;

    return {
        total,
        visible,
        hidden,
        withResponse,
        avgRating: avgRating.toFixed(1),
        breakdown: { fiveStar, fourStar, threeStar, twoStar, oneStar },
    };
}

/**
 * Get all reviews with hotel and user details
 */
export async function getAllReviews(
    filter?: "all" | "visible" | "hidden" | "no-response"
): Promise<ReviewWithDetails[]> {
    const allReviews = await db.query.reviews.findMany({
        with: {
            hotel: true,
            user: true,
        },
        orderBy: desc(reviews.createdAt),
    });

    let filtered = allReviews;

    if (filter === "visible") {
        filtered = allReviews.filter((r) => r.isVisible);
    } else if (filter === "hidden") {
        filtered = allReviews.filter((r) => !r.isVisible);
    } else if (filter === "no-response") {
        filtered = allReviews.filter((r) => !r.hotelResponse);
    }

    return filtered.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        hotelName: review.hotel?.name || "Unknown",
        hotelId: review.hotelId,
        guestName: review.user?.name || null,
        guestEmail: review.user?.email || null,
        hotelResponse: review.hotelResponse,
        isVisible: review.isVisible,
        createdAt: review.createdAt,
        cleanlinessRating: review.cleanlinessRating,
        serviceRating: review.serviceRating,
        valueRating: review.valueRating,
        locationRating: review.locationRating,
    }));
}

/**
 * Get reviews for a specific hotel
 */
export async function getHotelReviews(hotelId: string): Promise<ReviewWithDetails[]> {
    const hotelReviews = await db.query.reviews.findMany({
        where: eq(reviews.hotelId, hotelId),
        with: {
            hotel: true,
            user: true,
        },
        orderBy: desc(reviews.createdAt),
    });

    return hotelReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        hotelName: review.hotel?.name || "Unknown",
        hotelId: review.hotelId,
        guestName: review.user?.name || null,
        guestEmail: review.user?.email || null,
        hotelResponse: review.hotelResponse,
        isVisible: review.isVisible,
        createdAt: review.createdAt,
        cleanlinessRating: review.cleanlinessRating,
        serviceRating: review.serviceRating,
        valueRating: review.valueRating,
        locationRating: review.locationRating,
    }));
}

// ==================
// Moderation Actions
// ==================

/**
 * Hide a review (make it invisible)
 */
export async function hideReview(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(reviews)
            .set({ isVisible: false, updatedAt: new Date() })
            .where(eq(reviews.id, reviewId));

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error hiding review:", error);
        return { success: false, error: "Failed to hide review" };
    }
}

/**
 * Show a review (make it visible)
 */
export async function showReview(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(reviews)
            .set({ isVisible: true, updatedAt: new Date() })
            .where(eq(reviews.id, reviewId));

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error showing review:", error);
        return { success: false, error: "Failed to show review" };
    }
}

/**
 * Delete a review permanently
 */
export async function deleteReview(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get review to update hotel stats
        const review = await db.query.reviews.findFirst({
            where: eq(reviews.id, reviewId),
        });

        if (!review) {
            return { success: false, error: "Review not found" };
        }

        // Delete the review
        await db.delete(reviews).where(eq(reviews.id, reviewId));

        // Recalculate hotel rating
        const remainingReviews = await db.query.reviews.findMany({
            where: eq(reviews.hotelId, review.hotelId),
        });

        const newRating = remainingReviews.length > 0
            ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
            : 0;

        await db
            .update(hotels)
            .set({
                rating: newRating.toFixed(1),
                reviewCount: remainingReviews.length,
                updatedAt: new Date(),
            })
            .where(eq(hotels.id, review.hotelId));

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        return { success: false, error: "Failed to delete review" };
    }
}

/**
 * Add hotel response to a review (admin on behalf of hotel)
 */
export async function addHotelResponse(
    reviewId: string,
    response: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(reviews)
            .set({
                hotelResponse: response,
                hotelRespondedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(reviews.id, reviewId));

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error adding response:", error);
        return { success: false, error: "Failed to add response" };
    }
}
