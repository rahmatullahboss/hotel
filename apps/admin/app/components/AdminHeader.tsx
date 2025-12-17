"use client";

import { signOut, useSession } from "next-auth/react";

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { data: session } = useSession();

    return (
        <header className="admin-header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={onMenuClick}
                    aria-label="Toggle menu"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <span className="header-title">ZinoRooms Admin</span>
            </div>

            <div className="header-right">
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
                    <span className="header-username">
                        {session?.user?.name || "Admin"}
                    </span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="header-signout"
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
