import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { loginStreaks, badges, userBadges, wallets, walletTransactions } from "@repo/db/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

// Streak reward thresholds
const STREAK_REWARDS = [
    { days: 3, reward: 10, badgeCode: "STREAK_3" },
    { days: 7, reward: 25, badgeCode: "STREAK_7" },
    { days: 14, reward: 50, badgeCode: "STREAK_14" },
    { days: 30, reward: 100, badgeCode: "STREAK_30" },
    { days: 60, reward: 200, badgeCode: "STREAK_60" },
    { days: 90, reward: 300, badgeCode: "STREAK_90" },
];

/**
 * GET /api/user/gamification
 * Returns user's streak data and badges
 */
export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get streak data
        const streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, userId),
        });

        const streakData = streak
            ? {
                  currentStreak: streak.currentStreak,
                  longestStreak: streak.longestStreak,
                  totalLoginDays: streak.totalLoginDays,
                  lastLoginDate: streak.lastLoginDate,
              }
            : {
                  currentStreak: 0,
                  longestStreak: 0,
                  totalLoginDays: 0,
                  lastLoginDate: null,
              };

        // Find next reward
        const nextReward = STREAK_REWARDS.find(
            (r) => r.days > streakData.currentStreak
        );

        // Get user's earned badges
        const earnedBadges = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, userId),
            with: { badge: true },
            orderBy: desc(userBadges.earnedAt),
        });

        // Get all badges
        const allBadges = await db.query.badges.findMany({
            where: eq(badges.isActive, true),
            orderBy: [asc(badges.category), asc(badges.requirement)],
        });

        const earnedIds = new Set(earnedBadges.map((eb: typeof earnedBadges[number]) => eb.badgeId));

        return NextResponse.json({
            streak: {
                ...streakData,
                nextReward: nextReward || null,
                daysUntilReward: nextReward ? nextReward.days - streakData.currentStreak : 0,
                streakRewards: STREAK_REWARDS,
            },
            badges: {
                earned: earnedBadges.map((ub: typeof earnedBadges[number]) => ({
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
                })),
                all: allBadges
                    .filter((b: typeof allBadges[number]) => !b.isSecret || earnedIds.has(b.id))
                    .map((b: typeof allBadges[number]) => ({
                        id: b.id,
                        code: b.code,
                        name: b.name,
                        nameBn: b.nameBn,
                        description: b.description,
                        descriptionBn: b.descriptionBn,
                        category: b.category,
                        icon: b.icon,
                        points: b.points,
                        requirement: b.requirement,
                        isEarned: earnedIds.has(b.id),
                    })),
            },
        });
    } catch (error) {
        console.error("Error getting gamification data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/user/gamification
 * Record a daily login and update streak
 */
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const today = new Date().toISOString().split("T")[0]!;

        // Get or create streak record
        const streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, userId),
        });

        if (!streak) {
            // First login ever
            await db
                .insert(loginStreaks)
                .values({
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastLoginDate: today,
                    totalLoginDays: 1,
                });

            return NextResponse.json({
                success: true,
                currentStreak: 1,
                isNewDay: true,
                reward: null,
            });
        }

        // Check if already logged in today
        if (streak.lastLoginDate === today) {
            return NextResponse.json({
                success: true,
                currentStreak: streak.currentStreak,
                isNewDay: false,
                reward: null,
            });
        }

        // Calculate streak
        const lastLogin = new Date(streak.lastLoginDate || "1970-01-01");
        const todayDate = new Date(today);
        const dayDiff = Math.floor(
            (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newStreak: number;
        if (dayDiff === 1) {
            newStreak = streak.currentStreak + 1;
        } else {
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
                reward = await awardStreakReward(userId, sr.days, sr.reward, sr.badgeCode);

                await db
                    .update(loginStreaks)
                    .set({ lastRewardStreak: sr.days })
                    .where(eq(loginStreaks.id, streak.id));

                break;
            }
        }

        return NextResponse.json({
            success: true,
            currentStreak: newStreak,
            longestStreak: newLongest,
            isNewDay: true,
            reward,
        });
    } catch (error) {
        console.error("Error recording daily login:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function awardStreakReward(
    userId: string,
    days: number,
    amount: number,
    badgeCode: string
) {
    try {
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

        const badge = await db.query.badges.findFirst({
            where: eq(badges.code, badgeCode),
        });

        if (badge) {
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
