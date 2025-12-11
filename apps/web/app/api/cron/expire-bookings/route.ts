import { NextRequest, NextResponse } from "next/server";
import { cancelExpiredBookings } from "../../../actions/expire-bookings";

/**
 * Cron job endpoint to cancel expired bookings
 * 
 * This endpoint should be called every 5 minutes by Vercel Cron or similar service.
 * 
 * Security: Verify the request is from Vercel Cron using CRON_SECRET
 */
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (for security in production)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        // In production, require authorization
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await cancelExpiredBookings();

        return NextResponse.json({
            success: result.success,
            cancelledCount: result.cancelledCount,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal error"
            },
            { status: 500 }
        );
    }
}
