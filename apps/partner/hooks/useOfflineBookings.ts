"use client";

/**
 * React hook for accessing offline-cached bookings
 * with automatic sync when online
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getCachedBookings,
    cacheBookings,
    getTodaysBookings,
    getPendingActions,
    queueCheckInAction,
    isOnline,
    setupAutoSync,
    type OfflineBooking,
    type PendingCheckIn,
} from '@/lib/offline';

export interface UseOfflineBookingsResult {
    /** Cached bookings for offline access */
    bookings: OfflineBooking[];
    /** Bookings with check-in today */
    todaysBookings: OfflineBooking[];
    /** Pending check-in/out actions not yet synced */
    pendingActions: PendingCheckIn[];
    /** Whether the device is currently online */
    online: boolean;
    /** Whether data is loading */
    loading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh bookings from server */
    refresh: () => Promise<void>;
    /** Queue a check-in action (works offline) */
    checkIn: (bookingId: string) => Promise<void>;
    /** Queue a check-out action (works offline) */
    checkOut: (bookingId: string) => Promise<void>;
}

export function useOfflineBookings(): UseOfflineBookingsResult {
    const [bookings, setBookings] = useState<OfflineBooking[]>([]);
    const [todaysBookings, setTodaysBookings] = useState<OfflineBooking[]>([]);
    const [pendingActions, setPendingActions] = useState<PendingCheckIn[]>([]);
    const [online, setOnline] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load cached data
    const loadCachedData = useCallback(async () => {
        try {
            const [cached, todays, pending] = await Promise.all([
                getCachedBookings(),
                getTodaysBookings(),
                getPendingActions(),
            ]);
            setBookings(cached);
            setTodaysBookings(todays);
            setPendingActions(pending);
        } catch (err) {
            console.error('Failed to load cached data:', err);
        }
    }, []);

    // Refresh bookings from server
    const refresh = useCallback(async () => {
        if (!isOnline()) {
            setError('Cannot refresh while offline');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/bookings/today');
            if (!response.ok) throw new Error('Failed to fetch bookings');

            const data = await response.json();
            await cacheBookings(data.bookings);
            await loadCachedData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh');
        } finally {
            setLoading(false);
        }
    }, [loadCachedData]);

    // Queue check-in action
    const checkIn = useCallback(async (bookingId: string) => {
        await queueCheckInAction(bookingId, 'CHECK_IN');
        await loadCachedData();
    }, [loadCachedData]);

    // Queue check-out action
    const checkOut = useCallback(async (bookingId: string) => {
        await queueCheckInAction(bookingId, 'CHECK_OUT');
        await loadCachedData();
    }, [loadCachedData]);

    // Setup listeners
    useEffect(() => {
        setOnline(isOnline());

        // Load cached data initially
        loadCachedData().then(() => {
            // Try to refresh if online
            if (isOnline()) {
                refresh().finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for online/offline events
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Setup auto-sync
        const cleanupSync = setupAutoSync(async (result: { synced: number; failed: number; pending: number }) => {
            console.log('[useOfflineBookings] Sync completed:', result);
            await loadCachedData();
            // Refresh from server after sync
            if (isOnline()) {
                await refresh();
            }
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            cleanupSync();
        };
    }, [loadCachedData, refresh]);

    return {
        bookings,
        todaysBookings,
        pendingActions,
        online,
        loading,
        error,
        refresh,
        checkIn,
        checkOut,
    };
}
