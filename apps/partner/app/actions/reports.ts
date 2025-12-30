"use server";

import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

// Types for Scheduled Reports
export interface ScheduledReport {
    id: string;
    type: "REVENUE" | "OCCUPANCY" | "BOOKING" | "PERFORMANCE";
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    recipients: string[];
    format: "PDF" | "EXCEL" | "CSV";
    isActive: boolean;
    lastSentAt: Date | null;
    nextSendAt: Date | null;
    createdAt: Date;
}

export interface ReportScheduleSettings {
    dailyReportTime: string; // HH:mm format
    weeklyReportDay: number; // 0-6 (Sunday-Saturday)
    monthlyReportDay: number; // 1-28
    timezone: string;
}

/**
 * Get all scheduled reports for the hotel
 */
export async function getScheduledReports(): Promise<ScheduledReport[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // In a real implementation, fetch from database
    // For now, return sample data
    return [
        {
            id: "sr-1",
            type: "REVENUE",
            frequency: "DAILY",
            recipients: [session.user.email],
            format: "PDF",
            isActive: true,
            lastSentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            nextSendAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            id: "sr-2",
            type: "PERFORMANCE",
            frequency: "WEEKLY",
            recipients: [session.user.email],
            format: "EXCEL",
            isActive: true,
            lastSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            nextSendAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    ];
}

/**
 * Get report schedule settings
 */
export async function getReportScheduleSettings(): Promise<ReportScheduleSettings> {
    const session = await auth();
    if (!session?.user?.email) {
        return {
            dailyReportTime: "08:00",
            weeklyReportDay: 1, // Monday
            monthlyReportDay: 1,
            timezone: "Asia/Dhaka",
        };
    }

    // Return default settings
    return {
        dailyReportTime: "08:00",
        weeklyReportDay: 1,
        monthlyReportDay: 1,
        timezone: "Asia/Dhaka",
    };
}

/**
 * Create a new scheduled report
 */
export async function createScheduledReport(data: {
    type: ScheduledReport["type"];
    frequency: ScheduledReport["frequency"];
    recipients: string[];
    format: ScheduledReport["format"];
}): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Creating scheduled report:", data);
    
    revalidatePath("/reports");
    return { success: true };
}

/**
 * Update scheduled report
 */
export async function updateScheduledReport(
    id: string,
    updates: Partial<ScheduledReport>
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Updating scheduled report:", id, updates);
    
    revalidatePath("/reports");
    return { success: true };
}

/**
 * Toggle scheduled report active status
 */
export async function toggleScheduledReport(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Toggling scheduled report:", id);
    
    revalidatePath("/reports");
    return { success: true };
}

/**
 * Delete scheduled report
 */
export async function deleteScheduledReport(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Deleting scheduled report:", id);
    
    revalidatePath("/reports");
    return { success: true };
}

/**
 * Update report schedule settings
 */
export async function updateReportScheduleSettings(
    settings: ReportScheduleSettings
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Updating report schedule settings:", settings);
    
    revalidatePath("/reports");
    return { success: true };
}

/**
 * Send report immediately (manual trigger)
 */
export async function sendReportNow(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    // In real implementation:
    // 1. Generate the report
    // 2. Send via email (Resend/SendGrid)
    // 3. Update lastSentAt

    console.log("Sending report now:", id);
    
    revalidatePath("/reports");
    return { success: true };
}
