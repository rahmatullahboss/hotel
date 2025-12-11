"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Hotels", href: "/hotels", icon: "🏨" },
    { name: "Rooms", href: "/rooms", icon: "🛏️" },
    { name: "Bookings", href: "/bookings", icon: "📅" },
    { name: "Promotions", href: "/promotions", icon: "🎁" },
    { name: "Users", href: "/users", icon: "👥" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <h1 className="sidebar-logo">Admin Panel</h1>
                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`sidebar-link ${isActive ? "active" : ""}`}
                                        onClick={onClose}
                                    >
                                        <span className="sidebar-link-icon">{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-version">Vibe Admin v1.0.0</div>
                </div>
            </aside>
        </>
    );
}
