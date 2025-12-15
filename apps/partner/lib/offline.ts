import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Booking } from '@repo/db';

const DB_NAME = 'partner-offline-db';
const DB_VERSION = 1;

export type OfflineBooking = Booking & {
    syncedAt: string;
};

export type PendingActionType = 'CHECK_IN' | 'CHECK_OUT';

export interface PendingCheckIn {
    id: string; // generated UUID
    bookingId: string;
    action: PendingActionType;
    timestamp: number;
    synced: boolean;
}

interface OfflineDB extends DBSchema {
    bookings: {
        key: string;
        value: OfflineBooking;
    };
    pendingActions: {
        key: string;
        value: PendingCheckIn;
        indexes: { 'by-booking': string };
    };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('bookings')) {
                    db.createObjectStore('bookings', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('pendingActions')) {
                    const store = db.createObjectStore('pendingActions', { keyPath: 'id' });
                    store.createIndex('by-booking', 'bookingId');
                }
            },
        });
    }
    return dbPromise;
}

export async function getCachedBookings(): Promise<OfflineBooking[]> {
    const db = await getDB();
    return db.getAll('bookings');
}

export async function cacheBookings(bookings: Booking[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('bookings', 'readwrite');
    const store = tx.objectStore('bookings');

    // Clear old data? Or merge? Strategy: Overwrite for now as it seems to be a cache refresh
    // For a robust offline app, maybe clearer logic is needed, but for build fix:
    await Promise.all(bookings.map(b => store.put({ ...b, syncedAt: new Date().toISOString() })));
    await tx.done;
}

export async function getTodaysBookings(): Promise<OfflineBooking[]> {
    const all = await getCachedBookings();
    const today = new Date().toISOString().split('T')[0];
    return all.filter(b => b.checkIn === today || b.checkOut === today);
}

export async function getPendingActions(): Promise<PendingCheckIn[]> {
    const db = await getDB();
    return db.getAll('pendingActions');
}

export async function queueCheckInAction(bookingId: string, action: PendingActionType): Promise<void> {
    const db = await getDB();
    const pendingAction: PendingCheckIn = {
        id: crypto.randomUUID(),
        bookingId,
        action,
        timestamp: Date.now(),
        synced: false,
    };
    await db.put('pendingActions', pendingAction);
}

export function isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function setupAutoSync(
    callback: (result: { synced: number; failed: number; pending: number }) => Promise<void>
): () => void {
    // Stub implementation for now
    const interval = setInterval(async () => {
        if (isOnline()) {
            // In a real app, we would process pending actions here
            // For now, just callback with empty stats to satisfy the type signature
            // and avoid build errors.
            // We need to implement the actual sync logic when the API is ready.
            try {
                const pending = await getPendingActions();
                if (pending.length > 0) {
                    // Verify if we can sync
                    // For now, we just pretend we did nothing
                    // await callback({ synced: 0, failed: 0, pending: pending.length });
                }
            } catch (e) {
                console.error("Auto sync error", e);
            }
        }
    }, 60000);

    return () => clearInterval(interval);
}
