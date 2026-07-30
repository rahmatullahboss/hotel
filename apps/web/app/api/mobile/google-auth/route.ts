import { db } from "@repo/db";
import { accounts, loyaltyPoints, users, wallets } from "@repo/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
    GoogleTokenVerificationError,
    verifyGoogleIdToken,
} from "@/lib/mobile-google-auth";
import {
    mobileAuthError,
    recordMobileAuthEvent,
} from "@/lib/mobile-auth-http";
import { enforceMobileAuthRateLimit } from "@/lib/mobile-auth-rate-limit";
import { createMobileSession } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

function readIdToken(body: unknown): string | null {
    if (!body || typeof body !== "object") {
        return null;
    }
    const idToken = (body as Record<string, unknown>).idToken;
    return typeof idToken === "string" && idToken ? idToken : null;
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return mobileAuthError("INVALID_REQUEST", "A valid JSON body is required", 400);
    }

    const idToken = readIdToken(body);
    if (!idToken) {
        return mobileAuthError("INVALID_REQUEST", "Google ID token is required", 400);
    }

    try {
        const ipLimit = await enforceMobileAuthRateLimit(request, {
            scope: "mobile-google-ip",
            limit: 10,
            windowSeconds: 15 * 60,
        });
        if (!ipLimit.allowed) {
            recordMobileAuthEvent("rate_limited", { reason: "google_login" });
            return mobileAuthError(
                "RATE_LIMITED",
                "Too many Google login attempts. Try again later.",
                429,
                ipLimit.retryAfterSeconds,
            );
        }

        let googleIdentity;
        try {
            googleIdentity = await verifyGoogleIdToken(idToken);
        } catch (error) {
            if (
                error instanceof GoogleTokenVerificationError &&
                error.kind === "invalid"
            ) {
                recordMobileAuthEvent("google_login_rejected", {
                    reason: "invalid_google_token",
                });
                return mobileAuthError(
                    "INVALID_GOOGLE_TOKEN",
                    "Google authentication failed",
                    401,
                );
            }
            if (
                error instanceof GoogleTokenVerificationError &&
                error.kind === "unavailable"
            ) {
                return mobileAuthError(
                    "GOOGLE_AUTH_UNAVAILABLE",
                    "Google authentication is temporarily unavailable",
                    503,
                );
            }
            throw error;
        }

        const accountLimit = await enforceMobileAuthRateLimit(
            request,
            {
                scope: "mobile-google-account",
                limit: 5,
                windowSeconds: 15 * 60,
            },
            googleIdentity.email,
        );
        if (!accountLimit.allowed) {
            recordMobileAuthEvent("rate_limited", {
                subject: googleIdentity.email,
                reason: "google_account",
            });
            return mobileAuthError(
                "RATE_LIMITED",
                "Too many Google login attempts. Try again later.",
                429,
                accountLimit.retryAfterSeconds,
            );
        }

        const user = await db.transaction(async (tx) => {
            const lockKey = `mobile-google:${googleIdentity.providerAccountId}`;
            await tx.execute(
                sql`select pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`,
            );

            const [linkedAccount] = await tx
                .select({ userId: accounts.userId })
                .from(accounts)
                .where(
                    and(
                        eq(accounts.provider, "google"),
                        eq(
                            accounts.providerAccountId,
                            googleIdentity.providerAccountId,
                        ),
                    ),
                )
                .limit(1);

            if (linkedAccount) {
                const [linkedUser] = await tx
                    .select()
                    .from(users)
                    .where(
                        and(
                            eq(users.id, linkedAccount.userId),
                            isNull(users.deletedAt),
                        ),
                    )
                    .limit(1);
                if (!linkedUser) {
                    throw new Error("Linked Google account has no active user");
                }
                return linkedUser;
            }

            let [matchedUser] = await tx
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.email, googleIdentity.email),
                        isNull(users.deletedAt),
                    ),
                )
                .limit(1);

            if (!matchedUser) {
                [matchedUser] = await tx
                    .insert(users)
                    .values({
                        email: googleIdentity.email,
                        name: googleIdentity.name,
                        image: googleIdentity.picture,
                        emailVerified: new Date(),
                        role: "TRAVELER",
                    })
                    .returning();

                if (!matchedUser) {
                    throw new Error("Google user insert returned no record");
                }

                await tx.insert(wallets).values({ userId: matchedUser.id });
                await tx.insert(loyaltyPoints).values({ userId: matchedUser.id });
            }

            await tx.insert(accounts).values({
                userId: matchedUser.id,
                type: "oauth",
                provider: "google",
                providerAccountId: googleIdentity.providerAccountId,
            });

            return matchedUser;
        });

        if (!user.email) {
            throw new Error("Google-authenticated user has no email");
        }

        const session = await createMobileSession({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        recordMobileAuthEvent("google_login_succeeded", { userId: user.id });
        const response = NextResponse.json({
            success: true,
            token: session.token,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                role: user.role,
            },
        });
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        console.error("Mobile Google authentication failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        recordMobileAuthEvent("google_login_rejected", {
            reason: "internal_failure",
        });
        return mobileAuthError(
            "GOOGLE_AUTH_UNAVAILABLE",
            "Google authentication is temporarily unavailable",
            503,
        );
    }
}
