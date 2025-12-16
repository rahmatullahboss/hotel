import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { reviews, bookings, hotels } from "@repo/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

/**
 * GET /api/reviews
 * 
 * Get current user's reviews
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const userReviews = await db.query.reviews.findMany({
            where: eq(reviews.userId, userId),
            with: {
                hotel: true,
            },
            orderBy: desc(reviews.createdAt),
        });

        return NextResponse.json(userReviews.map((review: typeof userReviews[0]) => ({
            id: review.id,
            rating: review.rating,
            title: review.title,
            content: review.content,
            hotelName: review.hotel?.name || "Unknown Hotel",
            hotelImage: review.hotel?.coverImage || null,
            createdAt: review.createdAt,
        })));
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reviews
 * 
 * Submit a new review for a completed booking
 * 
 * Body: {
 *   bookingId: string,
 *   rating: number (1-5),
 *   title?: string,
 *   content?: string,
 *   cleanlinessRating?: number (1-5),
 *   serviceRating?: number (1-5),
 *   valueRating?: number (1-5),
 *   locationRating?: number (1-5)
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            bookingId,
            rating,
            title,
            content,
            cleanlinessRating,
            serviceRating,
            valueRating,
            locationRating,
        } = body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be between 1 and 5" },
                { status: 400 }
            );
        }

        // Verify booking exists and belongs to user
        const booking = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, bookingId),
                eq(bookings.userId, userId)
            ),
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Check if booking is completed
        if (!["COMPLETED", "CHECKED_OUT"].includes(booking.status)) {
            return NextResponse.json(
                { error: "Can only review completed stays" },
                { status: 400 }
            );
        }

        // Check if already reviewed
        const existingReview = await db.query.reviews.findFirst({
            where: eq(reviews.bookingId, bookingId),
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this booking" },
                { status: 400 }
            );
        }

        // Create review
        const [newReview] = await db.insert(reviews).values({
            bookingId,
            hotelId: booking.hotelId,
            userId,
            rating,
            title: title || null,
            content: content || null,
            cleanlinessRating: cleanlinessRating || null,
            serviceRating: serviceRating || null,
            valueRating: valueRating || null,
            locationRating: locationRating || null,
        }).returning();

        // Update hotel's average rating
        const hotelReviews = await db.query.reviews.findMany({
            where: eq(reviews.hotelId, booking.hotelId),
        });

        const avgRating = hotelReviews.reduce((sum: number, r: typeof hotelReviews[0]) => sum + r.rating, 0) / hotelReviews.length;

        await db.update(hotels)
            .set({
                rating: avgRating.toString(),
                reviewCount: hotelReviews.length,
            })
            .where(eq(hotels.id, booking.hotelId));

        return NextResponse.json({
            success: true,
            reviewId: newReview.id,
            message: "Thank you for your review!",
        });
    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json(
            { error: "Failed to submit review" },
            { status: 500 }
        );
    }
}
