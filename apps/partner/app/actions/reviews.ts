"use server";

import { db, reviews, bookings, users } from "@repo/db";
import { eq, desc, and, count, avg, isNull, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPartnerRole } from "./getPartnerRole";

// ==================
// Types
// ==================

export interface ReviewWithGuest {
    id: string;
    bookingId: string;
    rating: number;
    title: string | null;
    content: string | null;
    cleanlinessRating: number | null;
    serviceRating: number | null;
    valueRating: number | null;
    locationRating: number | null;
    hotelResponse: string | null;
    hotelRespondedAt: Date | null;
    createdAt: Date;
    guest: {
        name: string | null;
        image: string | null;
    };
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
    ratingBreakdown: {
        rating: number;
        count: number;
        percentage: number;
    }[];
    categoryAverages: {
        cleanliness: number;
        service: number;
        value: number;
        location: number;
    };
}

// ==================
// Get Functions
// ==================

/**
 * Get all reviews for the current hotel
 */
export async function getHotelReviews(options?: {
    filter?: "all" | "responded" | "unresponded";
    ratingFilter?: number;
    limit?: number;
}): Promise<ReviewWithGuest[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo?.hotelId) {
            return [];
        }

        const { filter = "all", ratingFilter, limit = 50 } = options || {};

        // Build conditions
        const conditions = [eq(reviews.hotelId, roleInfo.hotelId)];

        if (filter === "responded") {
            conditions.push(isNotNull(reviews.hotelResponse));
        } else if (filter === "unresponded") {
            conditions.push(isNull(reviews.hotelResponse));
        }

        if (ratingFilter) {
            conditions.push(eq(reviews.rating, ratingFilter));
        }

        const hotelReviews = await db
            .select({
                id: reviews.id,
                bookingId: reviews.bookingId,
                rating: reviews.rating,
                title: reviews.title,
                content: reviews.content,
                cleanlinessRating: reviews.cleanlinessRating,
                serviceRating: reviews.serviceRating,
                valueRating: reviews.valueRating,
                locationRating: reviews.locationRating,
                hotelResponse: reviews.hotelResponse,
                hotelRespondedAt: reviews.hotelRespondedAt,
                createdAt: reviews.createdAt,
                guestName: users.name,
                guestImage: users.image,
            })
            .from(reviews)
            .innerJoin(users, eq(reviews.userId, users.id))
            .where(and(...conditions))
            .orderBy(desc(reviews.createdAt))
            .limit(limit);

        return hotelReviews.map((r: typeof hotelReviews[number]) => ({
            id: r.id,
            bookingId: r.bookingId,
            rating: r.rating,
            title: r.title,
            content: r.content,
            cleanlinessRating: r.cleanlinessRating,
            serviceRating: r.serviceRating,
            valueRating: r.valueRating,
            locationRating: r.locationRating,
            hotelResponse: r.hotelResponse,
            hotelRespondedAt: r.hotelRespondedAt,
            createdAt: r.createdAt,
            guest: {
                name: r.guestName,
                image: r.guestImage,
            },
        }));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

/**
 * Get review statistics for the current hotel
 */
