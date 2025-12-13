/**
 * Offline Database using IndexedDB
 * Stores today's bookings and pending check-in operations for offline access
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Types for offline storage
export interface OfflineBooking {
    id: string;
    guestName: string;
    guestPhone: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    status: string;
    hotelId: string;
    cachedAt: number;
}

export interface PendingCheckIn {
    id: string;
    bookingId: string;
    action: 'CHECK_IN' | 'CHECK_OUT';
    timestamp: number;
    synced: boolean;
    retryCount: number;
}

interface VibeOfflineDB extends DBSchema {
    bookings: {
        key: string;
        value: OfflineBooking;
        indexes: { 'by-checkin': string; 'by-status': string };
    };
    pendingActions: {
        key: string;
        value: PendingCheckIn;
        indexes: { 'by-synced': number };
    };
}

const DB_NAME = 'vibe-offline-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<VibeOfflineDB> | null = null;

/**
 * Get or create the IndexedDB database instance
 */
export async function getDB(): Promise<IDBPDatabase<VibeOfflineDB>> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB<VibeOfflineDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Create bookings store
            if (!db.objectStoreNames.contains('bookings')) {
                const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
                bookingStore.createIndex('by-checkin', 'checkIn');
                bookingStore.createIndex('by-status', 'status');
            }

            // Create pending actions store
            if (!db.objectStoreNames.contains('pendingActions')) {
                const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
                actionsStore.createIndex('by-synced', 'synced');
            }
        },
    });

    return dbInstance;
}

/**
 * Cache today's bookings for offline access
 */
export async function cacheBookings(bookings: OfflineBooking[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('bookings', 'readwrite');

    // Clear old cached bookings
    await tx.store.clear();

    // Add new bookings with cache timestamp
    const now = Date.now();
    for (const booking of bookings) {
        await tx.store.put({ ...booking, cachedAt: now });
    }

    await tx.done;
}

/**
 * Get cached bookings
 */
export async function getCachedBookings(): Promise<OfflineBooking[]> {
    const db = await getDB();
    return db.getAll('bookings');
}

/**
 * Get bookings for today (check-in date is today)
 */
export async function getTodaysBookings(): Promise<OfflineBooking[]> {
    const db = await getDB();
    const allBookings = await db.getAll('bookings');

    const today = new Date().toISOString().split('T')[0] ?? '';
    return allBookings.filter(b => b.checkIn.startsWith(today));
}

/**
 * Queue a check-in/check-out action for background sync
 */
export async function queueCheckInAction(
    bookingId: string,
    action: 'CHECK_IN' | 'CHECK_OUT'
): Promise<string> {
    const db = await getDB();
    const id = crypto.randomUUID();

    await db.put('pendingActions', {
        id,
        bookingId,
        action,
        timestamp: Date.now(),
        synced: false,
        retryCount: 0,
    });

    // Update local booking status optimistically
    // The bookingId parameter is already typed as string, ensuring it's not null/undefined.
    // The result of db.get might be undefined, which is handled by the 'if (booking)' check.
    const booking = await db.get('bookings', bookingId);
    if (booking) {
        await db.put('bookings', {
            ...booking,
            status: action === 'CHECK_IN' ? 'CHECKED_IN' : 'CHECKED_OUT',
        });
    }

    // Request background sync if available
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-checkins');
    }

    return id;
}

/**
 * Get all pending actions that need to be synced
 */
export async function getPendingActions(): Promise<PendingCheckIn[]> {
    const db = await getDB();
    const allActions = await db.getAll('pendingActions');
    return allActions.filter(a => !a.synced);
}

/**
 * Mark an action as synced
 */
export async function markActionSynced(actionId: string): Promise<void> {
    const db = await getDB();
    const action = await db.get('pendingActions', actionId);
    if (action) {
        await db.put('pendingActions', { ...action, synced: true });
    }
}

/**
 * Increment retry count for failed sync
 */
export async function incrementRetryCount(actionId: string): Promise<void> {
    const db = await getDB();
    const action = await db.get('pendingActions', actionId);
    if (action) {
        await db.put('pendingActions', {
            ...action,
            retryCount: action.retryCount + 1
        });
    }
}

/**
 * Clean up old synced actions (keep for 24 hours)
 */
export async function cleanupSyncedActions(): Promise<void> {
    const db = await getDB();
    const allActions = await db.getAll('pendingActions');
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const action of allActions) {
        if (action.synced && action.timestamp < oneDayAgo) {
            await db.delete('pendingActions', action.id);
        }
    }
}

/**
 * Get cache age in milliseconds
 */
export async function getCacheAge(): Promise<number | null> {
    const db = await getDB();
    const bookings = await db.getAll('bookings');

    if (bookings.length === 0) return null;

    const oldestCache = Math.min(...bookings.map(b => b.cachedAt));
    return Date.now() - oldestCache;
}

/**
 * Check if cache is stale (older than 5 minutes)
 */
export async function isCacheStale(): Promise<boolean> {
    const age = await getCacheAge();
    if (age === null) return true;
    return age > 5 * 60 * 1000; // 5 minutes
}
