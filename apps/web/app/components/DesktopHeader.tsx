"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { FiHome, FiSearch, FiCalendar } from "react-icons/fi";
import { FaHotel, FaWallet } from "react-icons/fa";

export function DesktopHeader() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const t = useTranslations("nav");

    const navLinks = [
        { href: "/", label: t("home"), icon: <FiHome size={18} /> },
        { href: "/hotels", label: t("searchHotels"), icon: <FiSearch size={18} /> },
        { href: "/bookings", label: t("myBookings"), icon: <FiCalendar size={18} /> },
        { href: "/wallet", label: t("wallet"), icon: <FaWallet size={18} /> },
    ];

    // Check both session and status to ensure accurate auth state
    const isAuthenticated = status === "authenticated" && session?.user;

    return (
        <header className="desktop-header">
            <div className="desktop-header-container">
                {/* Logo */}
                <Link href="/" className="desktop-header-logo">
                    <span className="logo-icon"><FaHotel size={24} /></span>
                    <span className="logo-text">Zinu Rooms</span>
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
                    {status === "loading" ? (
                        <div style={{ width: 100, height: 36 }} />
                    ) : isAuthenticated ? (
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
