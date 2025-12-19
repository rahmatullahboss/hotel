"use server";

import { db } from "@repo/db";
import { activityLog, bookings, users, hotelStaff } from "@repo/db/schema";
import { eq, and, desc, gte, lte, sql, count } from "drizzle-orm";
import { getPartnerRole, requirePermission } from "./getPartnerRole";

// ====================
// TYPES
// ====================

export interface StaffActivityLogEntry {
    id: string;
    type: string;
    description: string;
    actorId: string | null;
    actorName: string | null;
    actorEmail: string | null;
    bookingId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}

export interface StaffPerformanceMetrics {
    staffId: string;
    staffName: string | null;
    staffEmail: string | null;
    role: string;
    checkInsHandled: number;
    checkOutsHandled: number;
    paymentsReceived: number;
    bookingsCreated: number;
    totalActions: number;
}

export interface DailyPerformanceSummary {
    date: string;
    totalCheckIns: number;
    totalCheckOuts: number;
    totalPayments: number;
    staffBreakdown: StaffPerformanceMetrics[];
}

export interface EfficiencyMetrics {
    staffId: string;
    staffName: string | null;
    avgCheckInTimeMinutes: number | null; // Avg time between booking confirmation and check-in
    checkInsToday: number;
    checkOutsToday: number;
    avgActionsPerHour: number;
}

// ====================
// STAFF ACTIVITY LOG
// ====================

/**
 * Get activity log entries, optionally filtered by staff member and date range
 */
export async function getStaffActivityLog(options?: {
    staffId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}): Promise<StaffActivityLogEntry[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { staffId, startDate, endDate, limit = 50 } = options || {};

        // Build conditions
        const conditions = [eq(activityLog.hotelId, roleInfo.hotelId)];

        if (staffId) {
            // Get the userId from hotelStaff
            const staffMember = await db.query.hotelStaff.findFirst({
                where: eq(hotelStaff.id, staffId),
                columns: { userId: true },
            });
            if (staffMember) {
                conditions.push(eq(activityLog.actorId, staffMember.userId));
            }
        }

        if (startDate) {
            conditions.push(gte(activityLog.createdAt, new Date(startDate)));
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            conditions.push(lte(activityLog.createdAt, endDateTime));
        }

        const logs = await db
            .select({
                id: activityLog.id,
                type: activityLog.type,
                description: activityLog.description,
                actorId: activityLog.actorId,
                actorName: users.name,
                actorEmail: users.email,
                bookingId: activityLog.bookingId,
                metadata: activityLog.metadata,
                createdAt: activityLog.createdAt,
            })
            .from(activityLog)
            .leftJoin(users, eq(users.id, activityLog.actorId))
            .where(and(...conditions))
            .orderBy(desc(activityLog.createdAt))
            .limit(limit);

        return logs;
    } catch (error) {
        console.error("Error getting staff activity log:", error);
        return [];
    }
}

// ====================
// PERFORMANCE METRICS
// ====================

/**
 * Get performance metrics for all staff members or a specific staff member
 */
