"use server";

import { auth } from "../../auth";
import { db, incentivePrograms, hotelIncentives, incentiveHistory, hotels, bookings, systemSettings } from "@repo/db";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SETTING_KEYS } from "@repo/db/schema";

/**
 * Check if hotel owner incentives are enabled
 */
export async function isIncentivesEnabled(): Promise<boolean> {
    const setting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, SETTING_KEYS.HOTEL_INCENTIVES_ENABLED),
    });
    return setting?.value === "true";
}

// ==================
// Types
// ==================

export type IncentiveType =
    | "BOOKING_COUNT"
    | "REVENUE_TARGET"
    | "OCCUPANCY_RATE"
    | "RATING_IMPROVEMENT"
    | "FIRST_MILESTONE"
    | "STREAK"
    | "SEASONAL_BONUS";

export type ProgramStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "PAUSED";
export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

interface IncentiveWithProgress {
    id: string;
    programId: string;
    name: string;
    description: string | null;
    type: IncentiveType;
    targetValue: number;
    targetUnit: string;
    rewardAmount: string;
    rewardType: string;
    startDate: Date;
    endDate: Date;
    badgeIcon: string | null;
    badgeColor: string | null;
    currentProgress: number;
    progressPercentage: string;
    isCompleted: boolean;
    completedAt: Date | null;
    claimStatus: ClaimStatus | null;
    daysRemaining: number;
}

// ==================
// Get Functions
// ==================

/**
 * Get active incentive programs available for the partner's hotel
 */
