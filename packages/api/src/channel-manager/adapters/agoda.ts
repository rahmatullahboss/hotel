/**
 * Agoda Channel Adapter
 *
 * Implements the ChannelAdapter interface for Agoda YCS API integration.
 * Reference: https://agodaconnectivity.com
 *
 * Note: This is a base implementation. Full integration requires:
 * 1. Agoda Connectivity Partner account
 * 2. API certification process
 * 3. Sandbox testing before production
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

// Agoda YCS API endpoints
const AGODA_API_BASE = "https://api.agoda.io/ycs/v2";
const AGODA_SANDBOX_BASE = "https://sandbox-api.agoda.io/ycs/v2";

// Use sandbox in development
const API_BASE =
    process.env.NODE_ENV === "production" ? AGODA_API_BASE : AGODA_SANDBOX_BASE;

/**
 * Agoda YCS API Adapter
 */
export const agodaAdapter: ChannelAdapter = {
    channelType: "AGODA",

    /**
     * Validate Agoda API credentials
     */
    async validateCredentials(credentials: ChannelCredentials) {
        try {
            const { apiKey, propertyId } = credentials;

            if (!apiKey || !propertyId) {
                return {
                    valid: false,
                    errorMessage: "API Key and Property ID are required",
                };
            }

            // Make a test API call to validate credentials
            // Using GetProduct endpoint to verify access
            const response = await fetch(`${API_BASE}/GetProduct`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    propertyId: propertyId,
                }),
            });

            if (response.ok) {
                return {
                    valid: true,
                    externalPropertyId: propertyId,
                };
            }

            const errorData = await response.json().catch(() => ({}));
            return {
                valid: false,
                errorMessage:
                    errorData.message ||
                    `Validation failed with status ${response.status}`,
            };
        } catch (error) {
            console.error("Agoda credential validation error:", error);
            return {
                valid: false,
                errorMessage:
                    error instanceof Error ? error.message : "Connection failed",
            };
        }
    },

    /**
     * Push inventory/availability to Agoda
     * Uses SetAriV2 endpoint for bulk availability updates
     */
    async pushInventory(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: InventoryUpdate[]
    ): Promise<SyncResult> {
        try {
            const credentials = connection.apiCredentials as ChannelCredentials;
            if (!credentials.apiKey) {
                return {
                    success: false,
                    operation: "PUSH_INVENTORY",
                    errorMessage: "Missing API credentials",
                };
            }

            // Group updates by room type for efficient API calls
            const updatesByRoom = updates.reduce(
                (acc, update) => {
                    if (!acc[update.externalRoomTypeId]) {
                        acc[update.externalRoomTypeId] = [];
                    }
                    acc[update.externalRoomTypeId]!.push(update);
                    return acc;
                },
                {} as Record<string, InventoryUpdate[]>
            );

            // Build SetAriV2 request payload
            // Agoda uses a specific XML/JSON format for ARI updates
            const ariUpdates = Object.entries(updatesByRoom).map(
                ([roomTypeId, roomUpdates]) => ({
                    roomTypeId,
                    dateRanges: roomUpdates.map((u) => ({
                        date: u.date,
                        availability: u.available ? 1 : 0,
                        price: u.price,
                    })),
                })
            );

            const requestPayload = {
                propertyId: connection.externalPropertyId,
                ariUpdates,
            };

            const response = await fetch(`${API_BASE}/SetAriV2`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${credentials.apiKey}`,
                },
                body: JSON.stringify(requestPayload),
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.ok) {
                return {
                    success: true,
                    operation: "PUSH_INVENTORY",
                    affectedRooms: updates.map((u) => u.roomId),
                    rawResponse: responseData,
                };
            }

            return {
                success: false,
                operation: "PUSH_INVENTORY",
                errorMessage:
                    responseData.message || `API error: ${response.status}`,
                rawResponse: responseData,
            };
        } catch (error) {
            console.error("Agoda pushInventory error:", error);
            return {
                success: false,
                operation: "PUSH_INVENTORY",
                errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    },

    /**
     * Push rates to Agoda
     * Uses SetAriV2 endpoint with pricing data
     */
    async pushRates(
        connection: ChannelConnection,
        roomMappings: ChannelRoomMapping[],
        updates: RateUpdate[]
    ): Promise<SyncResult> {
        try {
            const credentials = connection.apiCredentials as ChannelCredentials;
            if (!credentials.apiKey) {
                return {
                    success: false,
                    operation: "PUSH_RATES",
                    errorMessage: "Missing API credentials",
                };
            }

            // Group updates by room type
            const updatesByRoom = updates.reduce(
                (acc, update) => {
                    if (!acc[update.externalRoomTypeId]) {
                        acc[update.externalRoomTypeId] = [];
                    }
                    acc[update.externalRoomTypeId]!.push(update);
                    return acc;
                },
                {} as Record<string, RateUpdate[]>
            );

            const rateUpdates = Object.entries(updatesByRoom).map(
                ([roomTypeId, roomUpdates]) => ({
                    roomTypeId,
                    rates: roomUpdates.map((u) => ({
                        date: u.date,
                        price: u.price,
                        currency: u.currency || "BDT",
                        ratePlanId: u.externalRatePlanId,
                    })),
                })
            );

            const requestPayload = {
                propertyId: connection.externalPropertyId,
                rateUpdates,
            };

            const response = await fetch(`${API_BASE}/SetAriV2`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${credentials.apiKey}`,
                },
                body: JSON.stringify(requestPayload),
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.ok) {
                return {
                    success: true,
                    operation: "PUSH_RATES",
                    affectedRooms: updates.map((u) => u.roomId),
                    rawResponse: responseData,
                };
            }

            return {
                success: false,
                operation: "PUSH_RATES",
                errorMessage:
                    responseData.message || `API error: ${response.status}`,
                rawResponse: responseData,
            };
        } catch (error) {
            console.error("Agoda pushRates error:", error);
            return {
                success: false,
                operation: "PUSH_RATES",
                errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
            };
        }
    },

    /**
     * Pull bookings from Agoda
     * Uses GetBookingList endpoint
     */
    async pullBookings(
        connection: ChannelConnection,
        since: Date
    ): Promise<ExternalBooking[]> {
        try {
            const credentials = connection.apiCredentials as ChannelCredentials;
            if (!credentials.apiKey) {
                console.error("Missing Agoda API credentials");
                return [];
            }

            const response = await fetch(`${API_BASE}/GetBookingList`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${credentials.apiKey}`,
                },
                body: JSON.stringify({
                    propertyId: connection.externalPropertyId,
                    modifiedSince: since.toISOString(),
                }),
            });

            if (!response.ok) {
                console.error(
                    `Agoda GetBookingList failed: ${response.status}`
                );
                return [];
            }

            const data = await response.json();
            const bookings = data.bookings || [];

            // Transform Agoda booking format to our ExternalBooking format
            return bookings.map(
                (booking: Record<string, unknown>): ExternalBooking => ({
                    externalBookingId: String(booking.bookingId),
                    channelType: "AGODA",
                    externalPropertyId: String(connection.externalPropertyId),
                    externalRoomTypeId: String(booking.roomTypeId),
                    checkIn: String(booking.checkInDate),
                    checkOut: String(booking.checkOutDate),
                    guestName: String(booking.guestName || "Guest"),
                    guestEmail: booking.guestEmail
                        ? String(booking.guestEmail)
                        : undefined,
                    guestPhone: booking.guestPhone
                        ? String(booking.guestPhone)
                        : undefined,
                    guestCount: Number(booking.numberOfGuests) || 1,
                    totalAmount: Number(booking.totalAmount) || 0,
                    currency: String(booking.currency || "BDT"),
                    status: mapAgodaStatus(String(booking.status)),
                    rawPayload: booking as Record<string, unknown>,
                })
            );
        } catch (error) {
            console.error("Agoda pullBookings error:", error);
            return [];
        }
    },

    /**
     * Parse incoming Agoda webhook
     */
    parseWebhook(payload: unknown): ExternalBooking | null {
        try {
            const data = payload as Record<string, unknown>;

            // Agoda webhook structure validation
            if (!data.bookingId || !data.propertyId) {
                return null;
            }

            return {
                externalBookingId: String(data.bookingId),
                channelType: "AGODA",
                externalPropertyId: String(data.propertyId),
                externalRoomTypeId: String(data.roomTypeId),
                checkIn: String(data.checkInDate),
                checkOut: String(data.checkOutDate),
                guestName: String(data.guestName || "Guest"),
                guestEmail: data.guestEmail ? String(data.guestEmail) : undefined,
                guestPhone: data.guestPhone ? String(data.guestPhone) : undefined,
                guestCount: Number(data.numberOfGuests) || 1,
                totalAmount: Number(data.totalAmount) || 0,
                currency: String(data.currency || "BDT"),
                status: mapAgodaStatus(String(data.status)),
                rawPayload: data,
            };
        } catch (error) {
            console.error("Agoda parseWebhook error:", error);
            return null;
        }
    },
};

/**
 * Map Agoda booking status to our internal status
 */
function mapAgodaStatus(
    agodaStatus: string
): "CONFIRMED" | "CANCELLED" | "MODIFIED" {
    const statusMap: Record<string, "CONFIRMED" | "CANCELLED" | "MODIFIED"> = {
        CONFIRMED: "CONFIRMED",
        CANCELLED: "CANCELLED",
        MODIFIED: "MODIFIED",
        NEW: "CONFIRMED",
        PENDING: "CONFIRMED",
    };
    return statusMap[agodaStatus.toUpperCase()] || "CONFIRMED";
}
