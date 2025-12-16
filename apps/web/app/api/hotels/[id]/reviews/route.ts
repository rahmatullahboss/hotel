import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { reviews, users, bookings } from "@repo/db/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * GET /api/hotels/[id]/reviews
 * 
 * Get reviews for a specific hotel
 * 
 * Query params:
 * - limit: number of reviews to return (default: 10)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        const hotelReviews = await db.query.reviews.findMany({
            where: and(
                eq(reviews.hotelId, id),
                eq(reviews.isVisible, true)
            ),
            with: {
                user: true,
            },
            orderBy: desc(reviews.createdAt),
            limit,
        });

        // Calculate stats
        const allReviews = await db.query.reviews.findMany({
            where: and(
                eq(reviews.hotelId, id),
                eq(reviews.isVisible, true)
            ),
        });

        const totalReviews = allReviews.length;
        const averageRating = totalReviews > 0
            ? allReviews.reduce((sum: number, r: typeof allReviews[0]) => sum + r.rating, 0) / totalReviews
            : 0;

        // Rating breakdown
        const breakdown = {
            fiveStar: allReviews.filter((r: typeof allReviews[0]) => r.rating === 5).length,
            fourStar: allReviews.filter((r: typeof allReviews[0]) => r.rating === 4).length,
            threeStar: allReviews.filter((r: typeof allReviews[0]) => r.rating === 3).length,
            twoStar: allReviews.filter((r: typeof allReviews[0]) => r.rating === 2).length,
            oneStar: allReviews.filter((r: typeof allReviews[0]) => r.rating === 1).length,
        };

        return NextResponse.json({
            reviews: hotelReviews.map((review: typeof hotelReviews[0]) => ({
                id: review.id,
                rating: review.rating,
                title: review.title,
                content: review.content,
                cleanlinessRating: review.cleanlinessRating,
                serviceRating: review.serviceRating,
                valueRating: review.valueRating,
                locationRating: review.locationRating,
                hotelResponse: review.hotelResponse,
                createdAt: review.createdAt,
                userName: review.user?.name || "Guest",
                userImage: review.user?.image || null,
            })),
            stats: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                breakdown,
            },
        });
    } catch (error) {
        console.error("Error fetching hotel reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}
