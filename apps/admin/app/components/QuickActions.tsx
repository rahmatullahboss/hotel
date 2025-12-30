"use client";

import Link from "next/link";
import {
    HiOutlineBuildingOffice2,
    HiOutlineGift,
    HiOutlineBanknotes,
    HiOutlineBellAlert,
    HiOutlineDocumentChartBar,
    HiOutlineUserGroup,
    HiOutlineChartBarSquare,
    HiOutlineCog6Tooth
} from "react-icons/hi2";

const quickActions = [
    {
        name: "Pending Hotels",
        href: "/hotels#pending",
        icon: HiOutlineBuildingOffice2,
        color: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
    },
    {
        name: "Payouts",
        href: "/payouts",
        icon: HiOutlineBanknotes,
        color: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
    },
    {
        name: "Promotions",
        href: "/promotions",
        icon: HiOutlineGift,
        color: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
    },
    {
        name: "Notifications",
        href: "/notifications",
        icon: HiOutlineBellAlert,
        color: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)"
    },
    {
        name: "Reports",
        href: "/reports",
        icon: HiOutlineDocumentChartBar,
        color: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
    },
    {
        name: "Users",
        href: "/users",
        icon: HiOutlineUserGroup,
        color: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)"
    },
    {
        name: "Analytics",
        href: "/metrics",
        icon: HiOutlineChartBarSquare,
        color: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"
    },
    {
        name: "Settings",
        href: "/settings",
        icon: HiOutlineCog6Tooth,
        color: "linear-gradient(135deg, #64748B 0%, #475569 100%)"
    }
];

export function QuickActions() {
    return (
        <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ 
                fontSize: "1rem", 
                fontWeight: 600, 
                marginBottom: "0.75rem", 
                color: "var(--color-text-secondary)" 
            }}>
                Quick Actions
            </h2>
            <div className="quick-actions-grid">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="quick-action-card"
                        >
                            <div 
                                className="quick-action-icon"
                                style={{ 
                                    background: action.color,
                                    color: "white"
                                }}
                            >
                                <Icon size={20} />
                            </div>
                            <span className="quick-action-label">{action.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
