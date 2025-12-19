"use server";

import { db } from "@repo/db";
import { hotelStaff, hotels, type PartnerRole } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { auth } from "../../auth";
import { ROLE_PERMISSIONS, type RolePermissions } from "../lib/permissions";

export interface PartnerRoleInfo {
    role: PartnerRole;
    hotelId: string;
    hotelName: string;
    permissions: RolePermissions;
    staffId: string;
}

/**
 * Get the current user's partner role for their hotel.
 * 
 * This handles two cases:
 * 1. Hotel owner (via hotels.ownerId) - Auto-creates OWNER staff entry if missing
 * 2. Staff member (via hotelStaff table) - Returns their assigned role
 * 
 * @returns Partner role info or null if user has no hotel access
 */
export async function getPartnerRole(): Promise<PartnerRoleInfo | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        const userId = session.user.id;

        // First, check if user is a hotel owner
        let ownedHotel;
        const cookieStore = await cookies();
        const storedHotelId = cookieStore.get("partner_hotel_id")?.value;

        if (storedHotelId) {
            // Check if user owns the selected hotel
            ownedHotel = await db.query.hotels.findFirst({
                where: and(eq(hotels.id, storedHotelId), eq(hotels.ownerId, userId)),
                columns: {
                    id: true,
                    name: true,
                },
            });
        }

        // Fallback: If no cookie or invalid cookie, get first hotel
        if (!ownedHotel) {
            ownedHotel = await db.query.hotels.findFirst({
                where: eq(hotels.ownerId, userId),
                columns: {
                    id: true,
                    name: true,
                },
            });
        }

        if (ownedHotel) {
            // Check if OWNER staff entry exists
            let staffEntry = await db.query.hotelStaff.findFirst({
                where: and(
                    eq(hotelStaff.hotelId, ownedHotel.id),
                    eq(hotelStaff.userId, userId),
                    eq(hotelStaff.role, "OWNER")
                ),
            });

            // Auto-create OWNER entry for hotel owner if missing (migration)
            if (!staffEntry) {
                const [newEntry] = await db
                    .insert(hotelStaff)
                    .values({
                        hotelId: ownedHotel.id,
                        userId: userId,
                        role: "OWNER",
                        status: "ACTIVE",
                        acceptedAt: new Date(),
                    })
                    .returning();
                staffEntry = newEntry;
            }

            return {
                role: "OWNER",
                hotelId: ownedHotel.id,
                hotelName: ownedHotel.name,
                permissions: ROLE_PERMISSIONS.OWNER,
                staffId: staffEntry?.id ?? "",
            };
        }

        // Check if user is a staff member
        // First check if they have access to the cookie-selected hotel
        let staffMembership;

        if (storedHotelId) {
            staffMembership = await db.query.hotelStaff.findFirst({
                where: and(
                    eq(hotelStaff.userId, userId),
                    eq(hotelStaff.hotelId, storedHotelId),
                    eq(hotelStaff.status, "ACTIVE")
                ),
                with: {
                    hotel: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }

        // Fallback: Get first active staff membership
        if (!staffMembership) {
            staffMembership = await db.query.hotelStaff.findFirst({
                where: and(
                    eq(hotelStaff.userId, userId),
                    eq(hotelStaff.status, "ACTIVE")
                ),
                with: {
                    hotel: {
                        columns: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }

        if (staffMembership && staffMembership.hotel) {
            const role = staffMembership.role as PartnerRole;
            return {
                role,
                hotelId: staffMembership.hotel.id,
                hotelName: staffMembership.hotel.name,
                permissions: ROLE_PERMISSIONS[role],
                staffId: staffMembership.id,
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting partner role:", error);
        return null;
    }
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permission: keyof RolePermissions): Promise<boolean> {
    const roleInfo = await getPartnerRole();
    if (!roleInfo) return false;
    return roleInfo.permissions[permission];
}

/**
 * Require a specific permission, throwing an error if not authorized
 */
export async function requirePermission(permission: keyof RolePermissions): Promise<PartnerRoleInfo> {
    const roleInfo = await getPartnerRole();
    if (!roleInfo) {
        throw new Error("Not authenticated as a hotel partner");
    }
    if (!roleInfo.permissions[permission]) {
        throw new Error(`Permission denied: ${permission}`);
    }
    return roleInfo;
}
