"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid,
    FiCalendar,
    FiHome,
    FiDollarSign,
    FiTag,
    FiPackage,
    FiTool,
    FiStar,
    FiDroplet,
    FiTrendingUp,
    FiUsers,
    FiFileText,
    FiSettings,
    FiHelpCircle,
} from "react-icons/fi";

interface OyoSidebarProps {
    hotelName?: string;
}

const navItems = [
    { href: "/", label: "Dashboard", icon: FiGrid },
    { href: "/bookings", label: "Bookings", icon: FiCalendar },
    { href: "/rooms", label: "Rooms", icon: FiHome },
    { href: "/calendar", label: "Calendar", icon: FiCalendar },
    { href: "/settings/pricing", label: "Pricing", icon: FiDollarSign },
    { href: "/promotions", label: "Promotions", icon: FiTag },
    { href: "/food-orders", label: "Food Orders", icon: FiPackage },
    { href: "/repair", label: "Repair", icon: FiTool },
    { href: "/supplies", label: "Supplies", icon: FiPackage },
    { href: "/reviews", label: "Guest Review", icon: FiStar },
    { href: "/housekeeping", label: "Housekeeping", icon: FiDroplet },
    { href: "/portfolio", label: "Ranking", icon: FiTrendingUp },
    { href: "/staff-performance", label: "My Staff", icon: FiUsers },
    { href: "/earnings", label: "Reports", icon: FiFileText },
];

const bottomNavItems = [
    { href: "/settings", label: "Settings", icon: FiSettings },
    { href: "/help", label: "Help", icon: FiHelpCircle },
];

export function OyoSidebar({ hotelName = "ZinuRooms" }: OyoSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className="oyo-sidebar">
            {/* Logo */}
            <div className="oyo-sidebar-logo">
                <span style={{ color: "#e63946" }}>●</span>
                {hotelName}
            </div>

            {/* Main Navigation */}
            <nav className="oyo-sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`oyo-nav-item ${isActive(item.href) ? "active" : ""}`}
                        >
                            <Icon />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Divider */}
                <div style={{ height: "1px", background: "#e5e7eb", margin: "1rem 0" }} />

                {/* Bottom items */}
                {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`oyo-nav-item ${isActive(item.href) ? "active" : ""}`}
                        >
                            <Icon />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
