"use server";

import { auth } from "../../auth";
import { db, housekeepingTasks, housekeepingLogs, roomCleaningStatuses, rooms, hotels } from "@repo/db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================
// Types
// ==================

export type TaskType = "CHECKOUT_CLEAN" | "STAY_OVER" | "INSPECTION" | "MAINTENANCE" | "TURNDOWN" | "DEEP_CLEAN";
export type TaskStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED" | "CANCELLED";
export type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type CleaningStatus = "CLEAN" | "DIRTY" | "INSPECTED" | "OUT_OF_ORDER";

interface TaskWithRoom {
    id: string;
    roomId: string;
    roomNumber: string;
    type: TaskType;
    status: TaskStatus;
    priority: Priority;
    assignedTo: string | null;
    assignedToName?: string | null;
    scheduledFor: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    notes: string | null;
    createdAt: Date;
}

// ==================
// Get Functions
// ==================

/**
 * Get all rooms with their cleaning status for the partner's hotel
 */
export async function getRoomsWithCleaningStatus() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return [];

    const hotelRooms = await db.query.rooms.findMany({
        where: eq(rooms.hotelId, hotel.id),
        orderBy: rooms.roomNumber,
    });

    // Get cleaning statuses for all rooms
    const statuses = await db.query.roomCleaningStatuses.findMany({
        where: inArray(
            roomCleaningStatuses.roomId,
            hotelRooms.map((r: typeof hotelRooms[number]) => r.id)
        ),
    });

    const statusMap = new Map(statuses.map((s: typeof statuses[number]) => [s.roomId, s]));

    return hotelRooms.map((room: typeof hotelRooms[number]) => {
        const status = statusMap.get(room.id) as any;
        return {
            id: room.id,
            roomNumber: room.roomNumber,
            roomName: room.name,
            type: room.type,
            status: (status?.status || "CLEAN") as CleaningStatus,
            lastCleanedAt: status?.lastCleanedAt,
            lastInspectedAt: status?.lastInspectedAt,
            notes: status?.notes,
        };
    });
}

/**
 * Get today's housekeeping tasks
 */
export async function getTodaysTasks(): Promise<TaskWithRoom[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await db.query.housekeepingTasks.findMany({
        where: and(
            eq(housekeepingTasks.hotelId, hotel.id),
            sql`${housekeepingTasks.createdAt} >= ${today}`,
            sql`${housekeepingTasks.createdAt} < ${tomorrow}`
        ),
        with: {
            room: true,
            assignedToUser: true,
        },
        orderBy: [desc(housekeepingTasks.priority), desc(housekeepingTasks.createdAt)],
    });

    return tasks.map((task: typeof tasks[number]) => ({
        id: task.id,
        roomId: task.roomId,
        roomNumber: task.room?.roomNumber || "Unknown",
        type: task.type as TaskType,
        status: task.status as TaskStatus,
        priority: task.priority as Priority,
        assignedTo: task.assignedTo,
        assignedToName: task.assignedToUser?.name,
        scheduledFor: task.scheduledFor,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        notes: task.notes,
        createdAt: task.createdAt,
    }));
}

/**
 * Get task statistics for dashboard
 */
export async function getHousekeepingStats() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await db.query.housekeepingTasks.findMany({
        where: and(
            eq(housekeepingTasks.hotelId, hotel.id),
            sql`${housekeepingTasks.createdAt} >= ${today}`
        ),
    });

    const roomsData = await getRoomsWithCleaningStatus();

    const pending = tasks.filter((t: typeof tasks[number]) => t.status === "PENDING" || t.status === "ASSIGNED").length;
    const inProgress = tasks.filter((t: typeof tasks[number]) => t.status === "IN_PROGRESS").length;
    const completed = tasks.filter((t: typeof tasks[number]) => t.status === "COMPLETED" || t.status === "VERIFIED").length;
    const dirtyRooms = roomsData.filter((r: typeof roomsData[number]) => r.status === "DIRTY").length;
    const cleanRooms = roomsData.filter((r: typeof roomsData[number]) => r.status === "CLEAN" || r.status === "INSPECTED").length;

    return {
        pending,
        inProgress,
        completed,
        total: tasks.length,
        dirtyRooms,
        cleanRooms,
        totalRooms: roomsData.length,
    };
}

// ==================
// Task Management
// ==================

/**
 * Create a new housekeeping task
 */
