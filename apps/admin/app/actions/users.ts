"use server";

import { db } from "@repo/db";
import { users, wallets, loyaltyPoints, bookings } from "@repo/db/schema";
import { eq, desc, count, ilike, or, and, sql, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Types
export interface UserStats {
    total: number;
    travelers: number;
    hotelOwners: number;
    partners: number;
    admins: number;
    newThisMonth: number;
}

export interface UserWithDetails {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
    role: string;
    createdAt: Date;
    walletBalance: number;
    loyaltyPoints: number;
    loyaltyTier: string;
    totalBookings: number;
}

export interface GetUsersParams {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedUsers {
    users: UserWithDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(): Promise<UserStats> {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        // Get all counts in parallel
        const [totalResult, roleResults, newUsersResult] = await Promise.all([
            db.select({ count: count() }).from(users),
            db
                .select({
                    role: users.role,
                    count: count(),
                })
                .from(users)
                .groupBy(users.role),
            db
                .select({ count: count() })
                .from(users)
                .where(gte(users.createdAt, monthStart)),
        ]);

        const roleCounts = roleResults.reduce(
            (acc: Record<string, number>, curr: typeof roleResults[number]) => {
                acc[curr.role] = curr.count;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            total: totalResult[0]?.count || 0,
            travelers: roleCounts["TRAVELER"] || 0,
            hotelOwners: roleCounts["HOTEL_OWNER"] || 0,
            partners: roleCounts["PARTNER"] || 0,
            admins: roleCounts["ADMIN"] || 0,
            newThisMonth: newUsersResult[0]?.count || 0,
        };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return {
            total: 0,
            travelers: 0,
            hotelOwners: 0,
            partners: 0,
            admins: 0,
            newThisMonth: 0,
        };
    }
}

/**
 * Get users with details, search, filter, and pagination
 */
export async function getUsersWithDetails(
    params: GetUsersParams = {}
): Promise<PaginatedUsers> {
    try {
        const { search = "", role = "", page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;

        // Build where conditions
        const conditions = [];

        if (search) {
            conditions.push(
                or(
                    ilike(users.name, `%${search}%`),
                    ilike(users.email, `%${search}%`)
                )
            );
        }

        if (role && role !== "ALL") {
            conditions.push(eq(users.role, role as any));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count
        const totalResult = await db
            .select({ count: count() })
            .from(users)
            .where(whereClause);

        const total = totalResult[0]?.count || 0;

        // Get users for current page
        const allUsers = await db
            .select()
            .from(users)
            .where(whereClause)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        // Get wallet and loyalty data for these users
        const userIds = allUsers.map((u: typeof allUsers[number]) => u.id);

        const [walletsData, loyaltyData, bookingsData] = await Promise.all([
            userIds.length > 0
                ? db.select().from(wallets).where(sql`${wallets.userId} IN ${userIds}`)
                : Promise.resolve([]),
            userIds.length > 0
                ? db
                    .select()
                    .from(loyaltyPoints)
                    .where(sql`${loyaltyPoints.userId} IN ${userIds}`)
                : Promise.resolve([]),
            userIds.length > 0
                ? db
                    .select({
                        userId: bookings.userId,
                        count: count(),
                    })
                    .from(bookings)
                    .where(sql`${bookings.userId} IN ${userIds}`)
                    .groupBy(bookings.userId)
                : Promise.resolve([]),
        ]);

        // Create lookup maps
        const walletMap = new Map(walletsData.map((w: typeof walletsData[number]) => [w.userId, w]));
        const loyaltyMap = new Map(loyaltyData.map((l: typeof loyaltyData[number]) => [l.userId, l]));
        const bookingsMap = new Map(bookingsData.map((b: typeof bookingsData[number]) => [b.userId, b.count]));

        // Combine data
        const usersWithDetails: UserWithDetails[] = allUsers.map((user: typeof allUsers[number]) => {
            const wallet = walletMap.get(user.id) as any;
            const loyalty = loyaltyMap.get(user.id) as any;
            const bookingCount = bookingsMap.get(user.id) || 0;

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                walletBalance: wallet ? Number(wallet.balance) : 0,
                loyaltyPoints: loyalty?.points || 0,
                loyaltyTier: loyalty?.tier || "BRONZE",
                totalBookings: bookingCount,
            };
        });

        return {
            users: usersWithDetails,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error("Error fetching users with details:", error);
        return {
            users: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };
    }
}

/**
 * Get all users for admin (legacy - kept for backwards compatibility)
 */
export async function getAdminUsers() {
    try {
        const allUsers = await db.query.users.findMany({
            orderBy: [desc(users.createdAt)],
        });
        return allUsers;
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return [];
    }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string) {
    try {
        await db
            .update(users)
            .set({ role: role as any, updatedAt: new Date() })
            .where(eq(users.id, userId));

        revalidatePath("/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update role" };
    }
}
