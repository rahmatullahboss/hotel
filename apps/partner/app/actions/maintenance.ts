"use server";

import { db } from "@repo/db";
import { rooms } from "@repo/db/schema";
import { eq, count } from "drizzle-orm";
import { auth } from "../../auth";
import { revalidatePath } from "next/cache";

// Types
export interface MaintenanceRequest {
    id: string;
    type: "PLUMBING" | "ELECTRICAL" | "HVAC" | "FURNITURE" | "CLEANING" | "APPLIANCE" | "OTHER";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status: "OPEN" | "IN_PROGRESS" | "PENDING_PARTS" | "COMPLETED" | "CANCELLED";
    roomNumber?: string;
    location: string;
    description: string;
    reportedBy: string;
    assignedTo?: string;
    estimatedCost?: number;
    actualCost?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    photos?: string[];
}

export interface Vendor {
    id: string;
    name: string;
    category: string[];
    contactName: string;
    phone: string;
    email?: string;
    address: string;
    rating: number;
    totalJobs: number;
    isPreferred: boolean;
    notes?: string;
}

export interface PreventiveMaintenance {
    id: string;
    name: string;
    type: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
    scope: "ALL_ROOMS" | "SPECIFIC_ROOMS" | "COMMON_AREAS";
    description: string;
    checklist: string[];
    lastCompleted?: Date;
    nextDue: Date;
    isActive: boolean;
}

export interface MaintenanceStats {
    openRequests: number;
    inProgress: number;
    completedThisMonth: number;
    avgResolutionTime: number; // in hours
    totalCostThisMonth: number;
}

// Maintenance type configs with Bengali labels
export const MAINTENANCE_TYPES = [
    { value: "PLUMBING", label: "প্লাম্বিং", icon: "🔧" },
    { value: "ELECTRICAL", label: "ইলেক্ট্রিক্যাল", icon: "⚡" },
    { value: "HVAC", label: "এসি/হিটিং", icon: "❄️" },
    { value: "FURNITURE", label: "ফার্নিচার", icon: "🪑" },
    { value: "CLEANING", label: "ক্লিনিং", icon: "🧹" },
    { value: "APPLIANCE", label: "এপ্লায়েন্স", icon: "📺" },
    { value: "OTHER", label: "অন্যান্য", icon: "🛠️" },
] as const;

/**
 * Get all maintenance requests
 */
