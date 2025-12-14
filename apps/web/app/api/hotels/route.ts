import { NextRequest, NextResponse } from "next/server";
import { getFeaturedHotels, searchHotels } from "@/app/actions/hotels";

/**
 * GET /api/hotels
 * 
 * Mobile API endpoint to fetch hotels
 * Supports search by city and other filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get("city");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const payAtHotel = searchParams.get("payAtHotel");
        const limit = searchParams.get("limit");

        // If no search params, return featured hotels
        if (!city && !minPrice && !maxPrice && !payAtHotel) {
            const hotels = await getFeaturedHotels(Number(limit) || 20);
            return NextResponse.json(hotels);
        }

        // Search with filters
        const hotels = await searchHotels({
            city: city || undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            payAtHotel: payAtHotel === "true",
        });

        return NextResponse.json(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json(
            { error: "Failed to fetch hotels" },
            { status: 500 }
        );
    }
}
