"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useTransition, useEffect, useState } from "react";

const HomeIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
    </svg>
);

const HotelsIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
        />
    </svg>
);

const BookingsIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
    </svg>
);

const CheckInIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
    </svg>
);

const CheckOutIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={active ? 2.5 : 1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
    </svg>
);

// Language Icon
const LanguageIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        style={{ width: 24, height: 24 }}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
        />
    </svg>
);

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("nav");
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [currentLocale, setCurrentLocale] = useState("bn");

    useEffect(() => {
        if (typeof document !== "undefined") {
            const match = document.cookie.match(/locale=([^;]+)/);
            setCurrentLocale(match ? match[1] : "bn");
        }
    }, []);

    const toggleLanguage = () => {
        const newLocale = currentLocale === "bn" ? "en" : "bn";
        document.cookie = `locale=${newLocale};path=/;max-age=31536000`;
        setCurrentLocale(newLocale);
        startTransition(() => {
            router.refresh();
        });
    };

    // Nav items for logged in users
    const loggedInNavItems = [
        { href: "/", labelKey: "home", Icon: HomeIcon },
        { href: "/checkin", labelKey: "checkIn", Icon: CheckInIcon },
        { href: "/checkout", labelKey: "checkOut", Icon: CheckOutIcon },
        { href: "/bookings", labelKey: "bookings", Icon: BookingsIcon },
        { href: "/profile", labelKey: "profile", Icon: ProfileIcon },
    ];

    // Nav items for logged out users - no check in/out, add hotels explore
    const loggedOutNavItems = [
        { href: "/", labelKey: "home", Icon: HomeIcon },
        { href: "/hotels", labelKey: "hotels", Icon: HotelsIcon },
        { href: "/profile", labelKey: "profile", Icon: ProfileIcon },
    ];

    const navItems = session ? loggedInNavItems : loggedOutNavItems;

    return (
        <nav className="bottom-nav">
            {navItems.map(({ href, labelKey, Icon }) => {
                const isActive = pathname === href ||
                    (href === "/" && pathname === "/") ||
                    (href === "/hotels" && pathname.startsWith("/hotels"));
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-item ${isActive ? "active" : ""}`}
                    >
                        <Icon active={isActive} />
                        <span>{t(labelKey)}</span>
                    </Link>
                );
            })}
            {/* Language Toggle Button - Only for logged out users */}
            {!session && (
                <button
                    onClick={toggleLanguage}
                    disabled={isPending}
                    className="nav-item"
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0.75rem",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    <LanguageIcon />
                    <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                        {currentLocale === "bn" ? "EN" : "বাং"}
                    </span>
                </button>
            )}
        </nav>
    );
}
