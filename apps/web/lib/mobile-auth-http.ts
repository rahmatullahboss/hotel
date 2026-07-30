import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { getMobileAuthConfig } from "./mobile-auth-token";

export type MobileAuthEvent =
    | "login_succeeded"
    | "login_rejected"
    | "registration_succeeded"
    | "registration_rejected"
    | "google_login_succeeded"
    | "google_login_rejected"
    | "logout_succeeded"
    | "logout_rejected"
    | "rate_limited";

export function mobileAuthError(
    code: string,
    message: string,
    status: number,
    retryAfterSeconds?: number,
): NextResponse {
    const response = NextResponse.json(
        {
            code,
            error: message,
            message,
        },
        { status },
    );
    if (retryAfterSeconds && retryAfterSeconds > 0) {
        response.headers.set("Retry-After", String(retryAfterSeconds));
    }
    response.headers.set("Cache-Control", "no-store");
    return response;
}

function hashEventSubject(subject: string | null | undefined): string | null {
    if (!subject) {
        return null;
    }

    try {
        const { secret } = getMobileAuthConfig();
        return createHmac("sha256", secret)
            .update(subject.trim().toLowerCase())
            .digest("hex");
    } catch {
        // Security-event recording must never change the authentication outcome.
        // Token issuance and verification still fail closed through their own config checks.
        return null;
    }
}

export function recordMobileAuthEvent(
    event: MobileAuthEvent,
    details: {
        userId?: string | null;
        subject?: string | null;
        reason?: string;
    } = {},
): void {
    const payload = {
        event,
        userId: details.userId ?? null,
        subjectHash: hashEventSubject(details.subject),
        reason: details.reason ?? null,
    };

    if (
        event === "login_rejected" ||
        event === "registration_rejected" ||
        event === "google_login_rejected" ||
        event === "logout_rejected" ||
        event === "rate_limited"
    ) {
        console.warn("mobile_auth_security_event", payload);
        return;
    }

    console.info("mobile_auth_security_event", payload);
}
