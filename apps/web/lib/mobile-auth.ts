import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { auth } from "@/auth";

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
export function verifyMobileToken(request: NextRequest): JWTPayload | null {
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
 * Get user ID from either NextAuth session or mobile JWT token
 * Returns userId or null if not authenticated
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
    // First try NextAuth session (for web)
    const session = await auth();
    if (session?.user?.id) {
        return session.user.id;
    }

    // If no session, try JWT token (for mobile)
    const mobileAuth = verifyMobileToken(request);
    if (mobileAuth?.id) {
        return mobileAuth.id;
    }

    return null;
}