export async function getReviewStats(): Promise<ReviewStats | null> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo?.hotelId) {
            return null;
        }

        const hotelId = roleInfo.hotelId;

        // Get all reviews for this hotel
        const allReviews = await db
            .select({
                rating: reviews.rating,
                cleanlinessRating: reviews.cleanlinessRating,
                serviceRating: reviews.serviceRating,
                valueRating: reviews.valueRating,
                locationRating: reviews.locationRating,
                hasResponse: sql<boolean>`${reviews.hotelResponse} IS NOT NULL`,
            })
            .from(reviews)
            .where(eq(reviews.hotelId, hotelId));

        type ReviewRow = typeof allReviews[number];

        if (allReviews.length === 0) {
            return {
                totalReviews: 0,
                averageRating: 0,
                responseRate: 0,
                ratingBreakdown: [
                    { rating: 5, count: 0, percentage: 0 },
                    { rating: 4, count: 0, percentage: 0 },
                    { rating: 3, count: 0, percentage: 0 },
                    { rating: 2, count: 0, percentage: 0 },
                    { rating: 1, count: 0, percentage: 0 },
                ],
                categoryAverages: {
                    cleanliness: 0,
                    service: 0,
                    value: 0,
                    location: 0,
                },
            };
        }

        // Calculate stats
        const totalReviews = allReviews.length;
        const avgRating = allReviews.reduce((sum: number, r: ReviewRow) => sum + r.rating, 0) / totalReviews;
        const respondedCount = allReviews.filter((r: ReviewRow) => r.hasResponse).length;
        const responseRate = (respondedCount / totalReviews) * 100;

        // Rating breakdown
        const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        allReviews.forEach((r: ReviewRow) => {
            ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
        });

        const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
            rating,
            count: ratingCounts[rating] || 0,
            percentage: ((ratingCounts[rating] || 0) / totalReviews) * 100,
        }));

        // Category averages
        const categorySum = {
            cleanliness: 0,
            service: 0,
            value: 0,
            location: 0,
        };
        const categoryCounts = {
            cleanliness: 0,
            service: 0,
            value: 0,
            location: 0,
        };

        allReviews.forEach((r: ReviewRow) => {
            if (r.cleanlinessRating) {
                categorySum.cleanliness += r.cleanlinessRating;
                categoryCounts.cleanliness++;
            }
            if (r.serviceRating) {
                categorySum.service += r.serviceRating;
                categoryCounts.service++;
            }
            if (r.valueRating) {
                categorySum.value += r.valueRating;
                categoryCounts.value++;
            }
            if (r.locationRating) {
                categorySum.location += r.locationRating;
                categoryCounts.location++;
            }
        });

        return {
            totalReviews,
            averageRating: parseFloat(avgRating.toFixed(1)),
            responseRate: parseFloat(responseRate.toFixed(0)),
            ratingBreakdown,
            categoryAverages: {
                cleanliness: categoryCounts.cleanliness > 0
                    ? parseFloat((categorySum.cleanliness / categoryCounts.cleanliness).toFixed(1))
                    : 0,
                service: categoryCounts.service > 0
                    ? parseFloat((categorySum.service / categoryCounts.service).toFixed(1))
                    : 0,
                value: categoryCounts.value > 0
                    ? parseFloat((categorySum.value / categoryCounts.value).toFixed(1))
                    : 0,
                location: categoryCounts.location > 0
                    ? parseFloat((categorySum.location / categoryCounts.location).toFixed(1))
                    : 0,
            },
        };
    } catch (error) {
        console.error("Error fetching review stats:", error);
        return null;
    }
}

// ==================
// Update Functions
// ==================

/**
 * Add a response to a review
 */
export async function respondToReview(
    reviewId: string,
    response: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo?.hotelId) {
            return { success: false, error: "Not authenticated" };
        }

        // Verify the review belongs to this hotel
        const review = await db.query.reviews.findFirst({
            where: and(
                eq(reviews.id, reviewId),
                eq(reviews.hotelId, roleInfo.hotelId)
            ),
        });

        if (!review) {
            return { success: false, error: "Review not found" };
        }

        // Update the review with response
        await db
            .update(reviews)
            .set({
                hotelResponse: response.trim(),
                hotelRespondedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(reviews.id, reviewId));

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error responding to review:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to respond",
        };
    }
}

/**
 * Update an existing response
 */
export async function updateReviewResponse(
    reviewId: string,
    response: string
): Promise<{ success: boolean; error?: string }> {
    return respondToReview(reviewId, response);
}

/**
 * Delete a response (set to null)
 */
export async function deleteReviewResponse(
    reviewId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo?.hotelId) {
            return { success: false, error: "Not authenticated" };
        }

        await db
            .update(reviews)
            .set({
                hotelResponse: null,
                hotelRespondedAt: null,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(reviews.id, reviewId),
                    eq(reviews.hotelId, roleInfo.hotelId)
                )
            );

        revalidatePath("/reviews");
        return { success: true };
    } catch (error) {
        console.error("Error deleting response:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete",
        };
    }
}
