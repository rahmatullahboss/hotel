"use client";

import { useState, useEffect, useCallback } from "react";

interface PushNotificationState {
    isSupported: boolean;
    isSubscribed: boolean;
    permission: NotificationPermission | "default";
    isLoading: boolean;
}

/**
 * Hook for managing push notification subscriptions
 */
export function usePushNotifications() {
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        isSubscribed: false,
        permission: "default",
        isLoading: true,
    });

    // Check if push notifications are supported and get current status
    useEffect(() => {
        const checkSupport = async () => {
            // Check if push notifications are supported
            const isSupported =
                typeof window !== "undefined" &&
                "serviceWorker" in navigator &&
                "PushManager" in window &&
                "Notification" in window;

            if (!isSupported) {
                setState({
                    isSupported: false,
                    isSubscribed: false,
                    permission: "default",
                    isLoading: false,
                });
                return;
            }

            // Get current permission status
            const permission = Notification.permission;

            // Check if already subscribed
            let isSubscribed = false;
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                isSubscribed = subscription !== null;
            } catch (error) {
                console.error("Error checking subscription:", error);
            }

            setState({
                isSupported: true,
                isSubscribed,
                permission,
                isLoading: false,
            });
        };

        checkSupport();
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (!state.isSupported) {
            return { success: false, error: "Push notifications not supported" };
        }

        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            // Request permission if needed
            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") {
                    setState((prev) => ({
                        ...prev,
                        permission,
                        isLoading: false,
                    }));
                    return { success: false, error: "Permission denied" };
                }
            }

            if (Notification.permission === "denied") {
                setState((prev) => ({ ...prev, isLoading: false }));
                return { success: false, error: "Notifications blocked. Enable in browser settings." };
            }

            // Get VAPID public key from environment
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey) {
                setState((prev) => ({ ...prev, isLoading: false }));
                return { success: false, error: "Push notifications not configured" };
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
            });

            // Send subscription to server
            const response = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    deviceName: getDeviceName(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save subscription");
            }

            setState((prev) => ({
                ...prev,
                isSubscribed: true,
                permission: "granted",
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            console.error("Error subscribing to push:", error);
            setState((prev) => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to subscribe",
            };
        }
    }, [state.isSupported]);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Unsubscribe from browser
                await subscription.unsubscribe();

                // Notify server
                await fetch("/api/push/unsubscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
            }

            setState((prev) => ({
                ...prev,
                isSubscribed: false,
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            console.error("Error unsubscribing:", error);
            setState((prev) => ({ ...prev, isLoading: false }));
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to unsubscribe",
            };
        }
    }, []);

    return {
        ...state,
        subscribe,
        unsubscribe,
    };
}

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Get device/browser name for subscription labeling
function getDeviceName(): string {
    const userAgent = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    // Detect browser
    if (userAgent.includes("Firefox")) {
        browser = "Firefox";
    } else if (userAgent.includes("Chrome")) {
        browser = "Chrome";
    } else if (userAgent.includes("Safari")) {
        browser = "Safari";
    } else if (userAgent.includes("Edge")) {
        browser = "Edge";
    }

    // Detect OS
    if (userAgent.includes("Windows")) {
        os = "Windows";
    } else if (userAgent.includes("Mac OS")) {
        os = "macOS";
    } else if (userAgent.includes("Android")) {
        os = "Android";
    } else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
        os = "iOS";
    } else if (userAgent.includes("Linux")) {
        os = "Linux";
    }

    return `${browser} on ${os}`;
}

export default usePushNotifications;
