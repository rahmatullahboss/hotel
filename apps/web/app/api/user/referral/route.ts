import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { referralCodes, referrals, users } from "@repo/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

function generateReferralCode(userName: string): string {
    const namePart = (userName || "VIBE")
        .split(" ")[0]
        ?.toUpperCase()
        .slice(0, 4) || "VIBE";
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${namePart}-${randomPart}`;
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user name for code generation
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { name: true },
        });

        // Get or create referral code
        let userCode = await db.query.referralCodes.findFirst({
            where: and(
                eq(referralCodes.userId, userId),
                eq(referralCodes.isActive, true)
            ),
        });

        if (!userCode) {
            let code = generateReferralCode(user?.name || "");
            let attempts = 0;

            while (attempts < 5) {
                const existing = await db.query.referralCodes.findFirst({
                    where: eq(referralCodes.code, code),
                });
                if (!existing) break;
                code = generateReferralCode(user?.name || "");
                attempts++;
            }

            const [newCode] = await db
                .insert(referralCodes)
                .values({ userId, code })
                .returning();
            userCode = newCode!;
        }

        // Get referral stats
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

        return NextResponse.json({
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
        });
    } catch (error) {
        console.error("Error getting referral data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Find the referral code
        const referralCode = await db.query.referralCodes.findFirst({
            where: and(
                eq(referralCodes.code, code.toUpperCase()),
                eq(referralCodes.isActive, true)
            ),
        });

        if (!referralCode) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
        }

        if (referralCode.userId === userId) {
            return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 });
        }

        // Check if already used a referral
        const existingReferral = await db.query.referrals.findFirst({
            where: eq(referrals.referredUserId, userId),
        });

        if (existingReferral) {
            return NextResponse.json({ error: "You have already used a referral code" }, { status: 400 });
        }

        // Check max uses
        if (referralCode.maxUses && referralCode.usageCount >= referralCode.maxUses) {
            return NextResponse.json({ error: "This referral code has reached its limit" }, { status: 400 });
        }

        // Create pending referral
        await db.insert(referrals).values({
            referrerCodeId: referralCode.id,
            referredUserId: userId,
            status: "PENDING",
        });

        // Increment usage count
        await db
            .update(referralCodes)
            .set({ usageCount: sql`${referralCodes.usageCount} + 1` })
            .where(eq(referralCodes.id, referralCode.id));

        return NextResponse.json({
            success: true,
            message: `Referral code applied! Complete a booking to earn ৳${referralCode.referredReward}`,
        });
    } catch (error) {
        console.error("Error applying referral code:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
