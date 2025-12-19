"use server";

import { db } from "@repo/db";
import {
    staffAttendance,
    staffShifts,
    shiftHandoverReports,
    hotelStaff,
    users,
    type HandoverTask,
} from "@repo/db/schema";
import { eq, and, desc, gte, lte, isNull } from "drizzle-orm";
import { getPartnerRole, requirePermission } from "./getPartnerRole";
import { revalidatePath } from "next/cache";

// ====================
// TYPES
// ====================

export interface AttendanceRecord {
    id: string;
    staffId: string;
    staffName: string | null;
    staffEmail: string | null;
    role: string;
    clockInTime: Date;
    clockOutTime: Date | null;
    clockInNote: string | null;
    clockOutNote: string | null;
    totalHoursWorked: string | null;
}

export interface ShiftStatus {
    isClockedIn: boolean;
    currentAttendanceId: string | null;
    clockInTime: Date | null;
    hoursWorkedToday: number;
}

export interface HandoverReport {
    id: string;
    fromStaffId: string;
    fromStaffName: string | null;
    toStaffId: string | null;
    toStaffName: string | null;
    pendingTasks: HandoverTask[];
    completedTasks: HandoverTask[];
    notes: string | null;
    checkInsHandled: number;
    checkOutsHandled: number;
    walkInsRecorded: number;
    issuesReported: number;
    handoverTime: Date;
}

// ====================
// CLOCK IN / CLOCK OUT
// ====================

/**
 * Clock in the current staff member
 */
export async function clockIn(
    note?: string
): Promise<{ success: boolean; error?: string; attendanceId?: string }> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return { success: false, error: "Not authenticated" };
        }

        // Check if already clocked in
        const existingAttendance = await db.query.staffAttendance.findFirst({
            where: and(
                eq(staffAttendance.hotelId, roleInfo.hotelId),
                eq(staffAttendance.staffId, roleInfo.staffId),
                isNull(staffAttendance.clockOutTime)
            ),
        });

        if (existingAttendance) {
            return { success: false, error: "Already clocked in" };
        }

        // Create attendance record
        const [newAttendance] = await db
            .insert(staffAttendance)
            .values({
                hotelId: roleInfo.hotelId,
                staffId: roleInfo.staffId,
                clockInTime: new Date(),
                clockInNote: note || null,
            })
            .returning();

        revalidatePath("/staff-performance");
        revalidatePath("/");

        return { success: true, attendanceId: newAttendance?.id };
    } catch (error) {
        console.error("Error clocking in:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to clock in",
        };
    }
}

/**
 * Clock out the current staff member
 */
export async function clockOut(
    note?: string
): Promise<{ success: boolean; error?: string; hoursWorked?: string }> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return { success: false, error: "Not authenticated" };
        }

        // Find current attendance record
        const currentAttendance = await db.query.staffAttendance.findFirst({
            where: and(
                eq(staffAttendance.hotelId, roleInfo.hotelId),
                eq(staffAttendance.staffId, roleInfo.staffId),
                isNull(staffAttendance.clockOutTime)
            ),
        });

        if (!currentAttendance) {
            return { success: false, error: "Not currently clocked in" };
        }

        // Calculate hours worked
        const clockOutTime = new Date();
        const hoursWorked =
            (clockOutTime.getTime() - currentAttendance.clockInTime.getTime()) /
            (1000 * 60 * 60);
        const hoursWorkedStr = hoursWorked.toFixed(2);

        // Update attendance record
        await db
            .update(staffAttendance)
            .set({
                clockOutTime,
                clockOutNote: note || null,
                totalHoursWorked: hoursWorkedStr,
                updatedAt: new Date(),
            })
            .where(eq(staffAttendance.id, currentAttendance.id));

        revalidatePath("/staff-performance");
        revalidatePath("/");

        return { success: true, hoursWorked: hoursWorkedStr };
    } catch (error) {
        console.error("Error clocking out:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to clock out",
        };
    }
}

/**
 * Get current shift/attendance status for the logged-in staff
 */
export async function getCurrentShiftStatus(): Promise<ShiftStatus> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return {
                isClockedIn: false,
                currentAttendanceId: null,
                clockInTime: null,
                hoursWorkedToday: 0,
            };
        }

        // Check for open attendance record
        const currentAttendance = await db.query.staffAttendance.findFirst({
            where: and(
                eq(staffAttendance.hotelId, roleInfo.hotelId),
                eq(staffAttendance.staffId, roleInfo.staffId),
                isNull(staffAttendance.clockOutTime)
            ),
        });

        // Calculate hours worked today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await db.query.staffAttendance.findMany({
            where: and(
                eq(staffAttendance.hotelId, roleInfo.hotelId),
                eq(staffAttendance.staffId, roleInfo.staffId),
                gte(staffAttendance.clockInTime, today),
                lte(staffAttendance.clockInTime, tomorrow)
            ),
        });

        let hoursWorkedToday = 0;
        for (const record of todayAttendance) {
            if (record.totalHoursWorked) {
                hoursWorkedToday += parseFloat(record.totalHoursWorked);
            } else if (record.clockOutTime === null) {
                // Currently clocked in - calculate running hours
                hoursWorkedToday +=
                    (new Date().getTime() - record.clockInTime.getTime()) / (1000 * 60 * 60);
            }
        }

        return {
            isClockedIn: !!currentAttendance,
            currentAttendanceId: currentAttendance?.id || null,
            clockInTime: currentAttendance?.clockInTime || null,
            hoursWorkedToday: Math.round(hoursWorkedToday * 100) / 100,
        };
    } catch (error) {
        console.error("Error getting shift status:", error);
        return {
            isClockedIn: false,
            currentAttendanceId: null,
            clockInTime: null,
            hoursWorkedToday: 0,
        };
    }
}

