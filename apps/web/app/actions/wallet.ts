"use server";

import { auth } from "@/auth";
import { db } from "@repo/db";
import { wallets, walletTransactions, loyaltyPoints } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get or create wallet for current user
 */
export async function getWallet() {
    const session = await auth();
    if (!session?.user?.id) return null;

    let wallet = await db.query.wallets.findFirst({
        where: eq(wallets.userId, session.user.id),
    });

    // Create wallet if doesn't exist
    if (!wallet) {
        const [newWallet] = await db
            .insert(wallets)
            .values({ userId: session.user.id })
            .returning();
        wallet = newWallet!;
    }

    return wallet;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(): Promise<number> {
    const wallet = await getWallet();
    return wallet ? Number(wallet.balance) : 0;
}

/**
 * Get transaction history
 */
export async function getTransactionHistory() {
    const wallet = await getWallet();
    if (!wallet) return [];

    return db.query.walletTransactions.findMany({
        where: eq(walletTransactions.walletId, wallet.id),
        orderBy: (tx, { desc }) => [desc(tx.createdAt)],
        limit: 50,
    });
}

/**
 * Add money to wallet (simulated - in production, integrate with bKash/Nagad)
 */
export async function addMoneyToWallet(
    amount: number
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please login first" };
        }

        if (amount < 50) {
            return { success: false, error: "Minimum top-up is ৳50" };
        }

        const wallet = await getWallet();
        if (!wallet) {
            return { success: false, error: "Wallet not found" };
        }

        // Update balance
        const newBalance = Number(wallet.balance) + amount;
        await db
            .update(wallets)
            .set({ balance: newBalance.toString(), updatedAt: new Date() })
            .where(eq(wallets.id, wallet.id));

        // Record transaction
        await db.insert(walletTransactions).values({
            walletId: wallet.id,
            type: "CREDIT",
            amount: amount.toString(),
            reason: "TOP_UP",
            description: `Added ৳${amount} to wallet`,
        });

        revalidatePath("/wallet");
        return { success: true, newBalance };
    } catch (error) {
        console.error("Error adding money:", error);
        return { success: false, error: "Failed to add money" };
    }
}

/**
 * Deduct booking fee from wallet
 */
export async function deductBookingFee(
    amount: number,
    bookingId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const wallet = await getWallet();
        if (!wallet) {
            return { success: false, error: "Wallet not found" };
        }

        const currentBalance = Number(wallet.balance);
        if (currentBalance < amount) {
            return { success: false, error: "Insufficient wallet balance" };
        }

        // Deduct from wallet
        await db
            .update(wallets)
            .set({
                balance: (currentBalance - amount).toString(),
                updatedAt: new Date(),
            })
            .where(eq(wallets.id, wallet.id));

        // Record transaction
        await db.insert(walletTransactions).values({
            walletId: wallet.id,
            type: "DEBIT",
            amount: amount.toString(),
            reason: "BOOKING_FEE",
            bookingId,
            description: `Booking fee deducted`,
        });

        return { success: true };
    } catch (error) {
        console.error("Error deducting fee:", error);
        return { success: false, error: "Failed to deduct fee" };
    }
}

/**
 * Get or create loyalty points for current user
 */
export async function getLoyaltyPoints() {
    const session = await auth();
    if (!session?.user?.id) return null;

    let loyalty = await db.query.loyaltyPoints.findFirst({
        where: eq(loyaltyPoints.userId, session.user.id),
    });

    if (!loyalty) {
        const [newLoyalty] = await db
            .insert(loyaltyPoints)
            .values({ userId: session.user.id })
            .returning();
        loyalty = newLoyalty!;
    }

    return loyalty;
}

/**
 * Award points for booking completion
 */
export async function awardPoints(
    points: number,
    reason: string
): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) return;

    const loyalty = await getLoyaltyPoints();
    if (!loyalty) return;

    const newPoints = loyalty.points + points;
    const newLifetime = loyalty.lifetimePoints + points;

    // Update tier based on lifetime points
    let newTier = loyalty.tier;
    if (newLifetime >= 10000) newTier = "PLATINUM";
    else if (newLifetime >= 5000) newTier = "GOLD";
    else if (newLifetime >= 1000) newTier = "SILVER";

    await db
        .update(loyaltyPoints)
        .set({
            points: newPoints,
            lifetimePoints: newLifetime,
            tier: newTier,
            updatedAt: new Date(),
        })
        .where(eq(loyaltyPoints.id, loyalty.id));
}
