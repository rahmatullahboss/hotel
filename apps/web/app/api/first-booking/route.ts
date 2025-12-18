import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { checkFirstBookingEligibility, calculateFirstBookingDiscount } from "@/app/actions/first-booking";

/**
 * GET /api/first-booking/check
 * Check if the current user is eligible for first booking offer
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { eligible: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        const eligibility = await checkFirstBookingEligibility(userId);

        return NextResponse.json(eligibility);
    } catch (error) {
        console.error("Error checking first booking eligibility:", error);
        return NextResponse.json(
            { eligible: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/first-booking/check
 * Calculate discount for a specific amount
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { eligible: false, discount: 0, message: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { amount } = body;

        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { eligible: false, discount: 0, message: "Invalid amount" },
                { status: 400 }
            );
        }

        const result = await calculateFirstBookingDiscount(userId, amount);

        return NextResponse.json({
            eligible: result.eligible,
            discount: result.discount,
            discountPercent: result.eligible ? 20 : 0,
            finalAmount: amount - result.discount,
        });
    } catch (error) {
        console.error("Error calculating first booking discount:", error);
        return NextResponse.json(
            { eligible: false, discount: 0, message: "Internal server error" },
            { status: 500 }
        );
    }
}
