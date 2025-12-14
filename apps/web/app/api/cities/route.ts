import { NextResponse } from "next/server";
import { getCities, getPopularCities } from "@/app/actions/cities";

/**
 * GET /api/cities
 * 
 * Mobile API endpoint to fetch cities
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const popularOnly = searchParams.get("popular") === "true";
        const limit = searchParams.get("limit");

        if (popularOnly) {
            const cities = await getPopularCities(Number(limit) || 8);
            return NextResponse.json(cities);
        }

        const cities = await getCities();
        return NextResponse.json(cities);
    } catch (error) {
        console.error("Error fetching cities:", error);
        return NextResponse.json(
            { error: "Failed to fetch cities" },
            { status: 500 }
        );
    }
}
