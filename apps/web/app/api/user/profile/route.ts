import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.AUTH_SECRET || "your-secret-key";

interface JWTPayload {
    id: string;
    email: string;
    name: string;
    role: string;
}

/**
 * Verify JWT token from mobile clients
 */
function verifyMobileToken(request: NextRequest): JWTPayload | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}

/**
 * GET /api/user/profile
 * 
 * Mobile API endpoint to fetch user profile
 * Supports both NextAuth sessions and JWT tokens
 */
export async function GET(request: NextRequest) {
    try {
        let userId: string | null = null;

        // First try NextAuth session (for web)
        const session = await auth();
        if (session?.user?.id) {
            userId = session.user.id;
        }

        // If no session, try JWT token (for mobile)
        if (!userId) {
            const mobileAuth = verifyMobileToken(request);
            if (mobileAuth?.id) {
                userId = mobileAuth.id;
            }
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
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
        let userId: string | null = null;

        // First try NextAuth session (for web)
        const session = await auth();
        if (session?.user?.id) {
            userId = session.user.id;
        }

        // If no session, try JWT token (for mobile)
        if (!userId) {
            const mobileAuth = verifyMobileToken(request);
            if (mobileAuth?.id) {
                userId = mobileAuth.id;
            }
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, phone } = body;

        // Update user
        await db
            .update(users)
            .set({
                ...(name && { name }),
                ...(phone && { phone }),
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
