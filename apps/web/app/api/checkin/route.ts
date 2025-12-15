import { NextRequest, NextResponse } from "next/server";
import { customerSelfCheckIn, customerSelfCheckOut } from "../../actions/checkin";
import { auth } from "@/auth";

/**
 * POST /api/checkin
 * Mobile app endpoint for self check-in/check-out
 * Body: { hotelId: string, action: "checkin" | "checkout" }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { hotelId, action } = body;

        if (!hotelId) {
            return NextResponse.json(
                { success: false, error: "Hotel ID is required" },
                { status: 400 }
            );
        }

        if (!action || !["checkin", "checkout"].includes(action)) {
            return NextResponse.json(
                { success: false, error: "Invalid action. Must be 'checkin' or 'checkout'" },
                { status: 400 }
            );
        }

        const userId = session.user.id;

        if (action === "checkin") {
            const result = await customerSelfCheckIn(hotelId, userId);
            return NextResponse.json(result, { status: result.success ? 200 : 400 });
        } else {
            const result = await customerSelfCheckOut(hotelId, userId);
            return NextResponse.json(result, { status: result.success ? 200 : 400 });
        }
    } catch (error) {
        console.error("Check-in API error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
