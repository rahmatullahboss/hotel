"use server";

import { db, systemSettings, incentivePrograms, hotelIncentives, hotels, type HotelIncentive, type IncentiveProgram } from "@repo/db";
import { eq, desc, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SETTING_KEYS } from "@repo/db/schema";

// ==================
// System Settings
// ==================

/**
 * Get a system setting value
 */
export async function getSetting(key: string): Promise<string | null> {
    const setting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, key),
    });
    return setting?.value || null;
}

/**
 * Set a system setting value
 */
export async function setSetting(
    key: string,
    value: string,
    description?: string
): Promise<void> {
    const existing = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, key),
    });

    if (existing) {
        await db
            .update(systemSettings)
            .set({ value, updatedAt: new Date() })
            .where(eq(systemSettings.key, key));
    } else {
        await db.insert(systemSettings).values({
            key,
            value,
            description,
        });
    }

    revalidatePath("/incentives");
}

/**
 * Check if hotel incentives are enabled
 */
export async function isHotelIncentivesEnabled(): Promise<boolean> {
    const value = await getSetting(SETTING_KEYS.HOTEL_INCENTIVES_ENABLED);
    return value === "true";
}

/**
 * Toggle hotel incentives visibility
 */
export async function toggleHotelIncentives(): Promise<boolean> {
    const current = await isHotelIncentivesEnabled();
    const newValue = !current;
    await setSetting(
        SETTING_KEYS.HOTEL_INCENTIVES_ENABLED,
        newValue.toString(),
        "Controls whether hotel owners can see incentive programs"
    );
    return newValue;
}

// ==================
// Incentive Programs CRUD
// ==================

/**
 * Get all incentive programs
 */
export async function getAllPrograms() {
    const programs = await db.query.incentivePrograms.findMany({
        orderBy: desc(incentivePrograms.createdAt),
    });
    return programs;
}

/**
 * Get program with participation stats
 */
export async function getProgramWithStats(programId: string) {
    const program = await db.query.incentivePrograms.findFirst({
        where: eq(incentivePrograms.id, programId),
    });

    if (!program) return null;

    const participations = await db.query.hotelIncentives.findMany({
        where: eq(hotelIncentives.programId, programId),
    });

    const stats = {
        totalParticipants: participations.length,
        approved: participations.filter((p: HotelIncentive) => p.claimStatus === "APPROVED").length,
        pending: participations.filter((p: HotelIncentive) => p.claimStatus === "PENDING").length,
        paid: participations.filter((p: HotelIncentive) => p.claimStatus === "PAID").length,
    };

    return { program, stats };
}

/**
 * Create a new incentive program
 */
export async function createProgram(data: {
    name: string;
    description?: string;
    type: "BOOKING_COUNT" | "REVENUE_TARGET" | "OCCUPANCY_RATE" | "RATING_IMPROVEMENT" | "FIRST_MILESTONE" | "STREAK" | "SEASONAL_BONUS";
    targetValue: number;
    targetUnit: string;
    rewardAmount: number;
    startDate: Date;
    endDate: Date;
    minHotelRating?: number;
    badgeIcon?: string;
    badgeColor?: string;
}): Promise<{ success: boolean; programId?: string; error?: string }> {
    try {
        const [program] = await db
            .insert(incentivePrograms)
            .values({
                name: data.name,
                description: data.description,
                type: data.type,
                targetValue: data.targetValue,
                targetUnit: data.targetUnit,
                rewardAmount: data.rewardAmount.toString(),
                startDate: data.startDate,
                endDate: data.endDate,
                minHotelRating: data.minHotelRating?.toString(),
                badgeIcon: data.badgeIcon,
                badgeColor: data.badgeColor,
                status: "ACTIVE",
            })
            .returning({ id: incentivePrograms.id });

        revalidatePath("/incentives");
        return { success: true, programId: program?.id };
    } catch (error) {
        console.error("Error creating program:", error);
        return { success: false, error: "Failed to create program" };
    }
}

/**
 * Update program status
 */
export async function updateProgramStatus(
    programId: string,
    status: "ACTIVE" | "UPCOMING" | "EXPIRED" | "PAUSED"
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(incentivePrograms)
            .set({ status, updatedAt: new Date() })
            .where(eq(incentivePrograms.id, programId));

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error updating status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

/**
 * Delete a program
 */
export async function deleteProgram(
    programId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .delete(incentivePrograms)
            .where(eq(incentivePrograms.id, programId));

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error deleting program:", error);
        return { success: false, error: "Failed to delete program" };
    }
}

// ==================
// Claims Management
// ==================

/**
 * Get all pending claims
 */
export async function getPendingClaims() {
    const claims = await db.query.hotelIncentives.findMany({
        where: eq(hotelIncentives.claimStatus, "PENDING"),
        with: {
            hotel: true,
            program: true,
        },
        orderBy: desc(hotelIncentives.claimedAt),
    });

    return claims.map((claim: typeof claims[number]) => ({
        id: claim.id,
        hotelName: claim.hotel?.name || "Unknown",
        programName: claim.program.name,
        amount: claim.payoutAmount,
        claimedAt: claim.claimedAt,
    }));
}

/**
 * Approve a claim
 */
export async function approveClaim(
    claimId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(hotelIncentives)
            .set({
                claimStatus: "APPROVED",
                updatedAt: new Date(),
            })
            .where(eq(hotelIncentives.id, claimId));

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error approving claim:", error);
        return { success: false, error: "Failed to approve claim" };
    }
}

/**
 * Mark claim as paid
 */
export async function markClaimPaid(
    claimId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(hotelIncentives)
            .set({
                claimStatus: "PAID",
                paidAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(hotelIncentives.id, claimId));

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error marking paid:", error);
        return { success: false, error: "Failed to mark as paid" };
    }
}

/**
 * Reject a claim
 */
export async function rejectClaim(
    claimId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(hotelIncentives)
            .set({
                claimStatus: "REJECTED",
                updatedAt: new Date(),
            })
            .where(eq(hotelIncentives.id, claimId));

        revalidatePath("/incentives");
        return { success: true };
    } catch (error) {
        console.error("Error rejecting claim:", error);
        return { success: false, error: "Failed to reject claim" };
    }
}

// ==================
// Dashboard Stats
// ==================

/**
 * Get incentive dashboard stats
 */
export async function getIncentiveDashboardStats() {
    const programs = await db.query.incentivePrograms.findMany();
    const allClaims = await db.query.hotelIncentives.findMany();

    const activePrograms = programs.filter((p: IncentiveProgram) => p.status === "ACTIVE").length;
    const pendingClaims = allClaims.filter((c: HotelIncentive) => c.claimStatus === "PENDING").length;
    const totalPaid = allClaims
        .filter((c: HotelIncentive) => c.claimStatus === "PAID")
        .reduce((sum: number, c: HotelIncentive) => sum + parseFloat(c.payoutAmount || "0"), 0);

    const isEnabled = await isHotelIncentivesEnabled();

    return {
        activePrograms,
        totalPrograms: programs.length,
        pendingClaims,
        totalPaid,
        isEnabled,
    };
}
