import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@repo/db";
import { loginStreaks, badges, userBadges, wallets, walletTransactions } from "@repo/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const STREAK_REWARDS = [
    { days: 3, reward: 10, badgeCode: "STREAK_3" },
    { days: 7, reward: 25, badgeCode: "STREAK_7" },
    { days: 14, reward: 50, badgeCode: "STREAK_14" },
    { days: 30, reward: 100, badgeCode: "STREAK_30" },
    { days: 60, reward: 200, badgeCode: "STREAK_60" },
    { days: 90, reward: 300, badgeCode: "STREAK_90" },
];

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get streak data
        let streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, userId),
        });

        const streakData = streak
            ? {
                currentStreak: streak.currentStreak,
                longestStreak: streak.longestStreak,
                totalLoginDays: streak.totalLoginDays,
            }
            : {
                currentStreak: 0,
                longestStreak: 0,
                totalLoginDays: 0,
            };

        const nextReward = STREAK_REWARDS.find(
            (r) => r.days > streakData.currentStreak
        );

        // Get all badges with earned status
        const allBadges = await db.query.badges.findMany({
            where: eq(badges.isActive, true),
            orderBy: (b, { asc }) => [asc(b.category), asc(b.requirement)],
        });

        const earned = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, userId),
        });

        const earnedMap = new Map(
            earned.map((e) => [e.badgeId, e.earnedAt])
        );

        const badgesWithStatus = allBadges
            .filter((b) => !b.isSecret || earnedMap.has(b.id))
            .map((b) => ({
                id: b.id,
                code: b.code,
                name: b.name,
                nameBn: b.nameBn,
                description: b.description,
                descriptionBn: b.descriptionBn,
                category: b.category,
                icon: b.icon,
                points: b.points,
                isEarned: earnedMap.has(b.id),
                earnedAt: earnedMap.get(b.id) || null,
            }));

        return NextResponse.json({
            streak: {
                ...streakData,
                nextReward: nextReward || null,
                daysUntilReward: nextReward
                    ? nextReward.days - streakData.currentStreak
                    : 0,
            },
            badges: badgesWithStatus,
            earnedCount: earned.length,
        });
    } catch (error) {
        console.error("Error getting achievements:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST to record daily login
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const today = new Date().toISOString().split("T")[0]!;

        let streak = await db.query.loginStreaks.findFirst({
            where: eq(loginStreaks.userId, userId),
        });

        if (!streak) {
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

            return NextResponse.json({
                success: true,
                currentStreak: 1,
                isNewDay: true,
                reward: null,
            });
        }

        if (streak.lastLoginDate === today) {
            return NextResponse.json({
                success: true,
                currentStreak: streak.currentStreak,
                isNewDay: false,
                reward: null,
            });
        }

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
                // Award reward
                const wallet = await db.query.wallets.findFirst({
                    where: eq(wallets.userId, userId),
                });

                if (wallet) {
                    await db
                        .update(wallets)
                        .set({ balance: sql`${wallets.balance} + ${sr.reward}` })
                        .where(eq(wallets.id, wallet.id));

                    await db.insert(walletTransactions).values({
                        walletId: wallet.id,
                        amount: sr.reward.toString(),
                        type: "CREDIT",
                        reason: "REWARD",
                        description: `${sr.days}-day login streak reward! 🔥`,
                    });
                }

                // Award badge
                const badge = await db.query.badges.findFirst({
                    where: eq(badges.code, sr.badgeCode),
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

                await db
                    .update(loginStreaks)
                    .set({ lastRewardStreak: sr.days })
                    .where(eq(loginStreaks.id, streak.id));

                reward = { days: sr.days, amount: sr.reward, badgeCode: sr.badgeCode };
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
        console.error("Error recording login:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
