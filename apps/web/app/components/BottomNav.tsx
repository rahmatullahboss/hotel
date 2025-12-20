"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

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
            d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
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
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h6v6h-6v-6z"
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
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
    </svg>
);

export function BottomNav() {
    const pathname = usePathname();
    const t = useTranslations("nav");
    const { data: session } = useSession();

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
        </nav>
    );
}
