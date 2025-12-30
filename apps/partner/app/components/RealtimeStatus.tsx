"use client";

import { useRealtime, RealtimeEvent } from "../hooks/useRealtime";
import { useCallback, useState } from "react";

/**
 * RealtimeStatus Component
 * 
 * Shows connection status indicator and handles real-time events.
 * Place this in the dashboard layout or page.
 */
export function RealtimeStatus({ hotelId }: { hotelId: string }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEvent = useCallback((event: RealtimeEvent) => {
    // Show toast notification for important events
    const messages: Record<string, string> = {
      NEW_BOOKING: "🎉 নতুন বুকিং এসেছে!",
      GUEST_CHECKED_IN: "✅ গেস্ট চেক-ইন করেছে",
      GUEST_CHECKED_OUT: "👋 গেস্ট চেক-আউট করেছে",
      PAYMENT_RECEIVED: "💰 পেমেন্ট পেয়েছেন",
    };

    const message = messages[event.type];
    if (message) {
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
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
        className="realtime-status"
        style={{
          position: "fixed",
          bottom: "calc(5rem + env(safe-area-inset-bottom) + 0.5rem)",
          left: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          background: isConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          color: isConnected ? "#16a34a" : "#dc2626",
          zIndex: 50,
        }}
      >
        <span
          className={isConnected ? "realtime-dot pulse" : "realtime-dot"}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isConnected ? "#22c55e" : "#ef4444",
          }}
        />
        {isConnected ? "Live" : "Offline"}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="realtime-toast"
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            padding: "1rem 1.5rem",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            fontSize: "0.875rem",
            fontWeight: 600,
            zIndex: 1000,
          }}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
