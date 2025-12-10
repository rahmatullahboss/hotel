"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SearchIcon = ({ active }: { active: boolean }) => (
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
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
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

const navItems = [
    { href: "/", label: "Search", Icon: SearchIcon },
    { href: "/bookings", label: "Bookings", Icon: BookingsIcon },
    { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            {navItems.map(({ href, label, Icon }) => {
                const isActive = pathname === href ||
                    (href === "/" && pathname.startsWith("/hotels"));
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`nav-item ${isActive ? "active" : ""}`}
                    >
                        <Icon active={isActive} />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
