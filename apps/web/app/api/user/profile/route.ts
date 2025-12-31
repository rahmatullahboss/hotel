import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { users, bookings } from "@repo/db/schema";
import { eq, count } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

/**
 * GET /api/user/profile
 * 
 * Mobile API endpoint to fetch user profile
 * Supports both NextAuth sessions and JWT tokens
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

        // Fetch user with wallet and loyalty data
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                walletBalance: true,
                loyaltyPoints: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Calculate total bookings count
        const [bookingsResult] = await db
            .select({ totalBookings: count() })
            .from(bookings)
            .where(eq(bookings.userId, userId));

        return NextResponse.json({
            ...user,
            avatarUrl: user.image, // Map image to avatarUrl for mobile app
            totalBookings: bookingsResult?.totalBookings ?? 0,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/user/profile
 * 
 * Mobile API endpoint to update user profile
 * Supports both NextAuth sessions and JWT tokens
 */
export async function PATCH(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone, image } = body;

        // Update user
        await db
            .update(users)
            .set({
                ...(name && { name }),
                ...(phone && { phone }),
                ...(image !== undefined && { image }), // Allow setting to null or new value
            })
            .where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
