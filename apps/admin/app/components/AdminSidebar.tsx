"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
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
    HiOutlineTicket,
    HiOutlineMagnifyingGlass,
    HiOutlineChevronDown,
    HiOutlineChevronRight,
    HiOutlineArrowRightOnRectangle,
    HiOutlineMoon,
    HiOutlineSun,
} from "react-icons/hi2";
import { IconType } from "react-icons";
import { useSession, signOut } from "next-auth/react";

interface MenuItem {
    name: string;
    href: string;
    icon: IconType;
    badge?: number;
}

interface MenuSection {
    id: string;
    title: string;
    icon: IconType;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        id: "overview",
        title: "Overview",
        icon: HiOutlineHome,
        items: [
            { name: "Dashboard", href: "/", icon: HiOutlineHome },
            { name: "Analytics", href: "/metrics", icon: HiOutlineChartBarSquare },
        ]
    },
    {
        id: "management",
        title: "Management",
        icon: HiOutlineBuildingOffice2,
        items: [
            { name: "Hotels", href: "/hotels", icon: HiOutlineBuildingOffice2 },
            { name: "Bookings", href: "/bookings", icon: HiOutlineCalendarDays },
            { name: "Users", href: "/users", icon: HiOutlineUserGroup },
            { name: "Reviews", href: "/reviews", icon: HiOutlineStar },
        ]
    },
    {
        id: "finance",
        title: "Finance",
        icon: HiOutlineBanknotes,
        items: [
            { name: "Payouts", href: "/payouts", icon: HiOutlineBanknotes },
            { name: "Commission", href: "/commission", icon: HiOutlineTicket },
        ]
    },
    {
        id: "marketing",
        title: "Marketing",
        icon: HiOutlineGift,
        items: [
            { name: "Promotions", href: "/promotions", icon: HiOutlineGift },
            { name: "Incentives", href: "/incentives", icon: HiOutlineMegaphone },
        ]
    },
    {
        id: "operations",
        title: "Operations",
        icon: HiOutlineCog6Tooth,
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
    const { data: session } = useSession();
    const [expandedSections, setExpandedSections] = useState<string[]>(
        menuSections.map(s => s.id) // All sections expanded by default
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const toggleTheme = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        setIsDarkMode(!isDarkMode);
        localStorage.setItem("admin-theme", newTheme);
    };

    // Filter sections based on search
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return menuSections;
        const query = searchQuery.toLowerCase();
        return menuSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.name.toLowerCase().includes(query)
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [searchQuery]);

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
                {/* Header */}
                <div className="sidebar-header">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
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

                {/* Search Bar */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav flex-1 overflow-y-auto p-3 space-y-1">
                    {filteredSections.map((section) => {
                        const isExpanded = expandedSections.includes(section.id);
                        const SectionIcon = section.icon;
                        const hasActiveItem = section.items.some(
                            (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                        );

                        return (
                            <div key={section.id} className="mb-2">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors
                                        ${hasActiveItem ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <SectionIcon className="w-4 h-4" />
                                        <span>{section.title}</span>
                                    </div>
                                    {isExpanded ? (
                                        <HiOutlineChevronDown className="w-4 h-4" />
                                    ) : (
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Section Items */}
                                <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                        isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="mt-1 ml-4 border-l border-gray-100 dark:border-gray-800 pl-2 space-y-0.5">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href || 
                                                (item.href !== "/" && pathname.startsWith(item.href));
                                            const showBadge = item.href === "/hotels" && pendingCount > 0;

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={onClose}
                                                    className={`
                                                        flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all
                                                        ${isActive
                                                            ? "bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/20"
                                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                                                    <span className="flex-1">{item.name}</span>
                                                    {showBadge && (
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                            {pendingCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer - User Profile */}
                <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {session?.user?.name?.[0]?.toUpperCase() || "A"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {session?.user?.name || "Admin"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {session?.user?.email || "admin@zinurooms.com"}
                            </p>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title={isDarkMode ? "Light mode" : "Dark mode"}
                        >
                            {isDarkMode ? (
                                <HiOutlineSun className="w-5 h-5" />
                            ) : (
                                <HiOutlineMoon className="w-5 h-5" />
                            )}
                        </button>

                        {/* Logout */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
