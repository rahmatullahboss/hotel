/**
 * ShareTrip Channel Adapter
 *
 * Placeholder adapter for ShareTrip B2B integration.
 *
 * REQUIREMENTS:
 * - Direct partnership with ShareTrip
 * - No public API documentation available
 * - Contact: business@sharetrip.net
 *
 * Reference: https://sharetrip.net/partner
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
 * ShareTrip B2B Adapter
 * TODO: Implement after establishing B2B partnership
 */
export const sharetripAdapter: ChannelAdapter = {
    channelType: "SHARETRIP",

    async validateCredentials(credentials: ChannelCredentials) {
        return {
            valid: false,
            errorMessage:
                "ShareTrip integration requires direct B2B partnership. " +
                "Please contact business@sharetrip.net for API access.",
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
            errorMessage: "ShareTrip adapter pending partnership agreement",
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
            errorMessage: "ShareTrip adapter pending partnership agreement",
        };
    },

    async pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]> {
        console.warn("ShareTrip adapter pending partnership agreement");
        return [];
    },

    parseWebhook(payload: unknown): ExternalBooking | null {
        console.warn("ShareTrip webhook parsing not available");
        return null;
    },
};
