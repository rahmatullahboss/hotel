"use server";

import { db } from "@repo/db";
import { payoutRequests, hotels, users } from "@repo/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "../../auth";

export interface PayoutWithDetails {
    id: string;
    hotelId: string;
    hotelName: string;
    requestedBy: string;
    requesterName: string | null;
    amount: number;
    status: string;
    paymentMethod: string;
    accountNumber: string;
    accountName: string | null;
    transactionReference: string | null;
    rejectionReason: string | null;
    createdAt: Date;
    processedAt: Date | null;
}

/**
 * Get all payout requests for admin
 */
export async function getAllPayoutRequests(): Promise<PayoutWithDetails[]> {
    try {
        const payouts = await db.query.payoutRequests.findMany({
            orderBy: desc(payoutRequests.createdAt),
            with: {
                hotel: true,
                requester: true,
            },
        });

        return payouts.map((p) => ({
            id: p.id,
            hotelId: p.hotelId,
            hotelName: p.hotel?.name || "Unknown",
            requestedBy: p.requestedBy,
            requesterName: p.requester?.name || null,
            amount: Number(p.amount),
            status: p.status,
            paymentMethod: p.paymentMethod,
            accountNumber: p.accountNumber,
            accountName: p.accountName,
            transactionReference: p.transactionReference,
            rejectionReason: p.rejectionReason,
            createdAt: p.createdAt,
            processedAt: p.processedAt,
        }));
    } catch (error) {
        console.error("Error fetching payout requests:", error);
        return [];
    }
}

/**
 * Approve a payout request
 */
export async function approvePayout(
    payoutId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const payout = await db.query.payoutRequests.findFirst({
            where: eq(payoutRequests.id, payoutId),
        });

        if (!payout) {
            return { success: false, error: "Payout not found" };
        }

        if (payout.status !== "PENDING") {
            return { success: false, error: "Payout is not pending" };
        }

        await db
            .update(payoutRequests)
            .set({
                status: "APPROVED",
                processedBy: session.user.id,
                processedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(payoutRequests.id, payoutId));

        revalidatePath("/payouts");
        return { success: true };
    } catch (error) {
        console.error("Error approving payout:", error);
        return { success: false, error: "Failed to approve payout" };
    }
}

/**
 * Reject a payout request
 */
export async function rejectPayout(
    payoutId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const payout = await db.query.payoutRequests.findFirst({
            where: eq(payoutRequests.id, payoutId),
        });

        if (!payout) {
            return { success: false, error: "Payout not found" };
        }

        if (payout.status !== "PENDING" && payout.status !== "APPROVED") {
            return { success: false, error: "Payout cannot be rejected" };
        }

        await db
            .update(payoutRequests)
            .set({
                status: "REJECTED",
                rejectionReason: reason,
                processedBy: session.user.id,
                processedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(payoutRequests.id, payoutId));

        revalidatePath("/payouts");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting payout:", error);
        return { success: false, error: "Failed to reject payout" };
    }
}

/**
 * Mark a payout as paid (after manual transfer)
 */
export async function markPayoutAsPaid(
    payoutId: string,
    transactionReference: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const payout = await db.query.payoutRequests.findFirst({
            where: eq(payoutRequests.id, payoutId),
        });

        if (!payout) {
            return { success: false, error: "Payout not found" };
        }

        if (payout.status !== "APPROVED" && payout.status !== "PROCESSING") {
            return { success: false, error: "Payout must be approved first" };
        }

        await db
            .update(payoutRequests)
            .set({
                status: "PAID",
                transactionReference,
                processedBy: session.user.id,
                processedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(payoutRequests.id, payoutId));

        revalidatePath("/payouts");
        return { success: true };
    } catch (error) {
        console.error("Error marking payout as paid:", error);
        return { success: false, error: "Failed to mark payout as paid" };
    }
}