export async function getStaffPerformanceMetrics(options?: {
    staffId?: string;
    period?: "today" | "week" | "month";
}): Promise<StaffPerformanceMetrics[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { staffId, period = "today" } = options || {};

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case "today":
                startDate.setHours(0, 0, 0, 0);
                break;
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }

        // Get all staff for this hotel
        const staffMembers = await db.query.hotelStaff.findMany({
            where: and(
                eq(hotelStaff.hotelId, roleInfo.hotelId),
                eq(hotelStaff.status, "ACTIVE"),
                staffId ? eq(hotelStaff.id, staffId) : undefined
            ),
            with: {
                user: {
                    columns: { id: true, name: true, email: true },
                },
            },
        });

        const metrics: StaffPerformanceMetrics[] = [];

        for (const staff of staffMembers) {
            if (!staff.user) continue;

            // Count activities by type for this staff member
            const activities = await db
                .select({
                    type: activityLog.type,
                    count: count(),
                })
                .from(activityLog)
                .where(
                    and(
                        eq(activityLog.hotelId, roleInfo.hotelId),
                        eq(activityLog.actorId, staff.user.id),
                        gte(activityLog.createdAt, startDate),
                        lte(activityLog.createdAt, endDate)
                    )
                )
                .groupBy(activityLog.type);

            const activityMap = new Map(activities.map((a) => [a.type, Number(a.count)]));

            metrics.push({
                staffId: staff.id,
                staffName: staff.user.name,
                staffEmail: staff.user.email,
                role: staff.role,
                checkInsHandled: activityMap.get("CHECK_IN") || 0,
                checkOutsHandled: activityMap.get("CHECK_OUT") || 0,
                paymentsReceived: activityMap.get("PAYMENT_RECEIVED") || 0,
                bookingsCreated: activityMap.get("BOOKING_CREATED") || 0,
                totalActions: activities.reduce((sum, a) => sum + Number(a.count), 0),
            });
        }

        // Sort by total actions descending
        return metrics.sort((a, b) => b.totalActions - a.totalActions);
    } catch (error) {
        console.error("Error getting staff performance metrics:", error);
        return [];
    }
}

/**
 * Get daily performance summary for a specific date
 */
export async function getDailyPerformanceSummary(
    dateStr?: string
): Promise<DailyPerformanceSummary> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return getEmptySummary(dateStr || new Date().toISOString().split("T")[0]!);
        }

        const targetDate = dateStr || new Date().toISOString().split("T")[0]!;
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all activities for the day
        const activities = await db
            .select({
                type: activityLog.type,
                actorId: activityLog.actorId,
                count: count(),
            })
            .from(activityLog)
            .where(
                and(
                    eq(activityLog.hotelId, roleInfo.hotelId),
                    gte(activityLog.createdAt, startOfDay),
                    lte(activityLog.createdAt, endOfDay)
                )
            )
            .groupBy(activityLog.type, activityLog.actorId);

        // Calculate totals
        let totalCheckIns = 0;
        let totalCheckOuts = 0;
        let totalPayments = 0;

        const staffActivityMap = new Map<
            string,
            { checkIns: number; checkOuts: number; payments: number; bookings: number; total: number }
        >();

        for (const activity of activities) {
            const actorId = activity.actorId || "unknown";
            const countNum = Number(activity.count);

            if (!staffActivityMap.has(actorId)) {
                staffActivityMap.set(actorId, {
                    checkIns: 0,
                    checkOuts: 0,
                    payments: 0,
                    bookings: 0,
                    total: 0,
                });
            }

            const staffStats = staffActivityMap.get(actorId)!;
            staffStats.total += countNum;

            switch (activity.type) {
                case "CHECK_IN":
                    totalCheckIns += countNum;
                    staffStats.checkIns += countNum;
                    break;
                case "CHECK_OUT":
                    totalCheckOuts += countNum;
                    staffStats.checkOuts += countNum;
                    break;
                case "PAYMENT_RECEIVED":
                    totalPayments += countNum;
                    staffStats.payments += countNum;
                    break;
                case "BOOKING_CREATED":
                    staffStats.bookings += countNum;
                    break;
            }
        }

        // Get staff details
        const staffIds = Array.from(staffActivityMap.keys()).filter((id) => id !== "unknown");
        const staffDetails = await db.query.users.findMany({
            where: sql`${users.id} IN ${staffIds.length > 0 ? staffIds : ["placeholder"]}`,
            columns: { id: true, name: true, email: true },
        });

        const staffDetailsMap = new Map(staffDetails.map((s) => [s.id, s]));

        // Get hotelStaff records for role info
        const hotelStaffRecords = await db.query.hotelStaff.findMany({
            where: eq(hotelStaff.hotelId, roleInfo.hotelId),
        });
        const userToStaffMap = new Map(hotelStaffRecords.map((hs) => [hs.userId, hs]));

        const staffBreakdown: StaffPerformanceMetrics[] = [];
        for (const [actorId, stats] of staffActivityMap) {
            if (actorId === "unknown") continue;

            const user = staffDetailsMap.get(actorId);
            const staffRecord = userToStaffMap.get(actorId);

            staffBreakdown.push({
                staffId: staffRecord?.id || actorId,
                staffName: user?.name || null,
                staffEmail: user?.email || null,
                role: staffRecord?.role || "UNKNOWN",
                checkInsHandled: stats.checkIns,
                checkOutsHandled: stats.checkOuts,
                paymentsReceived: stats.payments,
                bookingsCreated: stats.bookings,
                totalActions: stats.total,
            });
        }

        return {
            date: targetDate,
            totalCheckIns,
            totalCheckOuts,
            totalPayments,
            staffBreakdown: staffBreakdown.sort((a, b) => b.totalActions - a.totalActions),
        };
    } catch (error) {
        console.error("Error getting daily performance summary:", error);
        return getEmptySummary(dateStr || new Date().toISOString().split("T")[0]!);
    }
}

