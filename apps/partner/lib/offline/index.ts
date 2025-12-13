export {
    getDB,
    cacheBookings,
    getCachedBookings,
    getTodaysBookings,
    queueCheckInAction,
    getPendingActions,
    markActionSynced,
    incrementRetryCount,
    cleanupSyncedActions,
    getCacheAge,
    isCacheStale,
    type OfflineBooking,
    type PendingCheckIn,
} from './db';

export {
    syncPendingActions,
    isOnline,
    setupAutoSync,
    registerBackgroundSync,
} from './sync';
