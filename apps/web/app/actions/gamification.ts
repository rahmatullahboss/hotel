"use server";

import { db } from "@repo/db";
import {
    loginStreaks,
    bookingStreaks,
    badges,
    userBadges,
    wallets,
    walletTransactions,
} from "@repo/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "../auth";
import { revalidatePath } from "next/cache";

// ====================
// STREAK ACTIONS
// ====================

// Streak reward thresholds and amounts
const STREAK_REWARDS = [
    { days: 3, reward: 10, badgeCode: "STREAK_3" },
    { days: 7, reward: 25, badgeCode: "STREAK_7" },
    { days: 14, reward: 50, badgeCode: "STREAK_14" },
    { days: 30, reward: 100, badgeCode: "STREAK_30" },
    { days: 60, reward: 200, badgeCode: "STREAK_60" },
    { days: 90, reward: 300, badgeCode: "STREAK_90" },
];

/**
 * Record a daily login and update streak
 * Should be called on each user visit/session
 */
export async function recordDailyLogin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;
    const today = new Date().toISOString().split("T")[0]!; // "2024-12-14"

    try {
        // Get or create streak record
        let streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, userId),
        });

        if (!streak) {
            // First login ever
            const [newStreak] = await db
                .insert(loginStreaks)
                .values({
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastLoginDate: today,
                    totalLoginDays: 1,
                })
                .returning();

            return {
                success: true,
                currentStreak: 1,
                isNewDay: true,
                reward: null,
            };
        }

        // Check if already logged in today
        if (streak.lastLoginDate === today) {
            return {
                success: true,
                currentStreak: streak.currentStreak,
                isNewDay: false,
                reward: null,
            };
        }

        // Calculate streak
        const lastLogin = new Date(streak.lastLoginDate || "1970-01-01");
        const todayDate = new Date(today);
        const dayDiff = Math.floor(
            (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newStreak: number;
        if (dayDiff === 1) {
            // Consecutive day - increment streak
            newStreak = streak.currentStreak + 1;
        } else {
            // Streak broken - reset to 1
            newStreak = 1;
        }

        const newLongest = Math.max(streak.longestStreak, newStreak);

        // Update streak record
        await db
            .update(loginStreaks)
            .set({
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastLoginDate: today,
                totalLoginDays: streak.totalLoginDays + 1,
                updatedAt: new Date(),
            })
            .where(eq(loginStreaks.id, streak.id));

        // Check for streak rewards
        let reward = null;
        for (const sr of STREAK_REWARDS) {
            if (newStreak >= sr.days && streak.lastRewardStreak < sr.days) {
                // Award this streak milestone
                reward = await awardStreakReward(userId, sr.days, sr.reward, sr.badgeCode);

                // Update last reward streak
                await db
                    .update(loginStreaks)
                    .set({ lastRewardStreak: sr.days })
                    .where(eq(loginStreaks.id, streak.id));

                break; // Only award one reward at a time
            }
        }

        revalidatePath("/profile");
        revalidatePath("/wallet");

        return {
            success: true,
            currentStreak: newStreak,
            longestStreak: newLongest,
            isNewDay: true,
            reward,
        };
    } catch (error) {
        console.error("Error recording daily login:", error);
        return { success: false, error: "Failed to record login" };
    }
}

/**
 * Award streak reward to user wallet
 */
async function awardStreakReward(
    userId: string,
    days: number,
    amount: number,
    badgeCode: string
) {
    try {
        // Add to wallet
        const wallet = await db.query.wallets.findFirst({
            where: eq(wallets.userId, userId),
        });

        if (wallet) {
            await db
                .update(wallets)
                .set({ balance: sql`${wallets.balance} + ${amount}` })
                .where(eq(wallets.id, wallet.id));

            await db.insert(walletTransactions).values({
                walletId: wallet.id,
                amount: amount.toString(),
                type: "CREDIT",
                reason: "REWARD",
                description: `${days}-day login streak reward! 🔥`,
            });
        }

        // Award badge if exists
        const badge = await db.query.badges.findFirst({
            where: eq(badges.code, badgeCode),
        });

        if (badge) {
            // Check if already has badge
            const existing = await db.query.userBadges.findFirst({
                where: and(
                    eq(userBadges.userId, userId),
                    eq(userBadges.badgeId, badge.id)
                ),
            });

            if (!existing) {
                await db.insert(userBadges).values({
                    userId,
                    badgeId: badge.id,
                });
            }
        }

        return { days, amount, badgeCode };
    } catch (error) {
        console.error("Error awarding streak reward:", error);
        return null;
    }
}

/**
 * Get user's streak data
 */
export async function getStreakData() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    try {
        const streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, session.user.id),
        });

        if (!streak) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                totalLoginDays: 0,
                nextReward: STREAK_REWARDS[0],
                daysUntilReward: STREAK_REWARDS[0]?.days || 3,
            };
        }

        // Find next reward
        const nextReward = STREAK_REWARDS.find(
            (r) => r.days > streak.currentStreak
        );

        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            totalLoginDays: streak.totalLoginDays,
            nextReward: nextReward || null,
            daysUntilReward: nextReward
                ? nextReward.days - streak.currentStreak
                : 0,
        };
    } catch (error) {
        console.error("Error getting streak data:", error);
        return null;
    }
}

/**
 * Get user's badges
 */
export async function getUserBadges() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    try {
        const earned = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, session.user.id),
            with: {
                badge: true,
            },
            orderBy: (ub, { desc }) => [desc(ub.earnedAt)],
        });

        return earned.map((ub) => ({
            id: ub.badge.id,
            code: ub.badge.code,
            name: ub.badge.name,
            nameBn: ub.badge.nameBn,
            description: ub.badge.description,
            descriptionBn: ub.badge.descriptionBn,
            category: ub.badge.category,
            icon: ub.badge.icon,
            points: ub.badge.points,
            earnedAt: ub.earnedAt,
        }));
    } catch (error) {
        console.error("Error getting user badges:", error);
        return [];
    }
}

/**
 * Get all available badges with unlock status
 */
export async function getAllBadges() {
    const session = await auth();

    try {
        const allBadges = await db.query.badges.findMany({
            where: eq(badges.isActive, true),
            orderBy: (b, { asc }) => [asc(b.category), asc(b.requirement)],
        });

        if (!session?.user?.id) {
            return allBadges.map((b) => ({
                ...b,
                isEarned: false,
                earnedAt: null,
            }));
        }

        const earned = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, session.user.id),
        });

        const earnedMap = new Map(
            earned.map((e) => [e.badgeId, e.earnedAt])
        );

        return allBadges
            .filter((b) => !b.isSecret || earnedMap.has(b.id))
            .map((b) => ({
                ...b,
                isEarned: earnedMap.has(b.id),
                earnedAt: earnedMap.get(b.id) || null,
            }));
    } catch (error) {
        console.error("Error getting all badges:", error);
        return [];
    }
}
