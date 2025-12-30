"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
    HiOutlineBars3,
    HiOutlineMagnifyingGlass,
    HiOutlineBell,
    HiOutlinePlus,
    HiOutlineArrowRightOnRectangle
} from "react-icons/hi2";

interface AdminHeaderProps {
    onMenuClick?: () => void;
    notificationCount?: number;
}

export function AdminHeader({ onMenuClick, notificationCount = 0 }: AdminHeaderProps) {
    const { data: session } = useSession();

    return (
        <header className="admin-header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Toggle menu"
                >
                    <HiOutlineBars3 size={24} />
                </button>

                {/* Global Search */}
                <div className="header-search">
                    <HiOutlineMagnifyingGlass size={18} className="header-search-icon" />
                    <input
                        type="text"
                        placeholder="Search hotels, bookings..."
                        aria-label="Search"
                    />
                    <span className="header-search-shortcut">⌘K</span>
                </div>
            </div>

            <div className="header-right">
                {/* Quick Action Button */}
                <Link href="/hotels#pending" className="btn-quick-action" style={{ display: 'none' }}>
                    <HiOutlinePlus size={18} />
                    <span style={{ display: 'none' }}>New Hotel</span>
                </Link>

                {/* Notifications */}
                <button className="header-notifications" aria-label="Notifications">
                    <HiOutlineBell size={22} />
                    {notificationCount > 0 && (
                        <span className="notification-badge">
                            {notificationCount > 99 ? "99+" : notificationCount}
                        </span>
                    )}
                </button>

                {/* User Dropdown */}
                <div className="header-user">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt=""
                            className="header-avatar"
                        />
                    ) : (
                        <div className="header-avatar-placeholder">
                            {(session?.user?.name || "A")?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="header-username">
                            {session?.user?.name || "Admin"}
                        </span>
                        <span style={{
                            fontSize: '0.625rem',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'none'
                        }}>
                            Super Admin
                        </span>
                    </div>
                </div>
                
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="header-signout"
                    title="Sign Out"
                >
                    <HiOutlineArrowRightOnRectangle size={20} />
                </button>
            </div>
        </header>
    );
}
