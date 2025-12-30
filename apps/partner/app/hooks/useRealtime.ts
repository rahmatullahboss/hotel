"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Event types from server
export type EventType =
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "GUEST_CHECKED_IN"
  | "GUEST_CHECKED_OUT"
  | "PAYMENT_RECEIVED"
  | "ROOM_STATUS_CHANGED"
  | "CONNECTED"
  | "PONG";

export interface RealtimeEvent {
  type: EventType;
  hotelId?: string;
  data?: Record<string, unknown>;
  message?: string;
  timestamp: number;
}

interface UseRealtimeOptions {
  hotelId: string;
  onEvent?: (event: RealtimeEvent) => void;
  autoRefresh?: boolean; // Refresh page on certain events
}

// WebSocket URL - configure this in env
const WS_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "wss://realtime.zinurooms.com";

export function useRealtime({ hotelId, onEvent, autoRefresh = true }: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(`${WS_URL}/ws/${hotelId}`);

      ws.onopen = () => {
        console.log("[Realtime] Connected");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          setLastEvent(data);
          onEvent?.(data);

          // Auto-refresh dashboard on important events
          if (autoRefresh && ["NEW_BOOKING", "GUEST_CHECKED_IN", "GUEST_CHECKED_OUT", "PAYMENT_RECEIVED"].includes(data.type)) {
            router.refresh();
          }
        } catch {
          console.error("[Realtime] Failed to parse message");
        }
      };

      ws.onclose = () => {
        console.log("[Realtime] Disconnected, reconnecting in 5s...");
        setIsConnected(false);
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error("[Realtime] Error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[Realtime] Failed to connect:", error);
    }
  }, [hotelId, onEvent, autoRefresh, router]);

  // Send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "PING" }));
    }
  }, []);

  useEffect(() => {
    connect();

    // Keep alive ping every 30 seconds
    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect, sendPing]);

  return {
    isConnected,
    lastEvent,
  };
}
