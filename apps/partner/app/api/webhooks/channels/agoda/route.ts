/**
 * Agoda Webhook Handler
 * 
 * Receives real-time booking notifications from Agoda YCS.
 * Reference: https://agodaconnectivity.com/docs/webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import { channelManager } from "@repo/api";

// Agoda sends webhooks as POST requests
export async function POST(request: NextRequest) {
    try {
        // Verify webhook signature (in production)
        const signature = request.headers.get("X-Agoda-Signature");

        // Get the raw payload
        const payload = await request.json();

        console.log("Received Agoda webhook:", JSON.stringify(payload, null, 2));

        // Process the webhook
        const result = await channelManager.processWebhook("AGODA", payload);

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
        console.error("Agoda webhook error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Agoda might send a GET for verification
export async function GET(request: NextRequest) {
    // Return 200 for health check
    return NextResponse.json({ status: "ok", channel: "agoda" });
}
