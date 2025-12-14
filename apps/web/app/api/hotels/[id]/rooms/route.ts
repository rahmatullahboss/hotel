import { NextRequest, NextResponse } from "next/server";
import { getRoomsWithAvailability } from "@/app/actions/hotels";

/**
 * GET /api/hotels/[id]/rooms
 * 
 * Mobile API endpoint to fetch rooms for a hotel with availability
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: hotelId } = await params;
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");

        // Default to today + tomorrow if no dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const rooms = await getRoomsWithAvailability(
            hotelId,
            checkIn || today.toISOString().split("T")[0]!,
            checkOut || tomorrow.toISOString().split("T")[0]!
        );

        return NextResponse.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}
