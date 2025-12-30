"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HiOutlineHome,
    HiOutlineBuildingOffice2,
    HiOutlineCalendarDays,
    HiOutlineUserGroup,
    HiOutlineCog6Tooth,
    HiOutlineChartBarSquare,
    HiOutlineGift,
    HiOutlineBanknotes,
    HiOutlineMegaphone,
    HiOutlineXMark,
    HiOutlineBellAlert,
    HiOutlineShieldCheck,
    HiOutlineStar,
    HiOutlineTicket
} from "react-icons/hi2";
import { IconType } from "react-icons";

interface MenuItem {
    name: string;
    href: string;
    icon: IconType;
    badge?: number;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", href: "/", icon: HiOutlineHome },
            { name: "Analytics", href: "/metrics", icon: HiOutlineChartBarSquare },
        ]
    },
    {
        title: "Management",
        items: [
            { name: "Hotels", href: "/hotels", icon: HiOutlineBuildingOffice2 },
            { name: "Bookings", href: "/bookings", icon: HiOutlineCalendarDays },
            { name: "Users", href: "/users", icon: HiOutlineUserGroup },
            { name: "Reviews", href: "/reviews", icon: HiOutlineStar },
        ]
    },
    {
        title: "Finance",
        items: [
            { name: "Payouts", href: "/payouts", icon: HiOutlineBanknotes },
            { name: "Commission", href: "/commission", icon: HiOutlineTicket },
        ]
    },
    {
        title: "Marketing",
        items: [
            { name: "Promotions", href: "/promotions", icon: HiOutlineGift },
            { name: "Incentives", href: "/incentives", icon: HiOutlineMegaphone },
        ]
    },
    {
        title: "Operations",
        items: [
            { name: "Notifications", href: "/notifications", icon: HiOutlineBellAlert },
            { name: "Suspensions", href: "/suspension", icon: HiOutlineShieldCheck },
            { name: "Settings", href: "/settings", icon: HiOutlineCog6Tooth },
        ]
    }
];

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    pendingCount?: number;
}

export function AdminSidebar({ isOpen = false, onClose, pendingCount = 0 }: AdminSidebarProps) {
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "0.5rem",
                            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "0.875rem"
                        }}>
                            ZR
                        </div>
                        <h1 className="sidebar-logo">Zinu Admin</h1>
                    </div>
                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <HiOutlineXMark size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuSections.map((section) => (
                        <div key={section.title} className="sidebar-section">
                            <div className="sidebar-section-title">{section.title}</div>
                            <ul className="sidebar-menu">
                                {section.items.map((item) => {
                                    const isActive =
                                        pathname === item.href ||
                                        (item.href !== "/" && pathname.startsWith(item.href));
                                    const Icon = item.icon;
                                    
                                    // Add pending badge for Hotels
                                    const showBadge = item.href === "/hotels" && pendingCount > 0;
                                    
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`sidebar-link ${isActive ? "active" : ""}`}
                                                onClick={onClose}
                                            >
                                                <Icon size={20} className="sidebar-link-icon" />
                                                {item.name}
                                                {showBadge && (
                                                    <span className="sidebar-badge">{pendingCount}</span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-stats">
                        <div className="sidebar-stat">
                            <div className="sidebar-stat-value">v2.0</div>
                            <div className="sidebar-stat-label">Version</div>
                        </div>
                    </div>
                    <div className="sidebar-version">ZinuRooms Admin Panel</div>
                </div>
            </aside>
        </>
    );
}
