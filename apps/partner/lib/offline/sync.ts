/**
 * Offline Sync Service
 * Handles syncing pending check-in/check-out actions when back online
 */

import {
    getPendingActions,
    markActionSynced,
    incrementRetryCount,
    cleanupSyncedActions,
    type PendingCheckIn,
} from './db';

const MAX_RETRIES = 3;

/**
 * Sync a single pending action to the server
 */
async function syncAction(action: PendingCheckIn): Promise<boolean> {
    try {
        const endpoint = action.action === 'CHECK_IN'
            ? '/api/bookings/check-in'
            : '/api/bookings/check-out';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: action.bookingId }),
        });

        if (!response.ok) {
            console.error(`Sync failed for ${action.id}:`, await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Sync error for ${action.id}:`, error);
        return false;
    }
}

/**
 * Sync all pending actions
 * Returns the number of successfully synced actions
 */
export async function syncPendingActions(): Promise<{
    synced: number;
    failed: number;
    pending: number;
}> {
    const actions = await getPendingActions();
    let synced = 0;
    let failed = 0;

    for (const action of actions) {
        // Skip if max retries exceeded
        if (action.retryCount >= MAX_RETRIES) {
            failed++;
            continue;
        }

        const success = await syncAction(action);

        if (success) {
            await markActionSynced(action.id);
            synced++;
        } else {
            await incrementRetryCount(action.id);
            if (action.retryCount + 1 >= MAX_RETRIES) {
                failed++;
            }
        }
    }

    // Clean up old synced actions
    await cleanupSyncedActions();

    const remaining = await getPendingActions();
    return {
        synced,
        failed,
        pending: remaining.length,
    };
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Listen for online/offline events and sync when back online
 */
export function setupAutoSync(onSyncComplete?: (result: Awaited<ReturnType<typeof syncPendingActions>>) => void): () => void {
    const handleOnline = async () => {
        console.log('[Offline Sync] Back online, syncing pending actions...');
        const result = await syncPendingActions();
        console.log('[Offline Sync] Sync complete:', result);
        onSyncComplete?.(result);
    };

    window.addEventListener('online', handleOnline);

    // Also sync immediately if we're online
    if (isOnline()) {
        syncPendingActions().then((result) => {
            if (result.synced > 0 || result.failed > 0) {
                console.log('[Offline Sync] Initial sync:', result);
                onSyncComplete?.(result);
            }
        });
    }

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline);
    };
}

/**
 * Register for background sync if available
 */
export async function registerBackgroundSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;
    if (!('sync' in ServiceWorkerRegistration.prototype)) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-checkins');
        return true;
    } catch (error) {
        console.error('[Offline Sync] Failed to register background sync:', error);
        return false;
    }
}
