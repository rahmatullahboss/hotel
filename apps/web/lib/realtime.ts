/**
 * Push events to the real-time WebSocket server
 * 
 * Call this from server actions when important events happen
 * (new booking, check-in, check-out, payment, etc.)
 */

export type RealtimeEventType =
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "GUEST_CHECKED_IN"
  | "GUEST_CHECKED_OUT"
  | "PAYMENT_RECEIVED"
  | "ROOM_STATUS_CHANGED";

interface PushEventOptions {
  type: RealtimeEventType;
  hotelId: string;
  data?: Record<string, unknown>;
}

const REALTIME_URL = process.env.REALTIME_URL || "https://realtime.digitalcare.site";
const AUTH_SECRET = process.env.REALTIME_AUTH_SECRET;

/**
 * Push an event to the real-time server
 * This will broadcast to all connected clients for that hotel
 */
export async function pushRealtimeEvent({ type, hotelId, data }: PushEventOptions): Promise<boolean> {
  try {
    const response = await fetch(`${REALTIME_URL}/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(AUTH_SECRET && { Authorization: `Bearer ${AUTH_SECRET}` }),
      },
      body: JSON.stringify({
        type,
        hotelId,
        data,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error("[Realtime] Push failed:", response.status);
      return false;
    }

    const result = await response.json();
    console.log(`[Realtime] Pushed ${type} to ${result.clients} clients`);
    return true;
  } catch (error) {
    // Don't fail the main action if realtime push fails
    console.error("[Realtime] Push error:", error);
    return false;
  }
}
