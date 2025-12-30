"use client";

import { useRealtime, RealtimeEvent } from "../hooks/useRealtime";
import { useCallback, useState, useEffect } from "react";

/**
 * RealtimeStatus Component
 * 
 * Shows connection status indicator and handles real-time events.
 */
export function RealtimeStatus({ hotelId }: { hotelId: string }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEvent = useCallback((event: RealtimeEvent) => {
    // Show toast notification for important events
    const messages: Record<string, string> = {
      NEW_BOOKING: "🎉 New booking received!",
      GUEST_CHECKED_IN: "✅ Guest checked in",
      GUEST_CHECKED_OUT: "👋 Guest checked out",
      PAYMENT_RECEIVED: "💰 Payment received",
      ROOM_CLEANED: "✨ Room marked as clean",
    };

    const message = messages[event.type];
    if (message) {
      setToastMessage(message);
      setShowToast(true);
      // Auto hide after 4 seconds
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const { isConnected } = useRealtime({
    hotelId,
    onEvent: handleEvent,
    autoRefresh: true,
  });

  return (
    <>
      {/* Connection Status Indicator */}
      <div 
        className={`
          fixed bottom-20 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-sm backdrop-blur-md border transition-all duration-300
          ${isConnected 
            ? "bg-green-500/10 text-green-700 border-green-200" 
            : "bg-red-500/10 text-red-700 border-red-200 animate-pulse"
          }
        `}
      >
        <div 
          className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
        />
        {isConnected ? "Live Updates On" : "Reconnecting..."}
      </div>

      {/* Toast Notification */}
      <div 
        className={`
          fixed top-4 right-4 z-[100] bg-white px-6 py-4 rounded-xl shadow-2xl border border-gray-100 flex items-center gap-3 transform transition-all duration-500 ease-spring
          ${showToast ? "translate-y-0 opacity-100 scale-100" : "-translate-y-20 opacity-0 scale-95 pointer-events-none"}
        `}
      >
        <span className="text-xl">🔔</span>
        <div>
          <p className="text-sm font-bold text-gray-900">{toastMessage}</p>
          <p className="text-xs text-gray-500 mt-0.5">Just now</p>
        </div>
      </div>
    </>
  );
}