export async function getMaintenanceRequests(
    hotelId: string,
    status?: MaintenanceRequest["status"]
): Promise<MaintenanceRequest[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // In real implementation, fetch from database
    // Return sample data
    const sampleRequests: MaintenanceRequest[] = [
        {
            id: "mr-1",
            type: "PLUMBING",
            priority: "HIGH",
            status: "OPEN",
            roomNumber: "102",
            location: "Bathroom",
            description: "Leaking faucet, needs replacement",
            reportedBy: "Housekeeping",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
            id: "mr-2",
            type: "ELECTRICAL",
            priority: "MEDIUM",
            status: "IN_PROGRESS",
            roomNumber: "205",
            location: "Main Room",
            description: "Light fixture not working",
            reportedBy: "Guest Complaint",
            assignedTo: "Electrician - Karim",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
            id: "mr-3",
            type: "HVAC",
            priority: "URGENT",
            status: "PENDING_PARTS",
            roomNumber: "301",
            location: "AC Unit",
            description: "AC not cooling, compressor issue",
            reportedBy: "Front Desk",
            assignedTo: "AC Service - Rahman",
            estimatedCost: 5000,
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
            id: "mr-4",
            type: "FURNITURE",
            priority: "LOW",
            status: "COMPLETED",
            roomNumber: "107",
            location: "Bedroom",
            description: "Bed frame squeaking",
            reportedBy: "Housekeeping",
            assignedTo: "Maintenance Staff",
            actualCost: 500,
            createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
    ];

    if (status) {
        return sampleRequests.filter((r) => r.status === status);
    }

    return sampleRequests;
}

/**
 * Get maintenance statistics
 */
export async function getMaintenanceStats(hotelId: string): Promise<MaintenanceStats> {
    const session = await auth();
    if (!session?.user?.email) {
        return {
            openRequests: 0,
            inProgress: 0,
            completedThisMonth: 0,
            avgResolutionTime: 0,
            totalCostThisMonth: 0,
        };
    }

    // Sample stats
    return {
        openRequests: 3,
        inProgress: 2,
        completedThisMonth: 12,
        avgResolutionTime: 18, // hours
        totalCostThisMonth: 25000,
    };
}

/**
 * Create new maintenance request
 */
export async function createMaintenanceRequest(
    hotelId: string,
    data: {
        type: MaintenanceRequest["type"];
        priority: MaintenanceRequest["priority"];
        roomNumber?: string;
        location: string;
        description: string;
    }
): Promise<{ success: boolean; error?: string; requestId?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Creating maintenance request:", hotelId, data);
    
    revalidatePath("/maintenance");
    return { success: true, requestId: `mr-${Date.now()}` };
}

/**
 * Update maintenance request status
 */
export async function updateMaintenanceStatus(
    requestId: string,
    status: MaintenanceRequest["status"],
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Updating maintenance status:", requestId, status, notes);
    
    revalidatePath("/maintenance");
    return { success: true };
}

/**
 * Assign maintenance request to vendor/staff
 */
export async function assignMaintenanceRequest(
    requestId: string,
    assignedTo: string,
    estimatedCost?: number
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Assigning maintenance:", requestId, assignedTo, estimatedCost);
    
    revalidatePath("/maintenance");
    return { success: true };
}

/**
 * Get vendors list
 */
export async function getVendors(hotelId: string): Promise<Vendor[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // Sample vendors
    return [
        {
            id: "v-1",
            name: "Rahman AC Service",
            category: ["HVAC"],
            contactName: "Md. Rahman",
            phone: "+8801712345678",
            email: "rahman.ac@email.com",
            address: "Gulshan, Dhaka",
            rating: 4.5,
            totalJobs: 25,
            isPreferred: true,
        },
        {
            id: "v-2",
            name: "Karim Electric",
            category: ["ELECTRICAL"],
            contactName: "Karim Ahmed",
            phone: "+8801812345678",
            address: "Banani, Dhaka",
            rating: 4.2,
            totalJobs: 18,
            isPreferred: true,
        },
        {
            id: "v-3",
            name: "Quick Plumbing",
            category: ["PLUMBING"],
            contactName: "Jamal Uddin",
            phone: "+8801912345678",
            address: "Dhanmondi, Dhaka",
            rating: 4.0,
            totalJobs: 30,
            isPreferred: false,
        },
    ];
}

/**
 * Create or update vendor
 */
export async function saveVendor(
    hotelId: string,
    vendor: Omit<Vendor, "id" | "rating" | "totalJobs"> | Vendor
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Saving vendor:", hotelId, vendor);
    
    revalidatePath("/maintenance");
    return { success: true };
}

/**
 * Get preventive maintenance schedules
 */
export async function getPreventiveMaintenance(
    hotelId: string
): Promise<PreventiveMaintenance[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    // Sample schedules
    return [
        {
            id: "pm-1",
            name: "Daily Room Inspection",
            type: "DAILY",
            scope: "ALL_ROOMS",
            description: "Standard daily room inspection checklist",
            checklist: [
                "Check all lights",
                "Test TV and remote",
                "Inspect bathroom fixtures",
                "Check AC function",
            ],
            lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000),
            nextDue: new Date(),
            isActive: true,
        },
        {
            id: "pm-2",
            name: "Monthly AC Filter Clean",
            type: "MONTHLY",
            scope: "ALL_ROOMS",
            description: "Clean AC filters in all rooms",
            checklist: [
                "Remove AC filter",
                "Clean with water",
                "Dry completely",
                "Reinstall filter",
            ],
            lastCompleted: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            nextDue: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            isActive: true,
        },
        {
            id: "pm-3",
            name: "Quarterly Fire Safety Check",
            type: "QUARTERLY",
            scope: "COMMON_AREAS",
            description: "Fire extinguisher and alarm inspection",
            checklist: [
                "Check fire extinguisher pressure",
                "Test smoke detectors",
                "Verify emergency exit signs",
                "Inspect fire hose reels",
            ],
            lastCompleted: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isActive: true,
        },
    ];
}

/**
 * Complete preventive maintenance task
 */
export async function completePreventiveMaintenance(
    scheduleId: string,
    completedItems: boolean[],
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    console.log("Completing preventive maintenance:", scheduleId, completedItems, notes);
    
    revalidatePath("/maintenance");
    return { success: true };
}

/**
 * Get room list for maintenance selection
 */
export async function getRoomsForMaintenance(hotelId: string): Promise<{ roomNumber: string; floor: string }[]> {
    const session = await auth();
    if (!session?.user?.email) {
        return [];
    }

    const roomList = await db
        .select({ roomNumber: rooms.roomNumber, floor: rooms.floor })
        .from(rooms)
        .where(eq(rooms.hotelId, hotelId));

    return roomList.map((r) => ({
        roomNumber: r.roomNumber,
        floor: r.floor || "1",
    }));
}
