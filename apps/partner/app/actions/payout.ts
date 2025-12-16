"use server";

import { db } from "@repo/db";
import { payoutRequests, hotels, bookings } from "@repo/db/schema";
import { eq, and, ne, desc, sum } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPartnerHotel } from "./dashboard";
import { auth } from "../../auth";

export interface PayoutRequestInput {
    amount: number;
    paymentMethod: "BKASH" | "BANK" | "NAGAD";
    accountNumber: string;
    accountName?: string;
}

/**
 * Get available balance for payout (net earnings - pending payouts)
 */
export async function getAvailableBalance(): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    availableBalance: number;
}> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { totalEarnings: 0, pendingPayouts: 0, availableBalance: 0 };
        }

        // Get total net earnings from completed bookings
        const completedBookings = await db
            .select({ netAmount: bookings.netAmount })
            .from(bookings)
            .where(
                and(
                    eq(bookings.hotelId, hotel.id),
                    eq(bookings.status, "CHECKED_OUT")
                )
            );

        const totalEarnings = completedBookings.reduce(
            (sum: number, b: typeof completedBookings[number]) => sum + Number(b.netAmount || 0),
            0
        );

        // Get pending/processing payouts
        const pendingPayoutRows = await db
            .select({ amount: payoutRequests.amount })
            .from(payoutRequests)
            .where(
                and(
                    eq(payoutRequests.hotelId, hotel.id),
                    ne(payoutRequests.status, "PAID"),
                    ne(payoutRequests.status, "REJECTED")
                )
            );

        const pendingPayouts = pendingPayoutRows.reduce(
            (sum: number, p: typeof pendingPayoutRows[number]) => sum + Number(p.amount || 0),
            0
        );

        // Get already paid payouts
        const paidPayoutRows = await db
            .select({ amount: payoutRequests.amount })
            .from(payoutRequests)
            .where(
                and(
                    eq(payoutRequests.hotelId, hotel.id),
                    eq(payoutRequests.status, "PAID")
                )
            );

        const paidPayouts = paidPayoutRows.reduce(
            (sum: number, p: typeof paidPayoutRows[number]) => sum + Number(p.amount || 0),
            0
        );

        const availableBalance = totalEarnings - paidPayouts - pendingPayouts;

        return {
            totalEarnings,
            pendingPayouts,
            availableBalance: Math.max(0, availableBalance),
        };
    } catch (error) {
        console.error("Error getting available balance:", error);
        return { totalEarnings: 0, pendingPayouts: 0, availableBalance: 0 };
    }
}

/**
 * Request a payout/withdrawal
 */
export async function requestPayout(
    input: PayoutRequestInput
): Promise<{ success: boolean; error?: string; payoutId?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Validate amount
        if (input.amount < 500) {
            return { success: false, error: "Minimum payout amount is ৳500" };
        }

        // Check available balance
        const { availableBalance } = await getAvailableBalance();
        if (input.amount > availableBalance) {
            return {
                success: false,
                error: `Insufficient balance. Available: ৳${availableBalance.toLocaleString()}`,
            };
        }

        // Create payout request
        const [newPayout] = await db
            .insert(payoutRequests)
            .values({
                hotelId: hotel.id,
                requestedBy: session.user.id,
                amount: input.amount.toString(),
                paymentMethod: input.paymentMethod,
                accountNumber: input.accountNumber,
                accountName: input.accountName || null,
            })
            .returning({ id: payoutRequests.id });

        revalidatePath("/earnings");
        return { success: true, payoutId: newPayout?.id };
    } catch (error) {
        console.error("Error requesting payout:", error);
        return { success: false, error: "Failed to request payout" };
    }
}

/**
 * Get payout history for the hotel
 */
export async function getPayoutHistory(): Promise<{
    payouts: Array<{
        id: string;
        amount: number;
        status: string;
        paymentMethod: string;
        accountNumber: string;
        transactionReference: string | null;
        createdAt: Date;
        processedAt: Date | null;
    }>;
}> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { payouts: [] };
        }

        const payouts = await db.query.payoutRequests.findMany({
            where: eq(payoutRequests.hotelId, hotel.id),
            orderBy: desc(payoutRequests.createdAt),
        });

        return {
            payouts: payouts.map((p: typeof payouts[number]) => ({
                id: p.id,
                amount: Number(p.amount),
                status: p.status,
                paymentMethod: p.paymentMethod,
                accountNumber: p.accountNumber,
                transactionReference: p.transactionReference,
                createdAt: p.createdAt,
                processedAt: p.processedAt,
            })),
        };
    } catch (error) {
        console.error("Error fetching payout history:", error);
        return { payouts: [] };
    }
}

/**
 * Cancel a pending payout request
 */
export async function cancelPayoutRequest(
    payoutId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const hotel = await getPartnerHotel();
        if (!hotel) {
            return { success: false, error: "Hotel not found" };
        }

        // Verify payout belongs to this hotel and is pending
        const payout = await db.query.payoutRequests.findFirst({
            where: and(
                eq(payoutRequests.id, payoutId),
                eq(payoutRequests.hotelId, hotel.id),
                eq(payoutRequests.status, "PENDING")
            ),
        });

        if (!payout) {
            return { success: false, error: "Payout not found or cannot be cancelled" };
        }

        // Delete the payout request
        await db.delete(payoutRequests).where(eq(payoutRequests.id, payoutId));

        revalidatePath("/earnings");
        return { success: true };
    } catch (error) {
        console.error("Error cancelling payout:", error);
        return { success: false, error: "Failed to cancel payout" };
    }
}
