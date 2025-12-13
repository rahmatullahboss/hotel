"use client";

import { useState } from "react";
import { FiBell, FiBellOff, FiSmartphone, FiAlertCircle } from "react-icons/fi";
import usePushNotifications from "../../hooks/usePushNotifications";

interface NotificationSettingsProps {
    onPreferencesChange?: (type: string, enabled: boolean) => Promise<void>;
}

export function NotificationSettings({ onPreferencesChange }: NotificationSettingsProps) {
    const {
        isSupported,
        isSubscribed,
        permission,
        isLoading,
        subscribe,
        unsubscribe,
    } = usePushNotifications();

    const [actionError, setActionError] = useState<string | null>(null);

    const handleToggle = async () => {
        setActionError(null);

        if (isSubscribed) {
            const result = await unsubscribe();
            if (!result.success) {
                setActionError(result.error || "Failed to disable notifications");
            }
        } else {
            const result = await subscribe();
            if (!result.success) {
                setActionError(result.error || "Failed to enable notifications");
            }
        }
    };

    // Platform doesn't support push notifications
    if (!isSupported) {
        return (
            <div className="notification-settings">
                <div className="notification-header">
                    <div className="notification-icon disabled">
                        <FiBellOff />
                    </div>
                    <div className="notification-info">
                        <h3>Push Notifications</h3>
                        <p className="notification-status">
                            Not supported on this device/browser
                        </p>
                    </div>
                </div>

                <style jsx>{`
                    .notification-settings {
                        padding: 1.25rem;
                        background: var(--color-bg-secondary);
                        border-radius: 0.75rem;
                    }
                    .notification-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    .notification-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.5rem;
                    }
                    .notification-icon.disabled {
                        background: var(--color-bg-tertiary);
                        color: var(--color-text-muted);
                    }
                    .notification-info h3 {
                        font-size: 1rem;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                    }
                    .notification-status {
                        font-size: 0.875rem;
                        color: var(--color-text-secondary);
                    }
                `}</style>
            </div>
        );
    }

    // Permission was denied
    if (permission === "denied") {
        return (
            <div className="notification-settings">
                <div className="notification-header">
                    <div className="notification-icon blocked">
                        <FiAlertCircle />
                    </div>
                    <div className="notification-info">
                        <h3>Push Notifications</h3>
                        <p className="notification-status">
                            Blocked in browser settings
                        </p>
                    </div>
                </div>
                <p className="notification-help">
                    To enable notifications, click the lock icon in your browser's address bar
                    and allow notifications for this site.
                </p>

                <style jsx>{`
                    .notification-settings {
                        padding: 1.25rem;
                        background: var(--color-bg-secondary);
                        border-radius: 0.75rem;
                    }
                    .notification-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }
                    .notification-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.5rem;
                    }
                    .notification-icon.blocked {
                        background: rgba(239, 68, 68, 0.1);
                        color: #ef4444;
                    }
                    .notification-info h3 {
                        font-size: 1rem;
                        font-weight: 600;
                        margin-bottom: 0.25rem;
                    }
                    .notification-status {
                        font-size: 0.875rem;
                        color: #ef4444;
                    }
                    .notification-help {
                        margin-top: 1rem;
                        padding: 0.75rem;
                        background: rgba(239, 68, 68, 0.05);
                        border-radius: 0.5rem;
                        font-size: 0.875rem;
                        color: var(--color-text-secondary);
                        line-height: 1.5;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="notification-settings">
            <div className="notification-header">
                <div className={`notification-icon ${isSubscribed ? "enabled" : "disabled"}`}>
                    {isSubscribed ? <FiBell /> : <FiBellOff />}
                </div>
                <div className="notification-info">
                    <h3>Push Notifications</h3>
                    <p className="notification-status">
                        {isSubscribed
                            ? "You'll receive alerts for new bookings and updates"
                            : "Enable to receive real-time alerts"}
                    </p>
                </div>
                <button
                    type="button"
                    className={`toggle-btn ${isSubscribed ? "on" : "off"}`}
                    onClick={handleToggle}
                    disabled={isLoading}
                    aria-label={isSubscribed ? "Disable notifications" : "Enable notifications"}
                >
                    <span className="toggle-slider" />
                </button>
            </div>

            {actionError && (
                <div className="notification-error">
                    <FiAlertCircle />
                    <span>{actionError}</span>
                </div>
            )}

            {isSubscribed && (
                <div className="notification-types">
                    <h4>Notification Types</h4>
                    <ul>
                        <li>
                            <FiSmartphone />
                            <span>New booking received</span>
                        </li>
                        <li>
                            <FiSmartphone />
                            <span>Booking cancellations</span>
                        </li>
                        <li>
                            <FiSmartphone />
                            <span>Check-in reminders</span>
                        </li>
                        <li>
                            <FiSmartphone />
                            <span>Payment confirmations</span>
                        </li>
                    </ul>
                </div>
            )}

            <style jsx>{`
                .notification-settings {
                    padding: 1.25rem;
                    background: var(--color-bg-secondary);
                    border-radius: 0.75rem;
                }
                .notification-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .notification-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
                .notification-icon.enabled {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                }
                .notification-icon.disabled {
                    background: var(--color-bg-tertiary);
                    color: var(--color-text-muted);
                }
                .notification-info {
                    flex: 1;
                }
                .notification-info h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .notification-status {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                }
                .toggle-btn {
                    width: 52px;
                    height: 28px;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.2s ease;
                    flex-shrink: 0;
                }
                .toggle-btn.off {
                    background: var(--color-bg-tertiary);
                }
                .toggle-btn.on {
                    background: #10b981;
                }
                .toggle-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .toggle-slider {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    background: white;
                    border-radius: 50%;
                    top: 2px;
                    transition: transform 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                }
                .toggle-btn.off .toggle-slider {
                    transform: translateX(2px);
                }
                .toggle-btn.on .toggle-slider {
                    transform: translateX(26px);
                }
                .notification-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 0.5rem;
                    color: #ef4444;
                    font-size: 0.875rem;
                }
                .notification-types {
                    margin-top: 1.25rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid var(--color-border);
                }
                .notification-types h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.75rem;
                }
                .notification-types ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .notification-types li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--color-text-primary);
                }
                .notification-types li :global(svg) {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                }
            `}</style>
        </div>
    );
}

export default NotificationSettings;
