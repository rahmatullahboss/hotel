"use client";

import { useState, useRef, useEffect } from "react";
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";

interface Notification {
    id: string;
    type: "success" | "warning" | "error" | "info";
    title: string;
    message: string;
    time: string;
    read: boolean;
}

// Mock notifications - In production, these would come from an API
const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "success",
        title: "New Booking",
        message: "John Doe booked Room 101 for 3 nights",
        time: "5 min ago",
        read: false,
    },
    {
        id: "2",
        type: "warning",
        title: "Low Inventory",
        message: "Only 2 Deluxe rooms available for next weekend",
        time: "1 hour ago",
        read: false,
    },
    {
        id: "3",
        type: "info",
        title: "Rate Update",
        message: "Dynamic pricing adjusted rates by +15%",
        time: "3 hours ago",
        read: true,
    },
];

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return <FiCheck size={16} />;
            case "warning":
            case "error":
                return <FiAlertCircle size={16} />;
            default:
                return <FiInfo size={16} />;
        }
    };

    const getIconBg = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "rgba(16, 185, 129, 0.1)";
            case "warning":
                return "rgba(245, 158, 11, 0.1)";
            case "error":
                return "rgba(239, 68, 68, 0.1)";
            default:
                return "rgba(59, 130, 246, 0.1)";
        }
    };

    const getIconColor = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "var(--color-success)";
            case "warning":
                return "var(--color-warning)";
            case "error":
                return "var(--color-error)";
            default:
                return "var(--color-primary)";
        }
    };

    return (
        <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-icon btn-outline"
                style={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    position: "relative",
                }}
            >
                <FiBell size={18} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div
                    className="glass-card animate-scale-in"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: "360px",
                        maxHeight: "480px",
                        overflow: "hidden",
                        zIndex: 100,
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1rem",
                            borderBottom: "1px solid var(--color-border)",
                        }}
                    >
                        <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>Notifications</h3>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-primary)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--color-text-muted)",
                                    display: "flex",
                                }}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                        {notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    color: "var(--color-text-muted)",
                                }}
                            >
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    style={{
                                        display: "flex",
                                        gap: "0.75rem",
                                        padding: "0.875rem 1rem",
                                        borderBottom: "1px solid var(--color-border)",
                                        background: notification.read
                                            ? "transparent"
                                            : "rgba(59, 130, 246, 0.05)",
                                        cursor: "pointer",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            background: getIconBg(notification.type),
                                            color: getIconColor(notification.type),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {getIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: notification.read ? 400 : 600,
                                                fontSize: "0.875rem",
                                                marginBottom: "2px",
                                            }}
                                        >
                                            {notification.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.8125rem",
                                                color: "var(--color-text-secondary)",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {notification.message}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-muted)",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {notification.time}
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <div
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                background: "var(--color-primary)",
                                                flexShrink: 0,
                                                marginTop: "4px",
                                            }}
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderTop: "1px solid var(--color-border)",
                            textAlign: "center",
                        }}
                    >
                        <button
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--color-primary)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
