"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
    const pathname = usePathname();

    return (
        <nav className="top-nav">
            <Link href="/" className="top-nav-logo">
                Vibe
            </Link>

            <div className="top-nav-links">
                <Link
                    href="/"
                    className={`top-nav-link ${pathname === "/" ? "active" : ""}`}
                >
                    Home
                </Link>
                <Link
                    href="/hotels"
                    className={`top-nav-link ${pathname.startsWith("/hotels") ? "active" : ""}`}
                >
                    Hotels
                </Link>
                <Link
                    href="/bookings"
                    className={`top-nav-link ${pathname === "/bookings" ? "active" : ""}`}
                >
                    My Bookings
                </Link>
            </div>

            <div className="top-nav-actions">
                <Link href="/auth/login" className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
                    Log In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>
                    Sign Up
                </Link>
            </div>
        </nav>
    );
}
