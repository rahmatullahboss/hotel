import { NextRequest, NextResponse } from "next/server";
import { collectRemainingPayment } from "../../actions/dashboard";

export async function POST(request: NextRequest) {
    try {
        const { bookingId, hotelId } = await request.json();

        if (!bookingId || !hotelId) {
            return NextResponse.json(
                { success: false, error: "Missing bookingId or hotelId" },
                { status: 400 }
            );
        }

        const result = await collectRemainingPayment(bookingId, hotelId);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in collect-payment API:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
