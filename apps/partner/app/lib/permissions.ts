/**
 * Role-Based Access Control (RBAC) Permissions Configuration
 * 
 * Defines what each partner role can access in the application.
 */

import type { PartnerRole } from "@repo/db";

export interface RolePermissions {
    // Financial Access
    canViewEarnings: boolean;
    canRequestPayout: boolean;
    canManageBankDetails: boolean;

    // Staff Management
    canManageStaff: boolean;
    canViewStaffPerformance: boolean;  // View activity logs & metrics
    canManageAttendance: boolean;      // Clock in/out, handover

    // Hotel Settings
    canEditHotelProfile: boolean;
    canManagePhotos: boolean;

    // Operations
    canManageInventory: boolean;
    canManagePricing: boolean;
    canCheckIn: boolean;
    canCheckOut: boolean;
    canViewBookings: boolean;
    canRecordWalkIn: boolean;

    // Analytics
    canViewAnalytics: boolean;

    // Channels
    canManageChannels: boolean;
}

export const ROLE_PERMISSIONS: Record<PartnerRole, RolePermissions> = {
    OWNER: {
        // Full access to everything
        canViewEarnings: true,
        canRequestPayout: true,
        canManageBankDetails: true,
        canManageStaff: true,
        canViewStaffPerformance: true,
        canManageAttendance: true,
        canEditHotelProfile: true,
        canManagePhotos: true,
        canManageInventory: true,
        canManagePricing: true,
        canCheckIn: true,
        canCheckOut: true,
        canViewBookings: true,
        canRecordWalkIn: true,
        canViewAnalytics: true,
        canManageChannels: true,
    },
    MANAGER: {
        // Operations access, no financials
        canViewEarnings: false,
        canRequestPayout: false,
        canManageBankDetails: false,
        canManageStaff: false,
        canViewStaffPerformance: true,
        canManageAttendance: true,
        canEditHotelProfile: true, // Can edit basic hotel info
        canManagePhotos: true,
        canManageInventory: true,
        canManagePricing: true,
        canCheckIn: true,
        canCheckOut: true,
        canViewBookings: true,
        canRecordWalkIn: true,
        canViewAnalytics: true,
        canManageChannels: false, // Channel config is owner-only
    },
    RECEPTIONIST: {
        // Front desk operations only
        canViewEarnings: false,
        canRequestPayout: false,
        canManageBankDetails: false,
        canManageStaff: false,
        canViewStaffPerformance: false, // Can't see others' performance
        canManageAttendance: true,      // Can clock in/out themselves
        canEditHotelProfile: false,
        canManagePhotos: false,
        canManageInventory: false,
        canManagePricing: false,
        canCheckIn: true,
        canCheckOut: true,
        canViewBookings: true, // Can view bookings for check-in
        canRecordWalkIn: true, // Can record walk-in guests
        canViewAnalytics: false,
        canManageChannels: false,
    },
};

/**
 * Route-level protection mapping
 * Defines which roles can access which routes
 */
export const PROTECTED_ROUTES: Record<string, PartnerRole[]> = {
    "/earnings": ["OWNER"],
    "/settings/staff": ["OWNER"],
    "/channels": ["OWNER"],
    "/pricing": ["OWNER", "MANAGER"],
    "/inventory": ["OWNER", "MANAGER"],
    "/settings/profile": ["OWNER", "MANAGER"],
    "/settings/photos": ["OWNER", "MANAGER"],
    "/analytics": ["OWNER", "MANAGER"],
    // Staff performance is accessible by all (with different views)
    // All roles can access: /, /scanner, /walkin, /bookings, /staff-performance
};

/**
 * Check if a role has access to a specific route
 */
export function canAccessRoute(role: PartnerRole, pathname: string): boolean {
    // Find the most specific matching route
    const matchingRoute = Object.keys(PROTECTED_ROUTES)
        .filter(route => pathname.startsWith(route))
        .sort((a, b) => b.length - a.length)[0];

    if (!matchingRoute) {
        // Route not in protected list = accessible by all roles
        return true;
    }

    return PROTECTED_ROUTES[matchingRoute]?.includes(role) ?? true;
}

/**
 * Get permissions for a role
 */
export function getPermissions(role: PartnerRole): RolePermissions {
    return ROLE_PERMISSIONS[role];
}
