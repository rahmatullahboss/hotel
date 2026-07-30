import { NextResponse } from "next/server";
import {
    mobileAuthError,
    recordMobileAuthEvent,
} from "@/lib/mobile-auth-http";
import { revokeMobileSession } from "@/lib/mobile-auth";

export async function POST(request: Request) {
    try {
        const revoked = await revokeMobileSession(request);
        if (!revoked) {
            recordMobileAuthEvent("logout_rejected", {
                reason: "invalid_or_revoked_session",
            });
            return mobileAuthError(
                "INVALID_SESSION",
                "The mobile session is invalid or already expired",
                401,
            );
        }

        recordMobileAuthEvent("logout_succeeded");
        const response = NextResponse.json({ success: true });
        response.headers.set("Cache-Control", "no-store");
        return response;
    } catch (error) {
        console.error("Mobile logout failed", {
            reason: error instanceof Error ? error.name : "UnknownError",
        });
        return mobileAuthError("AUTH_UNAVAILABLE", "Logout is unavailable", 503);
    }
}
