"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function DesktopHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const t = useTranslations("nav");

    const navLinks = [
        { href: "/", label: t("home"), icon: "🏠" },
        { href: "/hotels", label: t("searchHotels"), icon: "🔍" },
        { href: "/bookings", label: t("myBookings"), icon: "📋" },
        { href: "/wallet", label: t("wallet"), icon: "💰" },
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
                            <span style={{ marginRight: "0.5rem" }}>{link.icon}</span>
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
                            <span className="user-name">{session.user?.name || t("profile")}</span>
                        </Link>
                    ) : (
                        <Link href="/auth/signin" className="btn btn-primary desktop-signin-btn">
                            {t("signIn")}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
