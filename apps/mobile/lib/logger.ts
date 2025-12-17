/**
 * Development-only logger utility
 *
 * This utility provides console logging that only works in development mode.
 * In production builds, all logs are silently ignored to prevent:
 * - Exposing sensitive user data (PII)
 * - Leaking authentication tokens
 * - Performance overhead from logging
 *
 * @example
 * import { devLog, devWarn, devError } from '@/lib/logger';
 *
 * devLog('User authenticated successfully');
 * devWarn('Rate limit approaching');
 * devError('Failed to fetch data', error);
 */

// Check if running in development mode
const isDev = __DEV__;

/**
 * Log a message to console (development only)
 */
export function devLog(...args: unknown[]): void {
    if (isDev) {
        console.log('[DEV]', ...args);
    }
}

/**
 * Log a warning to console (development only)
 */
export function devWarn(...args: unknown[]): void {
    if (isDev) {
        console.warn('[DEV]', ...args);
    }
}

/**
 * Log an error to console (development only)
 */
export function devError(...args: unknown[]): void {
    if (isDev) {
        console.error('[DEV]', ...args);
    }
}

/**
 * Log debug information with a specific tag (development only)
 */
export function devDebug(tag: string, ...args: unknown[]): void {
    if (isDev) {
        console.log(`[DEV:${tag}]`, ...args);
    }
}

/**
 * Log performance timing (development only)
 */
export function devTime(label: string): void {
    if (isDev) {
        console.time(`[DEV] ${label}`);
    }
}

export function devTimeEnd(label: string): void {
    if (isDev) {
        console.timeEnd(`[DEV] ${label}`);
    }
}

/**
 * Log a group of related messages (development only)
 */
export function devGroup(label: string, fn: () => void): void {
    if (isDev) {
        console.group(`[DEV] ${label}`);
        fn();
        console.groupEnd();
    }
}

/**
 * Production-safe error reporter
 * This can be expanded to send errors to a crash reporting service
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
    // Always log errors in development
    if (isDev) {
        console.error('[ERROR]', error.message, context);
        console.error(error.stack);
    }

    // TODO: In production, send to error tracking service (e.g., Sentry)
    // if (!isDev) {
    //     Sentry.captureException(error, { extra: context });
    // }
}

export default {
    log: devLog,
    warn: devWarn,
    error: devError,
    debug: devDebug,
    time: devTime,
    timeEnd: devTimeEnd,
    group: devGroup,
    reportError,
};