export async function createTask(data: {
    roomId: string;
    type: TaskType;
    priority?: Priority;
    notes?: string;
    scheduledFor?: Date;
}): Promise<{ success: boolean; taskId?: string; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) {
        return { success: false, error: "Hotel not found" };
    }

    try {
        const [task] = await db
            .insert(housekeepingTasks)
            .values({
                hotelId: hotel.id,
                roomId: data.roomId,
                type: data.type,
                priority: data.priority || "NORMAL",
                notes: data.notes,
                scheduledFor: data.scheduledFor,
                createdBy: session.user.id,
            })
            .returning({ id: housekeepingTasks.id });

        // Log the creation
        await db.insert(housekeepingLogs).values({
            taskId: task!.id,
            action: "CREATED",
            performedBy: session.user.id,
            newStatus: "PENDING",
        });

        // Mark room as dirty if it's a cleaning task
        if (data.type === "CHECKOUT_CLEAN" || data.type === "DEEP_CLEAN") {
            await updateRoomStatus(data.roomId, "DIRTY");
        }

        revalidatePath("/housekeeping");
        return { success: true, taskId: task?.id };
    } catch (error) {
        console.error("Error creating task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

/**
 * Start a task
 */
export async function startTask(taskId: string): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const task = await db.query.housekeepingTasks.findFirst({
            where: eq(housekeepingTasks.id, taskId),
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        await db
            .update(housekeepingTasks)
            .set({
                status: "IN_PROGRESS",
                startedAt: new Date(),
                assignedTo: session.user.id,
                assignedAt: task.assignedTo ? undefined : new Date(),
                updatedAt: new Date(),
            })
            .where(eq(housekeepingTasks.id, taskId));

        await db.insert(housekeepingLogs).values({
            taskId,
            action: "STARTED",
            performedBy: session.user.id,
            previousStatus: task.status,
            newStatus: "IN_PROGRESS",
        });

        revalidatePath("/housekeeping");
        return { success: true };
    } catch (error) {
        console.error("Error starting task:", error);
        return { success: false, error: "Failed to start task" };
    }
}

/**
 * Complete a task
 */
export async function completeTask(
    taskId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const task = await db.query.housekeepingTasks.findFirst({
            where: eq(housekeepingTasks.id, taskId),
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        await db
            .update(housekeepingTasks)
            .set({
                status: "COMPLETED",
                completedAt: new Date(),
                notes: notes || task.notes,
                checklistCompleted: true,
                updatedAt: new Date(),
            })
            .where(eq(housekeepingTasks.id, taskId));

        await db.insert(housekeepingLogs).values({
            taskId,
            action: "COMPLETED",
            performedBy: session.user.id,
            previousStatus: task.status,
            newStatus: "COMPLETED",
            notes,
        });

        // Mark room as clean
        await updateRoomStatus(task.roomId, "CLEAN", session.user.id);

        revalidatePath("/housekeeping");
        return { success: true };
    } catch (error) {
        console.error("Error completing task:", error);
        return { success: false, error: "Failed to complete task" };
    }
}

/**
 * Verify/inspect a completed task
 */
export async function verifyTask(
    taskId: string,
    passed: boolean,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const task = await db.query.housekeepingTasks.findFirst({
            where: eq(housekeepingTasks.id, taskId),
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        if (passed) {
            await db
                .update(housekeepingTasks)
                .set({
                    status: "VERIFIED",
                    verifiedBy: session.user.id,
                    verifiedAt: new Date(),
                    notes: notes || task.notes,
                    updatedAt: new Date(),
                })
                .where(eq(housekeepingTasks.id, taskId));

            // Mark room as inspected
            await updateRoomStatus(task.roomId, "INSPECTED", undefined, session.user.id);
        } else {
            // Failed inspection - send back to in progress
            await db
                .update(housekeepingTasks)
                .set({
                    status: "IN_PROGRESS",
                    notes: notes ? `Inspection failed: ${notes}` : task.notes,
                    updatedAt: new Date(),
                })
                .where(eq(housekeepingTasks.id, taskId));
        }

        await db.insert(housekeepingLogs).values({
            taskId,
            action: passed ? "VERIFIED" : "FAILED_INSPECTION",
            performedBy: session.user.id,
            previousStatus: task.status,
            newStatus: passed ? "VERIFIED" : "IN_PROGRESS",
            notes,
        });

        revalidatePath("/housekeeping");
        return { success: true };
    } catch (error) {
        console.error("Error verifying task:", error);
        return { success: false, error: "Failed to verify task" };
    }
}

// ==================
// Room Status Management
// ==================

/**
 * Update room cleaning status
 */
export async function updateRoomStatus(
    roomId: string,
    status: CleaningStatus,
    cleanedBy?: string,
    inspectedBy?: string
): Promise<void> {
    const existing = await db.query.roomCleaningStatuses.findFirst({
        where: eq(roomCleaningStatuses.roomId, roomId),
    });

    const updateData: Record<string, unknown> = {
        status,
        updatedAt: new Date(),
    };

    if (status === "CLEAN" && cleanedBy) {
        updateData.lastCleanedAt = new Date();
        updateData.lastCleanedBy = cleanedBy;
    }

    if (status === "INSPECTED" && inspectedBy) {
        updateData.lastInspectedAt = new Date();
        updateData.lastInspectedBy = inspectedBy;
    }

    if (existing) {
        await db
            .update(roomCleaningStatuses)
            .set(updateData)
            .where(eq(roomCleaningStatuses.id, existing.id));
    } else {
        await db.insert(roomCleaningStatuses).values({
            roomId,
            status,
            lastCleanedAt: cleanedBy ? new Date() : undefined,
            lastCleanedBy: cleanedBy,
            lastInspectedAt: inspectedBy ? new Date() : undefined,
            lastInspectedBy: inspectedBy,
        });
    }
}

/**
 * Mark room as dirty (called after checkout)
 */
export async function markRoomDirty(roomId: string): Promise<void> {
    await updateRoomStatus(roomId, "DIRTY");
}

/**
 * Auto-generate checkout cleaning tasks for rooms being vacated today
 */
export async function autoGenerateCheckoutTasks(): Promise<number> {
    const session = await auth();
    if (!session?.user?.id) return 0;

    const hotel = await db.query.hotels.findFirst({
        where: eq(hotels.ownerId, session.user.id),
    });

    if (!hotel) return 0;

    // This would typically be called by a cron job or after checkout
    // For now, we'll just return 0 as this is placeholder logic
    // In a real implementation, you'd query bookings checking out today
    // and create tasks for those rooms

    return 0;
}
