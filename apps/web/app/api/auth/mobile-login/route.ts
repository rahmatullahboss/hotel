import * as bcrypt from "bcryptjs";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
    mobileAuthError,
    recordMobileAuthEvent,
} from "@/lib/mobile-auth-http";
import { enforceMobileAuthRateLimit } from "@/lib/mobile-auth-rate-limit";
import { createMobileSession } from "@/lib/mobile-auth";

const INVALID_CREDENTIALS = "Invalid email or password";

function readCredentials(body: unknown): { email: string; password: string } | null {
    if (!body || typeof body !== "object") {
        return null;
    }

    const candidate = body as Record<string, unknown>;
    if (typeof candidate.email !== "string" || typeof candidate.password !== "string") {
        return null;
    }

    const email = candidate.email.trim().toLowerCase();
    const password = candidate.password;
    if (!email || email.length > 254 || !password || password.length > 256) {
        return null;
    }

    return { email, password };
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return mobileAuthError("INVALID_REQUEST", "A valid JSON body is required", 400);
    }

    const credentials = readCredentials(body);
    if (!credentials) {
        return mobileAuthError(
            "INVALID_REQUEST",
            "Email and password are required",
            400,
        );
    }

    try {
        const ipLimit = await enforceMobileAuthRateLimit(request, {
            scope: "mobile-login-ip",
            limit: 10,
            windowSeconds: 15 * 60,
        });
        const accountLimit = await enforceMobileAuthRateLimit(
            request,
            {
                scope: "mobile-login-account",
                limit: 5,
                windowSeconds: 15 * 60,
            },
            credentials.email,
        );

        if (!ipLimit.allowed || !accountLimit.allowed) {
            const retryAfterSeconds = Math.max(
                ipLimit.retryAfterSeconds,
                accountLimit.retryAfterSeconds,
            );
            recordMobileAuthEvent("rate_limited", {
                subject: credentials.email,
                reason: "login",
            });
            return mobileAuthError(
                "RATE_LIMITED",
                "Too many login attempts. Try again later.",
                429,
                retryAfterSeconds,
            );
        }

        const user = await db.query.users.findFirst({
            where: and(
                eq(users.email, credentials.email),
                isNull(users.deletedAt),
            ),
        });

        const validPassword =
            user?.passwordHash
                ? await bcrypt.compare(credentials.password, user.passwordHash)
                : false;

        if (!user || !validPassword) {
            recordMobileAuthEvent("login_rejected", {
                subject: credentials.email,
                reason: "invalid_credentials",
            });
            return mobileAuthError("INVALID_CREDENTIALS", INVALID_CREDENTIALS, 401);
        }

        const session = await createMobileSession({
            userId: user.id,
            email: credentials.email,
            name: user.name,
            role: user.role,
        });

        recordMobileAuthEvent("login_succeeded", { userId: user.id });
        const response = NextResponse.json({
            token: session.token,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
        });
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        console.error("Mobile login failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return mobileAuthError("AUTH_UNAVAILABLE", "Authentication is unavailable", 503);
    }
}
