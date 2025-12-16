"use server";

import { db } from "@repo/db";
import { reviews, hotels } from "@repo/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPartnerHotel } from "./dashboard";

/**
 * Get all reviews for the partner's hotel
 */
export async function getHotelReviewsForPartner(): Promise<{
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
        hotelRespondedAt: Date | null;
        createdAt: Date;
        guestName: string | null;
    }>;
    averageRating: number;
    totalReviews: number;
}> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { reviews: [], averageRating: 0, totalReviews: 0 };
        }

        const hotelReviews = await db.query.reviews.findMany({
            where: eq(reviews.hotelId, hotel.id),
            orderBy: desc(reviews.createdAt),
            with: {
                user: true,
                booking: true,
            },
        });

        const avgRating =
            hotelReviews.length > 0
                ? hotelReviews.reduce((sum: number, r: typeof hotelReviews[number]) => sum + r.rating, 0) / hotelReviews.length
                : 0;

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
                hotelRespondedAt: r.hotelRespondedAt,
                createdAt: r.createdAt,
                guestName: r.booking?.guestName || r.user?.name || "Guest",
            })),
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: hotelReviews.length,
        };
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return { reviews: [], averageRating: 0, totalReviews: 0 };
    }
}

/**
 * Respond to a review
 */
export async function respondToReview(
    reviewId: string,
    response: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Verify review belongs to this hotel
        const review = await db.query.reviews.findFirst({
            where: and(eq(reviews.id, reviewId), eq(reviews.hotelId, hotel.id)),
        });

        if (!review) {
            return { success: false, error: "Review not found" };
        }

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
        console.error("Error responding to review:", error);
        return { success: false, error: "Failed to respond" };
    }
}
