import * as bcrypt from "bcryptjs";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
    mobileAuthError,
    recordMobileAuthEvent,
} from "@/lib/mobile-auth-http";
import { enforceMobileAuthRateLimit } from "@/lib/mobile-auth-rate-limit";
import { createMobileSession } from "@/lib/mobile-auth";

const SALT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegistrationInput {
    name: string;
    email: string;
    phone: string | null;
    password: string;
}

function readRegistration(body: unknown): RegistrationInput | null {
    if (!body || typeof body !== "object") {
        return null;
    }

    const candidate = body as Record<string, unknown>;
    if (
        typeof candidate.name !== "string" ||
        typeof candidate.email !== "string" ||
        typeof candidate.password !== "string"
    ) {
        return null;
    }

    const name = candidate.name.trim();
    const email = candidate.email.trim().toLowerCase();
    const password = candidate.password;
    const phone =
        typeof candidate.phone === "string" && candidate.phone.trim()
            ? candidate.phone.trim()
            : null;

    if (
        name.length < 2 ||
        name.length > 100 ||
        email.length > 254 ||
        !EMAIL_PATTERN.test(email) ||
        password.length < 8 ||
        password.length > 128 ||
        (phone !== null && phone.length > 32)
    ) {
        return null;
    }

    return { name, email, phone, password };
}

function isUniqueViolation(error: unknown): boolean {
    return Boolean(
        error &&
            typeof error === "object" &&
            "code" in error &&
            (error as { code?: unknown }).code === "23505",
    );
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return mobileAuthError("INVALID_REQUEST", "A valid JSON body is required", 400);
    }

    const registration = readRegistration(body);
    if (!registration) {
        return mobileAuthError(
            "INVALID_REGISTRATION",
            "Provide a valid name, email and password of at least 8 characters",
            400,
        );
    }

    try {
        const ipLimit = await enforceMobileAuthRateLimit(request, {
            scope: "mobile-register-ip",
            limit: 5,
            windowSeconds: 60 * 60,
        });
        const accountLimit = await enforceMobileAuthRateLimit(
            request,
            {
                scope: "mobile-register-account",
                limit: 3,
                windowSeconds: 60 * 60,
            },
            registration.email,
        );

        if (!ipLimit.allowed || !accountLimit.allowed) {
            const retryAfterSeconds = Math.max(
                ipLimit.retryAfterSeconds,
                accountLimit.retryAfterSeconds,
            );
            recordMobileAuthEvent("rate_limited", {
                subject: registration.email,
                reason: "registration",
            });
            return mobileAuthError(
                "RATE_LIMITED",
                "Too many registration attempts. Try again later.",
                429,
                retryAfterSeconds,
            );
        }

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, registration.email),
        });
        if (existingUser) {
            recordMobileAuthEvent("registration_rejected", {
                subject: registration.email,
                reason: "account_exists",
            });
            return mobileAuthError(
                "ACCOUNT_EXISTS",
                "An account with this email already exists",
                409,
            );
        }

        const passwordHash = await bcrypt.hash(registration.password, SALT_ROUNDS);
        const [newUser] = await db
            .insert(users)
            .values({
                name: registration.name,
                email: registration.email,
                phone: registration.phone,
                passwordHash,
                role: "TRAVELER",
            })
            .returning();

        if (!newUser) {
            throw new Error("User insert returned no record");
        }

        const session = await createMobileSession({
            userId: newUser.id,
            email: registration.email,
            name: newUser.name,
            role: newUser.role,
        });

        recordMobileAuthEvent("registration_succeeded", { userId: newUser.id });
        const response = NextResponse.json(
            {
                message: "Account created successfully",
                token: session.token,
                expiresAt: session.expiresAt,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
            { status: 201 },
        );
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        if (isUniqueViolation(error)) {
            recordMobileAuthEvent("registration_rejected", {
                subject: registration.email,
                reason: "account_exists_race",
            });
            return mobileAuthError(
                "ACCOUNT_EXISTS",
                "An account with this email already exists",
                409,
            );
        }

        console.error("Mobile registration failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return mobileAuthError("AUTH_UNAVAILABLE", "Registration is unavailable", 503);
    }
}
