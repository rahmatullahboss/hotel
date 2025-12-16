import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { wallets, walletTransactions, loyaltyPoints } from "@repo/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create wallet
        let wallet = await db.query.wallets.findFirst({
            where: eq(wallets.userId, userId),
        });

        if (!wallet) {
            const [newWallet] = await db
                .insert(wallets)
                .values({ userId })
                .returning();
            wallet = newWallet!;
        }

        // Get transactions
        const transactions = await db.query.walletTransactions.findMany({
            where: eq(walletTransactions.walletId, wallet.id),
            orderBy: [desc(walletTransactions.createdAt)],
            limit: 20,
        });

        // Get or create loyalty points
        let loyalty = await db.query.loyaltyPoints.findFirst({
            where: eq(loyaltyPoints.userId, userId),
        });

        if (!loyalty) {
            const [newLoyalty] = await db
                .insert(loyaltyPoints)
                .values({ userId })
                .returning();
            loyalty = newLoyalty!;
        }

        return NextResponse.json({
            balance: Number(wallet.balance),
            loyalty: {
                points: loyalty.points,
                lifetimePoints: loyalty.lifetimePoints,
                tier: loyalty.tier,
            },
            transactions: transactions.map((tx: typeof transactions[number]) => ({
                id: tx.id,
                type: tx.type,
                amount: Number(tx.amount),
                reason: tx.reason,
                description: tx.description,
                createdAt: tx.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error getting wallet:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