/**
 * Get attendance history for the hotel
 */
export async function getAttendanceHistory(options?: {
    staffId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}): Promise<AttendanceRecord[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { staffId, startDate, endDate, limit = 50 } = options || {};

        const conditions = [eq(staffAttendance.hotelId, roleInfo.hotelId)];

        if (staffId) {
            conditions.push(eq(staffAttendance.staffId, staffId));
        }

        if (startDate) {
            conditions.push(gte(staffAttendance.clockInTime, new Date(startDate)));
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            conditions.push(lte(staffAttendance.clockInTime, endDateTime));
        }

        const records = await db
            .select({
                id: staffAttendance.id,
                staffId: staffAttendance.staffId,
                staffName: users.name,
                staffEmail: users.email,
                role: hotelStaff.role,
                clockInTime: staffAttendance.clockInTime,
                clockOutTime: staffAttendance.clockOutTime,
                clockInNote: staffAttendance.clockInNote,
                clockOutNote: staffAttendance.clockOutNote,
                totalHoursWorked: staffAttendance.totalHoursWorked,
            })
            .from(staffAttendance)
            .innerJoin(hotelStaff, eq(hotelStaff.id, staffAttendance.staffId))
            .innerJoin(users, eq(users.id, hotelStaff.userId))
            .where(and(...conditions))
            .orderBy(desc(staffAttendance.clockInTime))
            .limit(limit);

        return records;
    } catch (error) {
        console.error("Error getting attendance history:", error);
        return [];
    }
}

// ====================
// SHIFT HANDOVER
// ====================

/**
 * Create a shift handover report
 */
export async function createHandoverReport(data: {
    toStaffId?: string;
    pendingTasks: HandoverTask[];
    completedTasks: HandoverTask[];
    notes?: string;
    checkInsHandled?: number;
    checkOutsHandled?: number;
    walkInsRecorded?: number;
    issuesReported?: number;
}): Promise<{ success: boolean; error?: string; reportId?: string }> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return { success: false, error: "Not authenticated" };
        }

        const [report] = await db
            .insert(shiftHandoverReports)
            .values({
                hotelId: roleInfo.hotelId,
                fromStaffId: roleInfo.staffId,
                toStaffId: data.toStaffId || null,
                pendingTasks: data.pendingTasks,
                completedTasks: data.completedTasks,
                notes: data.notes || null,
                checkInsHandled: String(data.checkInsHandled || 0),
                checkOutsHandled: String(data.checkOutsHandled || 0),
                walkInsRecorded: String(data.walkInsRecorded || 0),
                issuesReported: String(data.issuesReported || 0),
                handoverTime: new Date(),
            })
            .returning();

        revalidatePath("/staff-performance");

        return { success: true, reportId: report?.id };
    } catch (error) {
        console.error("Error creating handover report:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create handover report",
        };
    }
}

/**
 * Get handover reports for the hotel
 */
export async function getHandoverReports(options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
}): Promise<HandoverReport[]> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return [];
        }

        const { limit = 20, startDate, endDate } = options || {};

        const conditions = [eq(shiftHandoverReports.hotelId, roleInfo.hotelId)];

        if (startDate) {
            conditions.push(gte(shiftHandoverReports.handoverTime, new Date(startDate)));
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            conditions.push(lte(shiftHandoverReports.handoverTime, endDateTime));
        }

        const reports = await db.query.shiftHandoverReports.findMany({
            where: and(...conditions),
            orderBy: [desc(shiftHandoverReports.handoverTime)],
            limit,
            with: {
                fromStaff: {
                    with: {
                        user: {
                            columns: { name: true },
                        },
                    },
                },
                toStaff: {
                    with: {
                        user: {
                            columns: { name: true },
                        },
                    },
                },
            },
        });

        return reports.map((report) => ({
            id: report.id,
            fromStaffId: report.fromStaffId,
            fromStaffName: report.fromStaff?.user?.name || null,
            toStaffId: report.toStaffId,
            toStaffName: report.toStaff?.user?.name || null,
            pendingTasks: (report.pendingTasks || []) as HandoverTask[],
            completedTasks: (report.completedTasks || []) as HandoverTask[],
            notes: report.notes,
            checkInsHandled: parseInt(report.checkInsHandled || "0", 10),
            checkOutsHandled: parseInt(report.checkOutsHandled || "0", 10),
            walkInsRecorded: parseInt(report.walkInsRecorded || "0", 10),
            issuesReported: parseInt(report.issuesReported || "0", 10),
            handoverTime: report.handoverTime,
        }));
    } catch (error) {
        console.error("Error getting handover reports:", error);
        return [];
    }
}

/**
 * Get the latest handover report (for shift start reference)
 */
export async function getLatestHandoverReport(): Promise<HandoverReport | null> {
    try {
        const roleInfo = await getPartnerRole();
        if (!roleInfo) {
            return null;
        }

        const reports = await getHandoverReports({ limit: 1 });
        return reports[0] || null;
    } catch (error) {
        console.error("Error getting latest handover report:", error);
        return null;
    }
}
