"use server";

import { db, supportTickets, ticketReplies, users, hotels } from "@repo/db";
import { eq, desc, and, count, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==================
// Types
// ==================

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface TicketWithDetails {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    userName: string | null;
    userEmail: string | null;
    hotelName: string | null;
    resolution: string | null;
    replyCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// ==================
// Get Functions
// ==================

/**
 * Get support dashboard stats
 */
export async function getSupportStats() {
    const allTickets = await db.query.supportTickets.findMany();

    const open = allTickets.filter((t) => t.status === "OPEN").length;
    const inProgress = allTickets.filter((t) => t.status === "IN_PROGRESS").length;
    const resolved = allTickets.filter((t) => t.status === "RESOLVED").length;
    const closed = allTickets.filter((t) => t.status === "CLOSED").length;

    const urgent = allTickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED" && t.status !== "RESOLVED").length;

    return {
        total: allTickets.length,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
    };
}

/**
 * Get all tickets with user and hotel info
 */
export async function getAllTickets(
    filter?: "all" | "open" | "in-progress" | "resolved" | "urgent"
): Promise<TicketWithDetails[]> {
    const allTickets = await db.query.supportTickets.findMany({
        with: {
            user: true,
            hotel: true,
            replies: true,
        },
        orderBy: desc(supportTickets.createdAt),
    });

    let filtered = allTickets;

    if (filter === "open") {
        filtered = allTickets.filter((t) => t.status === "OPEN");
    } else if (filter === "in-progress") {
        filtered = allTickets.filter((t) => t.status === "IN_PROGRESS");
    } else if (filter === "resolved") {
        filtered = allTickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");
    } else if (filter === "urgent") {
        filtered = allTickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED");
    }

    return filtered.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        userName: ticket.user?.name || null,
        userEmail: ticket.user?.email || null,
        hotelName: ticket.hotel?.name || null,
        resolution: ticket.resolution,
        replyCount: ticket.replies?.length || 0,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
    }));
}

/**
 * Get a single ticket with all replies
 */
export async function getTicketDetails(ticketId: string) {
    const ticket = await db.query.supportTickets.findFirst({
        where: eq(supportTickets.id, ticketId),
        with: {
            user: true,
            hotel: true,
            replies: {
                with: {
                    user: true,
                },
                orderBy: desc(ticketReplies.createdAt),
            },
        },
    });

    if (!ticket) return null;

    return {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        resolution: ticket.resolution,
        user: {
            name: ticket.user?.name,
            email: ticket.user?.email,
            phone: ticket.user?.phone,
        },
        hotel: ticket.hotel ? {
            name: ticket.hotel.name,
            city: ticket.hotel.city,
        } : null,
        replies: ticket.replies?.map((r) => ({
            id: r.id,
            message: r.message,
            isStaffReply: r.isStaffReply,
            userName: r.user?.name,
            createdAt: r.createdAt,
        })) || [],
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
    };
}

// ==================
// Ticket Actions
// ==================

/**
 * Update ticket status
 */
export async function updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    resolution?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(supportTickets)
            .set({
                status,
                resolution: status === "RESOLVED" || status === "CLOSED" ? resolution : undefined,
                resolvedAt: status === "RESOLVED" ? new Date() : undefined,
                updatedAt: new Date(),
            })
            .where(eq(supportTickets.id, ticketId));

        revalidatePath("/support");
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket:", error);
        return { success: false, error: "Failed to update ticket" };
    }
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
    ticketId: string,
    priority: TicketPriority
): Promise<{ success: boolean; error?: string }> {
    try {
        await db
            .update(supportTickets)
            .set({ priority, updatedAt: new Date() })
            .where(eq(supportTickets.id, ticketId));

        revalidatePath("/support");
        return { success: true };
    } catch (error) {
        console.error("Error updating priority:", error);
        return { success: false, error: "Failed to update priority" };
    }
}

/**
 * Add a reply to a ticket
 */
export async function addTicketReply(
    ticketId: string,
    message: string,
    userId: string = "admin"  // Would come from auth in real implementation
): Promise<{ success: boolean; error?: string }> {
    try {
        await db.insert(ticketReplies).values({
            ticketId,
            userId,
            message,
            isStaffReply: true,
        });

        // Update ticket status to in progress if it was open
        const ticket = await db.query.supportTickets.findFirst({
            where: eq(supportTickets.id, ticketId),
        });

        if (ticket?.status === "OPEN") {
            await db
                .update(supportTickets)
                .set({ status: "IN_PROGRESS", updatedAt: new Date() })
                .where(eq(supportTickets.id, ticketId));
        }

        revalidatePath("/support");
        return { success: true };
    } catch (error) {
        console.error("Error adding reply:", error);
        return { success: false, error: "Failed to add reply" };
    }
}

/**
 * Delete a ticket
 */
export async function deleteTicket(
    ticketId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await db.delete(supportTickets).where(eq(supportTickets.id, ticketId));
        revalidatePath("/support");
        return { success: true };
    } catch (error) {
        console.error("Error deleting ticket:", error);
        return { success: false, error: "Failed to delete ticket" };
    }
}
