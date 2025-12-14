import { NextRequest, NextResponse } from "next/server";
import { getHotelById } from "@/app/actions/hotels";

/**
 * GET /api/hotels/[id]
 * 
 * Mobile API endpoint to fetch a single hotel by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const hotel = await getHotelById(id);

        if (!hotel) {
            return NextResponse.json(
                { error: "Hotel not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(hotel);
    } catch (error) {
        console.error("Error fetching hotel:", error);
        return NextResponse.json(
            { error: "Failed to fetch hotel" },
            { status: 500 }
        );
    }
}
