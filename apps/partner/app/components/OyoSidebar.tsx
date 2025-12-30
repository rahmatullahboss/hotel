"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid,
    FiCalendar,
    FiHome,
    FiStar,
    FiTrendingUp,
    FiUsers,
    FiFileText,
    FiSettings,
    FiHelpCircle,
    FiMessageSquare,
    FiLink,
    FiBarChart2,
} from "react-icons/fi";




interface OyoSidebarProps {
    hotelName?: string;
    className?: string; // Add className prop support
}

const navItems = [
    { href: "/", label: "হোম", icon: FiGrid },
    { href: "/bookings", label: "বুকিং", icon: FiCalendar },
    { href: "/inventory", label: "রুম", icon: FiHome },
    { href: "/walkin", label: "ওয়াক-ইন", icon: FiUsers },
    { href: "/messaging", label: "মেসেজ", icon: FiMessageSquare },
    { href: "/channels", label: "চ্যানেল", icon: FiLink },
    { href: "/reports", label: "রিপোর্ট", icon: FiBarChart2 },
    { href: "/reviews", label: "রিভিউ", icon: FiStar },
    { href: "/portfolio", label: "পোর্টফোলিও", icon: FiTrendingUp },
    { href: "/staff-performance", label: "স্টাফ", icon: FiUsers },
    { href: "/earnings", label: "আয়", icon: FiFileText },
];

const bottomNavItems = [
    { href: "/settings", label: "সেটিংস", icon: FiSettings },
    { href: "/help", label: "সাহায্য", icon: FiHelpCircle },
];

export function OyoSidebar({ hotelName = "Zinu", className = "" }: OyoSidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className={`oyo-sidebar ${className}`}>

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
