"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function DesktopHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navLinks = [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/hotels", label: "Search Hotels", icon: "🔍" },
        { href: "/bookings", label: "My Bookings", icon: "📋" },
        { href: "/wallet", label: "Wallet", icon: "💰" },
    ];

    return (
        <header className="desktop-header">
            <div className="desktop-header-container">
                {/* Logo */}
                <Link href="/" className="desktop-header-logo">
                    <span className="logo-icon">🏨</span>
                    <span className="logo-text">Vibe Hotels</span>
                </Link>

                {/* Navigation */}
                <nav className="desktop-header-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`desktop-nav-link ${pathname === link.href ? "active" : ""}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* User Actions */}
                <div className="desktop-header-actions">
                    <LanguageSwitcher />
                    {session ? (
                        <Link href="/profile" className="desktop-user-btn">
                            <span className="user-avatar">
                                {session.user?.name?.charAt(0) || "U"}
                            </span>
                            <span className="user-name">{session.user?.name || "Profile"}</span>
                        </Link>
                    ) : (
                        <Link href="/auth/signin" className="btn btn-primary desktop-signin-btn">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
