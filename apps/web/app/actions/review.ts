"use server";

import { db } from "@repo/db";
import { reviews, bookings, hotels } from "@repo/db/schema";
import { eq, and, desc, avg, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface ReviewInput {
    bookingId: string;
    rating: number; // 1-5
    title?: string;
    content?: string;
    cleanlinessRating?: number;
    serviceRating?: number;
    valueRating?: number;
    locationRating?: number;
}

/**
 * Submit a review for a completed booking
 */
export async function submitReview(
    input: ReviewInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        // Validate rating
        if (input.rating < 1 || input.rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        // Get booking and verify ownership
        const booking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, input.bookingId),
                eq(bookings.userId, session.user.id)
            ),
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        // Can only review after checkout
        if (booking.status !== "CHECKED_OUT") {
            return { success: false, error: "You can only review after checkout" };
        }

        // Check if already reviewed
        const existingReview = await db.query.reviews.findFirst({
            where: eq(reviews.bookingId, input.bookingId),
        });

        if (existingReview) {
            return { success: false, error: "You have already reviewed this booking" };
        }

        // Create review
        await db.insert(reviews).values({
            bookingId: input.bookingId,
            hotelId: booking.hotelId,
            userId: session.user.id,
            rating: input.rating,
            title: input.title || null,
            content: input.content || null,
            cleanlinessRating: input.cleanlinessRating,
            serviceRating: input.serviceRating,
            valueRating: input.valueRating,
            locationRating: input.locationRating,
        });

        // Update hotel rating
        await updateHotelRating(booking.hotelId);

        revalidatePath(`/hotels/${booking.hotelId}`);
        revalidatePath("/bookings");
        return { success: true };
    } catch (error) {
        console.error("Error submitting review:", error);
        return { success: false, error: "Failed to submit review" };
    }
}

/**
 * Recalculate and update hotel rating
 */
async function updateHotelRating(hotelId: string): Promise<void> {
    const result = await db
        .select({
            avgRating: avg(reviews.rating),
            reviewCount: count(reviews.id),
        })
        .from(reviews)
        .where(and(eq(reviews.hotelId, hotelId), eq(reviews.isVisible, true)));

    const avgRating = result[0]?.avgRating || 0;
    const reviewCount = result[0]?.reviewCount || 0;

    await db
        .update(hotels)
        .set({
            rating: avgRating.toString(),
            reviewCount,
            updatedAt: new Date(),
        })
        .where(eq(hotels.id, hotelId));
}

/**
 * Get reviews for a hotel
 */
export async function getHotelReviews(hotelId: string): Promise<{
    reviews: Array<{
        id: string;
        rating: number;
        title: string | null;
        content: string | null;
        cleanlinessRating: number | null;
        serviceRating: number | null;
        valueRating: number | null;
        locationRating: number | null;
        hotelResponse: string | null;
        createdAt: Date;
        userName: string | null;
    }>;
    averageRating: number;
    totalReviews: number;
}> {
    try {
        const hotelReviews = await db.query.reviews.findMany({
            where: and(eq(reviews.hotelId, hotelId), eq(reviews.isVisible, true)),
            orderBy: desc(reviews.createdAt),
            with: {
                user: true,
            },
        });

        const avgResult = await db
            .select({
                avgRating: avg(reviews.rating),
                count: count(reviews.id),
            })
            .from(reviews)
            .where(and(eq(reviews.hotelId, hotelId), eq(reviews.isVisible, true)));

        return {
            reviews: hotelReviews.map((r: typeof hotelReviews[number]) => ({
                id: r.id,
                rating: r.rating,
                title: r.title,
                content: r.content,
                cleanlinessRating: r.cleanlinessRating,
                serviceRating: r.serviceRating,
                valueRating: r.valueRating,
                locationRating: r.locationRating,
                hotelResponse: r.hotelResponse,
                createdAt: r.createdAt,
                userName: r.user?.name || "Guest",
            })),
            averageRating: Number(avgResult[0]?.avgRating) || 0,
            totalReviews: avgResult[0]?.count || 0,
        };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
}

/**
 * Check if a booking can be reviewed
 */
export async function canReviewBooking(
    bookingId: string
): Promise<{ canReview: boolean; reason?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { canReview: false, reason: "Not authenticated" };
        }

        const booking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, bookingId),
                eq(bookings.userId, session.user.id)
            ),
        });

        if (!booking) {
            return { canReview: false, reason: "Booking not found" };
        }

        if (booking.status !== "CHECKED_OUT") {
            return { canReview: false, reason: "Not checked out yet" };
        }

        const existingReview = await db.query.reviews.findFirst({
            where: eq(reviews.bookingId, bookingId),
        });

        if (existingReview) {
            return { canReview: false, reason: "Already reviewed" };
        }

        return { canReview: true };
    } catch (error) {
        console.error("Error checking review eligibility:", error);
        return { canReview: false, reason: "Error checking eligibility" };
    }
}
