import { NextResponse } from "next/server";
import { syncCityHotelCounts } from "@/app/actions/cities";

/**
 * POST /api/admin/sync-city-counts
 * 
 * Syncs hotel counts for all cities in the database
 */
export async function POST() {
    try {
        const result = await syncCityHotelCounts();
        return NextResponse.json({
            success: true,
            message: `Updated ${result.updated} cities`,
            ...result
        });
    } catch (error) {
        console.error("Error syncing city hotel counts:", error);
        return NextResponse.json(
            { error: "Failed to sync city hotel counts" },
            { status: 500 }
        );
    }
}

// Also allow GET for easy testing
export async function GET() {
    return POST();
}
