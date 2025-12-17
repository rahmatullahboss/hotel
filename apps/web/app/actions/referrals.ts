"use server";

import { db } from "@repo/db";
import {
    referralCodes,
    referrals,
    wallets,
    walletTransactions,
} from "@repo/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

// ====================
// REFERRAL ACTIONS
// ====================

/**
 * Generate a unique referral code for a user
 */
function generateReferralCode(userName: string): string {
    // Use first part of name + random alphanumeric
    const namePart = (userName || "ZINO")
        .split(" ")[0]
        ?.toUpperCase()
        .slice(0, 4) || "ZINO";
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${namePart}-${randomPart}`;
}

/**
 * Get or create a referral code for the current user
 */
export async function getOrCreateReferralCode() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Check if user already has a code
        const existingCode = await db.query.referralCodes.findFirst({
            where: and(
                eq(referralCodes.userId, session.user.id),
                eq(referralCodes.isActive, true)
            ),
        });

        if (existingCode) {
            return {
                success: true,
                code: existingCode.code,
                usageCount: existingCode.usageCount,
            };
        }

        // Generate new code
        let code = generateReferralCode(session.user.name || "");
        let attempts = 0;

        // Ensure uniqueness
        while (attempts < 5) {
            const existing = await db.query.referralCodes.findFirst({
                where: eq(referralCodes.code, code),
            });
            if (!existing) break;
            code = generateReferralCode(session.user.name || "");
            attempts++;
        }

        // Create the code
        const [newCode] = await db
            .insert(referralCodes)
            .values({
                userId: session.user.id,
                code,
            })
            .returning();

        return {
            success: true,
            code: newCode?.code || code,
            usageCount: 0,
        };
    } catch (error) {
        console.error("Error creating referral code:", error);
        return { success: false, error: "Failed to create referral code" };
    }
}

/**
 * Get referral statistics for the current user
 */
export async function getReferralStats() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    try {
        // Get user's referral code
        const userCode = await db.query.referralCodes.findFirst({
            where: and(
                eq(referralCodes.userId, session.user.id),
                eq(referralCodes.isActive, true)
            ),
        });

        if (!userCode) {
            return {
                code: null,
                totalReferrals: 0,
                pendingReferrals: 0,
                completedReferrals: 0,
                totalEarned: 0,
                referralHistory: [],
            };
        }

        // Get all referrals for this code
        const userReferrals = await db.query.referrals.findMany({
            where: eq(referrals.referrerCodeId, userCode.id),
            with: {
                referredUser: {
                    columns: { id: true, name: true, image: true },
                },
            },
            orderBy: [desc(referrals.createdAt)],
        });

        const pendingCount = userReferrals.filter((r: typeof userReferrals[number]) => r.status === "PENDING").length;
        const completedCount = userReferrals.filter((r: typeof userReferrals[number]) => r.status === "COMPLETED").length;
        const totalEarned = userReferrals
            .filter((r: typeof userReferrals[number]) => r.status === "COMPLETED")
            .reduce((sum: number, r: typeof userReferrals[number]) => sum + Number(r.referrerReward || 0), 0);

        return {
            code: userCode.code,
            totalReferrals: userReferrals.length,
            pendingReferrals: pendingCount,
            completedReferrals: completedCount,
            totalEarned,
            referralHistory: userReferrals.map((r: typeof userReferrals[number]) => ({
                id: r.id,
                referredUserName: r.referredUser?.name || "Anonymous",
                referredUserImage: r.referredUser?.image,
                status: r.status,
                reward: Number(r.referrerReward || 0),
                createdAt: r.createdAt,
                completedAt: r.completedAt,
            })),
        };
    } catch (error) {
        console.error("Error getting referral stats:", error);
        return null;
    }
}

/**
 * Apply a referral code during signup or first booking
 */
export async function applyReferralCode(code: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Find the referral code
        const referralCode = await db.query.referralCodes.findFirst({
            where: and(
                eq(referralCodes.code, code.toUpperCase()),
                eq(referralCodes.isActive, true)
            ),
        });

        if (!referralCode) {
            return { success: false, error: "Invalid referral code" };
        }

        // Check if user is trying to use their own code
        if (referralCode.userId === session.user.id) {
            return { success: false, error: "You cannot use your own referral code" };
        }

        // Check if user has already used a referral code
        const existingReferral = await db.query.referrals.findFirst({
            where: eq(referrals.referredUserId, session.user.id),
        });

        if (existingReferral) {
            return { success: false, error: "You have already used a referral code" };
        }

        // Check max uses
        if (
            referralCode.maxUses &&
            referralCode.usageCount >= referralCode.maxUses
        ) {
            return { success: false, error: "This referral code has reached its limit" };
        }

        // Create the pending referral
        await db.insert(referrals).values({
            referrerCodeId: referralCode.id,
            referredUserId: session.user.id,
            status: "PENDING",
        });

        // Increment usage count
        await db
            .update(referralCodes)
            .set({ usageCount: sql`${referralCodes.usageCount} + 1` })
            .where(eq(referralCodes.id, referralCode.id));

        return {
            success: true,
            message: `Referral code applied! Complete a booking to earn ৳${referralCode.referredReward}`,
        };
    } catch (error) {
        console.error("Error applying referral code:", error);
        return { success: false, error: "Failed to apply referral code" };
    }
}

/**
 * Process referral reward after booking completion
 * Called internally when a referred user completes their first booking
 */
export async function processReferralReward(
    referredUserId: string,
    bookingId: string
) {
    try {
        // Find pending referral for this user
        const pendingReferral = await db.query.referrals.findFirst({
            where: and(
                eq(referrals.referredUserId, referredUserId),
                eq(referrals.status, "PENDING")
            ),
            with: {
                referrerCode: {
                    with: {
                        user: true,
                    },
                },
            },
        });

        if (!pendingReferral) {
            // User wasn't referred, nothing to do
            return { success: true, rewarded: false };
        }

        const referrerReward = Number(pendingReferral.referrerCode.referrerReward);
        const referredReward = Number(pendingReferral.referrerCode.referredReward);
        const referrerId = pendingReferral.referrerCode.userId;

        // Update referral to completed
        await db
            .update(referrals)
            .set({
                status: "COMPLETED",
                bookingId,
                referrerReward: referrerReward.toString(),
                referredReward: referredReward.toString(),
                completedAt: new Date(),
            })
            .where(eq(referrals.id, pendingReferral.id));

        // Credit referrer's wallet
        const referrerWallet = await db.query.wallets.findFirst({
            where: eq(wallets.userId, referrerId),
        });

        if (referrerWallet) {
            await db
                .update(wallets)
                .set({
                    balance: sql`${wallets.balance} + ${referrerReward}`,
                })
                .where(eq(wallets.id, referrerWallet.id));

            await db.insert(walletTransactions).values({
                walletId: referrerWallet.id,
                amount: referrerReward.toString(),
                type: "CREDIT",
                reason: "REFERRAL",
                description: "Referral bonus - Friend completed booking",
            });
        }

        // Credit referred user's wallet
        const referredWallet = await db.query.wallets.findFirst({
            where: eq(wallets.userId, referredUserId),
        });

        if (referredWallet) {
            await db
                .update(wallets)
                .set({
                    balance: sql`${wallets.balance} + ${referredReward}`,
                })
                .where(eq(wallets.id, referredWallet.id));

            await db.insert(walletTransactions).values({
                walletId: referredWallet.id,
                amount: referredReward.toString(),
                type: "CREDIT",
                reason: "REFERRAL",
                description: "Referral welcome bonus",
            });
        }

        revalidatePath("/wallet");
        revalidatePath("/profile/referral");

        return {
            success: true,
            rewarded: true,
            referrerReward,
            referredReward,
        };
    } catch (error) {
        console.error("Error processing referral reward:", error);
        return { success: false, error: "Failed to process referral reward" };
    }
}