export async function getActivePrograms(): Promise<IncentiveWithProgress[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return [];

    const now = new Date();

    // Get all active programs
    const programs = await db.query.incentivePrograms.findMany({
        where: and(
            eq(incentivePrograms.status, "ACTIVE"),
            lte(incentivePrograms.startDate, now),
            gte(incentivePrograms.endDate, now)
        ),
        orderBy: desc(incentivePrograms.endDate),
    });

    // Get hotel's participation in programs
    const participations = await db.query.hotelIncentives.findMany({
        where: eq(hotelIncentives.hotelId, hotel.id),
    });

    const participationMap = new Map(
        participations.map((p: typeof participations[number]) => [p.programId, p])
    );

    // Build result with progress
    const result: IncentiveWithProgress[] = [];

    for (const program of programs) {
        let participation = participationMap.get(program.id) as any;

        // Auto-enroll if not participating
        if (!participation) {
            const [newParticipation] = await db
                .insert(hotelIncentives)
                .values({
                    hotelId: hotel.id,
                    programId: program.id,
                    currentProgress: 0,
                    progressPercentage: "0",
                })
                .returning();

            participation = newParticipation;

            // Log enrollment
            await db.insert(incentiveHistory).values({
                hotelIncentiveId: newParticipation!.id,
                action: "ENROLLED",
                newProgress: 0,
            });
        }

        const daysRemaining = Math.ceil(
            (program.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        result.push({
            id: participation!.id,
            programId: program.id,
            name: program.name,
            description: program.description,
            type: program.type as IncentiveType,
            targetValue: program.targetValue,
            targetUnit: program.targetUnit,
            rewardAmount: program.rewardAmount,
            rewardType: program.rewardType,
            startDate: program.startDate,
            endDate: program.endDate,
            badgeIcon: program.badgeIcon,
            badgeColor: program.badgeColor,
            currentProgress: participation!.currentProgress,
            progressPercentage: participation!.progressPercentage,
            isCompleted: participation!.isCompleted,
            completedAt: participation!.completedAt,
            claimStatus: participation!.claimStatus as ClaimStatus | null,
            daysRemaining,
        });
    }

    return result;
}

/**
 * Get completed incentives ready to claim
 */
export async function getClaimableIncentives(): Promise<IncentiveWithProgress[]> {
    const incentives = await getActivePrograms();
    return incentives.filter(
        (i) => i.isCompleted && !i.claimStatus
    );
}

/**
 * Get incentive statistics
 */
export async function getIncentiveStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return null;

    const participations = await db.query.hotelIncentives.findMany({
        where: eq(hotelIncentives.hotelId, hotel.id),
        with: {
            program: true,
        },
    });

    const active = participations.filter(
        (p: typeof participations[number]) => p.program.status === "ACTIVE" && !p.isCompleted
    ).length;

    const completed = participations.filter((p: typeof participations[number]) => p.isCompleted).length;

    const claimed = participations.filter(
        (p: typeof participations[number]) => p.claimStatus === "PAID"
    ).length;

    const totalEarned = participations
        .filter((p: typeof participations[number]) => p.claimStatus === "PAID")
        .reduce((sum: number, p: typeof participations[number]) => sum + parseFloat(p.payoutAmount || "0"), 0);

    return {
        active,
        completed,
        claimed,
        totalEarned,
    };
}

// ==================
// Progress Updates
// ==================

/**
 * Refresh progress for all hotel incentives
 */
export async function refreshIncentiveProgress(): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) return;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return;

    const participations = await db.query.hotelIncentives.findMany({
        where: and(
            eq(hotelIncentives.hotelId, hotel.id),
            eq(hotelIncentives.isCompleted, false)
        ),
        with: {
            program: true,
        },
    });

    for (const participation of participations) {
        const program = participation.program;
        let newProgress = 0;

        // Calculate progress based on incentive type
        switch (program.type) {
            case "BOOKING_COUNT": {
                const result = await db
                    .select({ count: count() })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            gte(bookings.createdAt, program.startDate),
                            lte(bookings.createdAt, program.endDate)
                        )
                    );
                newProgress = result[0]?.count || 0;
                break;
            }
            case "REVENUE_TARGET": {
                const result = await db
                    .select({ total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` })
                    .from(bookings)
                    .where(
                        and(
                            eq(bookings.hotelId, hotel.id),
                            gte(bookings.createdAt, program.startDate),
                            lte(bookings.createdAt, program.endDate)
                        )
                    );
                newProgress = Math.floor(result[0]?.total || 0);
                break;
            }
            case "RATING_IMPROVEMENT": {
                // Rating is stored as decimal (e.g., 4.5)
                // Target is rating * 10 (e.g., target 45 means 4.5 rating)
                const hotelData = await db.query.hotels.findFirst({
                    where: eq(hotels.id, hotel.id),
                    columns: { rating: true }
                });
                const currentRating = Number(hotelData?.rating || 0);
                // Progress is rating * 10 (so 4.5 rating = 45 progress towards target of e.g. 40)
                newProgress = Math.round(currentRating * 10);
                break;
            }
            default:
                // For other types, keep current progress
                newProgress = participation.currentProgress;
        }

        const progressPercentage = Math.min(
            100,
            (newProgress / program.targetValue) * 100
        ).toFixed(2);

        const isCompleted = newProgress >= program.targetValue;

        // Update if changed
        if (newProgress !== participation.currentProgress || isCompleted !== participation.isCompleted) {
            await db
                .update(hotelIncentives)
                .set({
                    currentProgress: newProgress,
                    progressPercentage,
                    isCompleted,
                    completedAt: isCompleted && !participation.isCompleted ? new Date() : participation.completedAt,
                    lastProgressUpdate: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(hotelIncentives.id, participation.id));

            // Log progress update
            await db.insert(incentiveHistory).values({
                hotelIncentiveId: participation.id,
                action: isCompleted ? "COMPLETED" : "PROGRESS_UPDATE",
                previousProgress: participation.currentProgress,
                newProgress,
            });
        }
    }

    // Note: Do NOT call revalidatePath here as this function is called during page render
    // revalidatePath should only be called from mutations (form actions, button clicks)
}

// ==================
// Claim Functions
// ==================

/**
 * Claim a completed incentive
 */
export async function claimIncentive(
    hotelIncentiveId: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const participation = await db.query.hotelIncentives.findFirst({
            where: eq(hotelIncentives.id, hotelIncentiveId),
            with: {
                hotel: true,
                program: true,
            },
        });

        if (!participation) {
            return { success: false, error: "Incentive not found" };
        }

        if (participation.hotel.ownerId !== session.user.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (!participation.isCompleted) {
            return { success: false, error: "Incentive not yet completed" };
        }

        if (participation.claimStatus) {
            return { success: false, error: "Already claimed or processing" };
        }

        // Submit claim
        await db
            .update(hotelIncentives)
            .set({
                claimStatus: "PENDING",
                claimedAt: new Date(),
                payoutAmount: participation.program.rewardAmount,
                updatedAt: new Date(),
            })
            .where(eq(hotelIncentives.id, hotelIncentiveId));

        // Log claim
        await db.insert(incentiveHistory).values({
            hotelIncentiveId,
            action: "CLAIMED",
            notes: `Claim submitted for ${participation.program.rewardAmount} BDT`,
        });

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error claiming incentive:", error);
        return { success: false, error: "Failed to claim incentive" };
    }
}
