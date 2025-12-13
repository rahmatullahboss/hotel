"use client";

/**
 * Offline Indicator Component
 * Shows visual feedback when user is offline and pending sync count
 */

import { useState, useEffect } from 'react';
import { isOnline, getPendingActions, type PendingCheckIn } from '@/lib/offline';
import styles from './OfflineIndicator.module.css';

export function OfflineIndicator() {
    const [online, setOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        setOnline(isOnline());

        // Load pending count
        const loadPending = async () => {
            const pending = await getPendingActions();
            setPendingCount(pending.length);
        };
        loadPending();

        // Listen for online/offline events
        const handleOnline = () => {
            setOnline(true);
            setShowBanner(true);
            // Hide "Back Online" banner after 3 seconds
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodic check for pending actions
        const interval = setInterval(loadPending, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Show banner when offline or when there are pending actions
    const shouldShowBanner = showBanner || !online || pendingCount > 0;

    if (!shouldShowBanner) return null;

    return (
        <div className={`${styles.banner} ${online ? styles.online : styles.offline}`}>
            <div className={styles.content}>
                {!online ? (
                    <>
                        <span className={styles.icon}>📶</span>
                        <span className={styles.text}>
                            You are offline. Changes will sync when connected.
                        </span>
                    </>
                ) : pendingCount > 0 ? (
                    <>
                        <span className={styles.icon}>🔄</span>
                        <span className={styles.text}>
                            Syncing {pendingCount} pending action{pendingCount !== 1 ? 's' : ''}...
                        </span>
                    </>
                ) : (
                    <>
                        <span className={styles.icon}>✓</span>
                        <span className={styles.text}>Back online!</span>
                    </>
                )}
            </div>
        </div>
    );
}
