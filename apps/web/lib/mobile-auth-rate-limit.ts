import { createHmac, randomUUID } from "node:crypto";
import { db } from "@repo/db";
import { verificationTokens } from "@repo/db/schema";
import { and, count, eq, gt, lte, sql } from "drizzle-orm";
import { getMobileAuthConfig } from "./mobile-auth-token";

export interface MobileAuthRateLimitPolicy {
    scope: string;
    limit: number;
    windowSeconds: number;
}

export interface MobileAuthRateLimitResult {
    allowed: boolean;
    retryAfterSeconds: number;
}

export function getRequestClientAddress(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = request.headers.get("x-real-ip")?.trim();
    return forwarded || realIp || "unknown";
}

export function createRateLimitIdentifier(
    scope: string,
    clientAddress: string,
    subject: string | null,
    secret: string,
): string {
    const digest = createHmac("sha256", secret)
        .update(`${scope}\u0000${clientAddress}\u0000${subject ?? ""}`)
        .digest("hex");
    return `mobile-auth-rate:${scope}:${digest}`;
}

export async function enforceMobileAuthRateLimit(
    request: Request,
    policy: MobileAuthRateLimitPolicy,
    subject: string | null = null,
): Promise<MobileAuthRateLimitResult> {
    if (!Number.isSafeInteger(policy.limit) || policy.limit < 1) {
        throw new Error("Mobile auth rate-limit policy requires a positive integer limit");
    }
    if (!Number.isSafeInteger(policy.windowSeconds) || policy.windowSeconds < 1) {
        throw new Error("Mobile auth rate-limit policy requires a positive integer window");
    }

    const config = getMobileAuthConfig();
    const identifier = createRateLimitIdentifier(
        policy.scope,
        getRequestClientAddress(request),
        subject,
        config.secret,
    );
    const now = new Date();
    const expires = new Date(now.getTime() + policy.windowSeconds * 1000);

    return db.transaction(async (tx: typeof db) => {
        await tx.execute(
            sql`select pg_advisory_xact_lock(hashtextextended(${identifier}, 0))`,
        );

        await tx
            .delete(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, identifier),
                    lte(verificationTokens.expires, now),
                ),
            );

        const [active] = await tx
            .select({ value: count() })
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, identifier),
                    gt(verificationTokens.expires, now),
                ),
            );

        if (Number(active?.value ?? 0) >= policy.limit) {
            return {
                allowed: false,
                retryAfterSeconds: policy.windowSeconds,
            };
        }

        await tx.insert(verificationTokens).values({
            identifier,
            token: randomUUID(),
            expires,
        });

        return {
            allowed: true,
            retryAfterSeconds: 0,
        };
    });
}