/**
 * Get efficiency metrics for staff
 */
export async function getEfficiencyMetrics(options?: {
    staffId?: string;
    period?: "today" | "week" | "month";
}): Promise<EfficiencyMetrics[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { staffId, period = "today" } = options || {};

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case "today":
                startDate.setHours(0, 0, 0, 0);
                break;
            case "week":
                startDate.setDate(startDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }

        // Get staff members
        const staffMembers = await db.query.hotelStaff.findMany({
            where: and(
                eq(hotelStaff.hotelId, roleInfo.hotelId),
                eq(hotelStaff.status, "ACTIVE"),
                staffId ? eq(hotelStaff.id, staffId) : undefined
            ),
            with: {
                user: {
                    columns: { id: true, name: true },
                },
            },
        });

        const metrics: EfficiencyMetrics[] = [];
        const hoursInPeriod = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

        for (const staff of staffMembers) {
            if (!staff.user) continue;

            // Get activity counts
            const checkIns = await db
                .select({ count: count() })
                .from(activityLog)
                .where(
                    and(
                        eq(activityLog.hotelId, roleInfo.hotelId),
                        eq(activityLog.actorId, staff.user.id),
                        eq(activityLog.type, "CHECK_IN"),
                        gte(activityLog.createdAt, startDate),
                        lte(activityLog.createdAt, endDate)
                    )
                );

            const checkOuts = await db
                .select({ count: count() })
                .from(activityLog)
                .where(
                    and(
                        eq(activityLog.hotelId, roleInfo.hotelId),
                        eq(activityLog.actorId, staff.user.id),
                        eq(activityLog.type, "CHECK_OUT"),
                        gte(activityLog.createdAt, startDate),
                        lte(activityLog.createdAt, endDate)
                    )
                );

            const totalActions = await db
                .select({ count: count() })
                .from(activityLog)
                .where(
                    and(
                        eq(activityLog.hotelId, roleInfo.hotelId),
                        eq(activityLog.actorId, staff.user.id),
                        gte(activityLog.createdAt, startDate),
                        lte(activityLog.createdAt, endDate)
                    )
                );

            const checkInsCount = Number(checkIns[0]?.count || 0);
            const checkOutsCount = Number(checkOuts[0]?.count || 0);
            const totalCount = Number(totalActions[0]?.count || 0);

            metrics.push({
                staffId: staff.id,
                staffName: staff.user.name,
                avgCheckInTimeMinutes: null, // Would need more complex calculation with booking confirmation times
                checkInsToday: checkInsCount,
                checkOutsToday: checkOutsCount,
                avgActionsPerHour: hoursInPeriod > 0 ? Math.round((totalCount / hoursInPeriod) * 100) / 100 : 0,
            });
        }

        return metrics.sort((a, b) => b.avgActionsPerHour - a.avgActionsPerHour);
    } catch (error) {
        console.error("Error getting efficiency metrics:", error);
        return [];
    }
}

// Helper
function getEmptySummary(date: string): DailyPerformanceSummary {
    return {
        date,
        totalCheckIns: 0,
        totalCheckOuts: 0,
        totalPayments: 0,
        staffBreakdown: [],
    };
}
