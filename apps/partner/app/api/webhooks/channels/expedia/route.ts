/**
 * Expedia Webhook Handler
 * 
 * Receives real-time booking notifications from Expedia EPS Rapid API.
 * Note: Requires EPS Partner approval.
 */

import { NextRequest, NextResponse } from "next/server";
import { channelManager } from "@repo/api";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        console.log("Received Expedia webhook:", JSON.stringify(payload, null, 2));

        const result = await channelManager.processWebhook("EXPEDIA", payload);

        if (result.success) {
            return NextResponse.json(
                { success: true, bookingId: result.bookingId },
                { status: 200 }
            );
        } else {
            console.error("Webhook processing failed:", result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Expedia webhook error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ status: "ok", channel: "expedia" });
}
