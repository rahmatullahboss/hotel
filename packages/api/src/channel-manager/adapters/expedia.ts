/**
 * Expedia Channel Adapter
 *
 * Placeholder adapter for Expedia Partner Solutions (EPS) Rapid API.
 *
 * REQUIREMENTS:
 * - Approved EPS Partner account
 * - API certification process
 * - Supports both Hotel Collect and Expedia Collect payment models
 *
 * Reference: https://developers.expediagroup.com/
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
 * Expedia EPS Rapid API Adapter
 * TODO: Implement after obtaining EPS Partner approval
 */
export const expediaAdapter: ChannelAdapter = {
    channelType: "EXPEDIA",

    async validateCredentials(credentials: ChannelCredentials) {
        // TODO: Implement Expedia credential validation
        return {
            valid: false,
            errorMessage:
                "Expedia integration requires EPS Partner approval. " +
                "Please apply at https://developers.expediagroup.com/",
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
            errorMessage: "Expedia adapter not yet implemented",
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
            errorMessage: "Expedia adapter not yet implemented",
        };
    },

    async pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]> {
        console.warn("Expedia adapter not yet implemented");
        return [];
    },

    parseWebhook(payload: unknown): ExternalBooking | null {
        console.warn("Expedia webhook parsing not yet implemented");
        return null;
    },
};
