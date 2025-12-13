/**
 * Booking.com Channel Adapter
 *
 * Placeholder adapter for Booking.com Connectivity Partner API.
 *
 * REQUIREMENTS:
 * - Approved Connectivity Partner status (currently paused for new applications)
 * - PCI-DSS compliance for handling payment data
 * - OTA XML format (OpenTravel Alliance 2003B)
 *
 * Reference: https://connect.booking.com/
 */

import type { ChannelConnection, ChannelRoomMapping } from "@repo/db";
import type {
    ChannelAdapter,
    ChannelCredentials,
    ExternalBooking,
    SyncResult,
    InventoryUpdate,
    RateUpdate,
} from "../types";

/**
 * Booking.com Connectivity API Adapter
 * TODO: Implement after obtaining Connectivity Partner approval
 */
export const bookingComAdapter: ChannelAdapter = {
    channelType: "BOOKING_COM",

    async validateCredentials(credentials: ChannelCredentials) {
        // TODO: Implement Booking.com credential validation
        // Uses supply-xml.booking.com endpoint
        return {
            valid: false,
            errorMessage:
                "Booking.com integration requires Connectivity Partner approval. " +
                "Please apply at https://connect.booking.com/",
        };
    },

    async pushInventory(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: InventoryUpdate[]
    ): Promise<SyncResult> {
        return {
            success: false,
            operation: "PUSH_INVENTORY",
            errorMessage: "Booking.com adapter not yet implemented",
        };
    },

    async pushRates(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: RateUpdate[]
    ): Promise<SyncResult> {
        return {
            success: false,
            operation: "PUSH_RATES",
            errorMessage: "Booking.com adapter not yet implemented",
        };
    },

    async pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]> {
        console.warn("Booking.com adapter not yet implemented");
        return [];
    },

    parseWebhook(payload: unknown): ExternalBooking | null {
        console.warn("Booking.com webhook parsing not yet implemented");
        return null;
    },
};
