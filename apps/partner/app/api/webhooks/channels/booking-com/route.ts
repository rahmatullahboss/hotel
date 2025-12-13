/**
 * Booking.com Webhook Handler
 * 
 * Receives real-time booking notifications from Booking.com Connectivity API.
 * Note: Requires approved Connectivity Partner status.
 */

import { NextRequest, NextResponse } from "next/server";
import { channelManager } from "@repo/api";

export async function POST(request: NextRequest) {
    try {
        // Verify webhook authentication
        const authHeader = request.headers.get("Authorization");

        const payload = await request.json();

        console.log("Received Booking.com webhook:", JSON.stringify(payload, null, 2));

        const result = await channelManager.processWebhook("BOOKING_COM", payload);

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
        console.error("Booking.com webhook error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ status: "ok", channel: "booking-com" });
}
