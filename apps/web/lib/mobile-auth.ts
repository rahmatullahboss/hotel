import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { db } from "@repo/db";
import { sessions, users } from "@repo/db/schema";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { auth } from "@/auth";
import {
    getMobileAuthConfig,
    signMobileAccessToken,
    verifyMobileAccessToken,
    type MobileTokenSubject,
    type VerifiedMobileToken,
} from "./mobile-auth-token";

export interface CreatedMobileSession {
    token: string;
    expiresAt: string;
}

export function extractBearerToken(request: Request): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        return null;
    }

    const match = /^Bearer\s+([^\s]+)$/i.exec(authHeader.trim());
    return match?.[1] ?? null;
}

export async function createMobileSession(
    subject: MobileTokenSubject,
): Promise<CreatedMobileSession> {
    const config = getMobileAuthConfig();
    const sessionId = randomUUID();
    const expires = new Date(Date.now() + config.ttlSeconds * 1000);

    await db.transaction(async (tx) => {
        await tx
            .delete(sessions)
            .where(and(eq(sessions.userId, subject.userId), lt(sessions.expires, new Date())));

        await tx.insert(sessions).values({
            sessionToken: sessionId,
            userId: subject.userId,
            expires,
        });
    });

    return {
        token: signMobileAccessToken(subject, sessionId, config),
        expiresAt: expires.toISOString(),
    };
}

export async function verifyMobileToken(
    request: Request,
): Promise<VerifiedMobileToken | null> {
    const token = extractBearerToken(request);
    if (!token) {
        return null;
    }

    try {
        const claims = verifyMobileAccessToken(token);
        const [activeSession] = await db
            .select({ sessionId: sessions.sessionToken })
            .from(sessions)
            .innerJoin(users, eq(users.id, sessions.userId))
            .where(
                and(
                    eq(sessions.sessionToken, claims.sessionId),
                    eq(sessions.userId, claims.userId),
                    gt(sessions.expires, new Date()),
                    isNull(users.deletedAt),
                ),
            )
            .limit(1);

        return activeSession ? claims : null;
    } catch (error) {
        console.warn("Mobile access token rejected", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return null;
    }
}

export async function revokeMobileSession(request: Request): Promise<boolean> {
    const token = extractBearerToken(request);
    if (!token) {
        return false;
    }

    try {
        const claims = verifyMobileAccessToken(token);
        const revoked = await db
            .delete(sessions)
            .where(
                and(
                    eq(sessions.sessionToken, claims.sessionId),
                    eq(sessions.userId, claims.userId),
                ),
            )
            .returning({ sessionId: sessions.sessionToken });
        return revoked.length > 0;
    } catch {
        return false;
    }
}

/**
 * Get a user ID from either an Auth.js browser session or a revocable mobile JWT session.
 */
export async function getUserIdFromRequest(
    request: NextRequest,
): Promise<string | null> {
    const session = await auth();
    if (session?.user?.id) {
        return session.user.id;
    }

    const mobileAuth = await verifyMobileToken(request);
    return mobileAuth?.userId ?? null;
}
