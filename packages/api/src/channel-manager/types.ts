/**
 * Channel Manager - Types and Interfaces
 *
 * Core type definitions for the Channel Manager service,
 * including adapter interfaces and common types.
 */

import type {
    ChannelType,
    ChannelConnection,
    ChannelRoomMapping,
} from "@repo/db";

// ====================
// EXTERNAL BOOKING
// ====================

/**
 * Normalized booking data from external OTAs
 */
export interface ExternalBooking {
    externalBookingId: string;
    channelType: ChannelType;
    externalPropertyId: string;
    externalRoomTypeId: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    guestCount: number;
    totalAmount: number;
    currency: string;
    status: "CONFIRMED" | "CANCELLED" | "MODIFIED";
    rawPayload: Record<string, unknown>;
}

// ====================
// SYNC RESULTS
// ====================

export interface SyncResult {
    success: boolean;
    operation: "PUSH_INVENTORY" | "PULL_BOOKINGS" | "PUSH_RATES";
    affectedRooms?: string[];
    bookingsCreated?: string[];
    errorMessage?: string;
    rawResponse?: Record<string, unknown>;
}

// ====================
// DATE RANGE
// ====================

export interface DateRange {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

// ====================
// INVENTORY UPDATE
// ====================

export interface InventoryUpdate {
    roomId: string;
    externalRoomTypeId: string;
    date: string; // YYYY-MM-DD
    available: boolean;
    price?: number;
}

// ====================
// RATE UPDATE
// ====================

export interface RateUpdate {
    roomId: string;
    externalRoomTypeId: string;
    externalRatePlanId?: string;
    date: string; // YYYY-MM-DD
    price: number;
    currency?: string;
}

// ====================
// CREDENTIALS
// ====================

export interface ChannelCredentials {
    apiKey?: string;
    apiSecret?: string;
    propertyId?: string;
    accessToken?: string;
    refreshToken?: string;
    [key: string]: string | undefined;
}

// ====================
// CHANNEL ADAPTER INTERFACE
// ====================

/**
 * Interface that all OTA adapters must implement
 */
export interface ChannelAdapter {
    /**
     * Channel type this adapter handles
     */
    readonly channelType: ChannelType;

    /**
     * Validate OTA credentials by making a test API call
     */
    validateCredentials(credentials: ChannelCredentials): Promise<{
        valid: boolean;
        externalPropertyId?: string;
        errorMessage?: string;
    }>;

    /**
     * Push inventory/availability updates to the OTA
     */
    pushInventory(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: InventoryUpdate[]
    ): Promise<SyncResult>;

    /**
     * Push rate/pricing updates to the OTA
     */
    pushRates(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: RateUpdate[]
    ): Promise<SyncResult>;

    /**
     * Pull new/modified bookings from the OTA
     */
    pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]>;

    /**
     * Parse an incoming webhook payload into an ExternalBooking
     * Returns null if the payload is not a valid booking notification
     */
    parseWebhook(payload: unknown): ExternalBooking | null;
}

// ====================
// ADAPTER REGISTRY TYPE
// ====================

export type AdapterRegistry = Partial<Record<ChannelType, ChannelAdapter>>;
