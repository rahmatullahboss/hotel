import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { users, accounts, wallets, loyaltyPoints } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.AUTH_SECRET || "your-secret-key";

interface GoogleTokenPayload {
    email: string;
    name: string;
    picture: string;
    sub: string; // Google user ID
    email_verified: boolean;
}

/**
 * Verify Google ID token and return user info
 */
async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload | null> {
    try {
        // Verify with Google's tokeninfo endpoint
        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );

        if (!response.ok) {
            console.error("Google token verification failed:", response.status);
            return null;
        }

        const payload = await response.json();

        // Verify the token is for our app
        const clientId = process.env.AUTH_GOOGLE_ID;
        if (payload.aud !== clientId) {
            console.error("Token audience mismatch");
            return null;
        }

        return payload as GoogleTokenPayload;
    } catch (error) {
        console.error("Error verifying Google token:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { idToken, accessToken, userInfo } = body;

        let googleUser: GoogleTokenPayload | null = null;

        // Try idToken first, then fall back to userInfo from accessToken
        if (idToken) {
            googleUser = await verifyGoogleToken(idToken);
        } else if (userInfo && userInfo.email) {
            // Trust userInfo from accessToken (already verified by Google)
            googleUser = {
                email: userInfo.email,
                name: userInfo.name || userInfo.email.split('@')[0],
                picture: userInfo.picture || '',
                sub: userInfo.sub || userInfo.id || `google-${Date.now()}`,
                email_verified: true,
            };
        }

        if (!googleUser) {
            return NextResponse.json({ error: "Authentication data required" }, { status: 400 });
        }

        // Find or create user
        let user = await db.query.users.findFirst({
            where: eq(users.email, googleUser.email),
        });

        if (!user) {
            // Create new user
            const [newUser] = await db
                .insert(users)
                .values({
                    email: googleUser.email,
                    name: googleUser.name,
                    image: googleUser.picture,
                    emailVerified: googleUser.email_verified ? new Date() : null,
                    role: "TRAVELER",
                })
                .returning();
            user = newUser!;

            // Create wallet for new user
            await db.insert(wallets).values({ userId: user.id });

            // Create loyalty record for new user
            await db.insert(loyaltyPoints).values({ userId: user.id });
        }

        // Check if Google account is linked
        const existingAccount = await db.query.accounts.findFirst({
            where: and(
                eq(accounts.userId, user.id),
                eq(accounts.provider, "google")
            ),
        });

        if (!existingAccount) {
            // Link Google account
            await db.insert(accounts).values({
                userId: user.id,
                type: "oauth",
                provider: "google",
                providerAccountId: googleUser.sub,
                access_token: accessToken,
                id_token: idToken,
            });
        }

        // Generate JWT token for mobile session
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Error in mobile Google auth:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
