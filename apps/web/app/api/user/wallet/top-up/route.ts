import { NextRequest, NextResponse } from "next/server";
import { createBkashPayment } from "@repo/config/payment";
import { getUserIdFromRequest } from "@/lib/mobile-auth";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { amount } = body;

        if (!amount || typeof amount !== "number" || amount < 10) {
            return NextResponse.json(
                { success: false, error: "Invalid amount. Minimum top-up is 10 BDT." },
                { status: 400 }
            );
        }

        // Get user details for payment initiation
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Generate a unique invoice ID for wallet top-up
        // Format: WALLET-{userId}-{timestamp}
        // Format: WALLET-{userId}-{timestamp} (Safe: < 60 chars, bKash limit 128)
        const timestamp = Date.now();
        const invoiceId = `WALLET-${userId}-${timestamp}`;

        // Create bKash payment
        const result = await createBkashPayment({
            bookingId: invoiceId, // Using invoice ID as bookingId for payment system compatibility
            totalAmount: amount,
            customerName: user.name || "Valued Customer",
            customerEmail: user.email || undefined,
            customerPhone: user.phone || "01700000000", // Fallback if phone is missing
            productName: "Wallet Top Up",
        });

        if (result.success && result.bkashURL) {
            return NextResponse.json({
                success: true,
                redirectUrl: result.bkashURL,
                paymentID: result.paymentID,
            });
        }

        return NextResponse.json(
            { success: false, error: result.error || "Failed to initiate payment" },
            { status: 500 }
        );
    } catch (error) {
        console.error("Wallet top-up error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
