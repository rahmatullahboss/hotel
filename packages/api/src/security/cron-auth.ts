import { timingSafeEqual } from "node:crypto";

export const MINIMUM_CRON_SECRET_LENGTH = 32;

export type CronAuthorizationResult =
    | { ok: true }
    | {
          ok: false;
          status: 401 | 503;
          code: "CRON_UNAUTHORIZED" | "CRON_SECRET_NOT_CONFIGURED";
      };

function constantTimeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, "utf8");
    const rightBuffer = Buffer.from(right, "utf8");

    if (leftBuffer.length !== rightBuffer.length) {
        const padded = Buffer.alloc(leftBuffer.length);
        rightBuffer.copy(padded, 0, 0, Math.min(rightBuffer.length, padded.length));
        timingSafeEqual(leftBuffer, padded);
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Fail-closed cron authentication for every environment.
 * A missing or weak server secret is a service-configuration failure, never an auth bypass.
 */
export function verifyCronAuthorization(
    authorizationHeader: string | null,
    configuredSecret: string | undefined,
): CronAuthorizationResult {
    if (
        !configuredSecret ||
        configuredSecret.length < MINIMUM_CRON_SECRET_LENGTH
    ) {
        return {
            ok: false,
            status: 503,
            code: "CRON_SECRET_NOT_CONFIGURED",
        };
    }

    const expected = `Bearer ${configuredSecret}`;
    if (
        !authorizationHeader ||
        !constantTimeEqual(authorizationHeader, expected)
    ) {
        return {
            ok: false,
            status: 401,
            code: "CRON_UNAUTHORIZED",
        };
    }

    return { ok: true };
}
