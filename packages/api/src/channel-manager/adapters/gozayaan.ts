/**
 * Gozayaan Channel Adapter
 *
 * Placeholder adapter for Gozayaan B2B integration.
 *
 * REQUIREMENTS:
 * - Direct partnership with Gozayaan
 * - No public API documentation available
 * - Contact: info@gozayaan.com or +88 09678 332211
 *
 * Reference: https://gozayaan.com
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
 * Gozayaan B2B Adapter
 * TODO: Implement after establishing B2B partnership
 */
export const gozayaanAdapter: ChannelAdapter = {
    channelType: "GOZAYAAN",

    async validateCredentials(credentials: ChannelCredentials) {
        return {
            valid: false,
            errorMessage:
                "Gozayaan integration requires direct B2B partnership. " +
                "Please contact info@gozayaan.com for API access.",
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
            errorMessage: "Gozayaan adapter pending partnership agreement",
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
            errorMessage: "Gozayaan adapter pending partnership agreement",
        };
    },

    async pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]> {
        console.warn("Gozayaan adapter pending partnership agreement");
        return [];
    },

    parseWebhook(payload: unknown): ExternalBooking | null {
        console.warn("Gozayaan webhook parsing not available");
        return null;
    },
};
