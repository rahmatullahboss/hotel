"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function TopNav() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const t = useTranslations("nav");

    const [isScrolled, setIsScrolled] = useState(false);
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Navbar classes based on state
    const navClass = `top-nav ${isHome && !isScrolled ? "transparent" : "solid"} ${isHome ? "fixed" : "sticky"}`;

    return (
        <nav className={navClass}>
            <Link href="/" className="top-nav-logo flex items-center gap-2">
                <img src="/logo.png" alt="Zinu Rooms" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <span>Zinu Rooms</span>
            </Link>

            <div className="top-nav-links">
                <Link
                    href="/"
                    className={`top-nav-link ${pathname === "/" ? "active" : ""}`}
                >
                    {t("home")}
                </Link>
                <Link
                    href="/hotels"
                    className={`top-nav-link ${pathname.startsWith("/hotels") ? "active" : ""}`}
                >
                    {t("hotels")}
                </Link>
                <Link
                    href="/bookings"
                    className={`top-nav-link ${pathname === "/bookings" ? "active" : ""}`}
                >
                    {t("bookings")}
                </Link>
            </div>

            <div className="top-nav-actions">
                <LanguageSwitcher />
                {status === "loading" ? (
                    <div style={{ width: 80, height: 36 }} />
                ) : session?.user ? (
                    <>
                        <Link
                            href="/profile"
                            className="top-nav-user"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                textDecoration: "none",
                                color: "var(--color-text-primary)",
                            }}
                        >
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt=""
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: "50%",
                                        background: "var(--color-primary)",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.875rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <span style={{ fontWeight: 500 }}>
                                {session.user.name || t("profile")}
                            </span>
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="btn btn-outline"
                            style={{ padding: "0.5rem 1rem" }}
                        >
                            {t("signOut")}
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            href="/auth/signin"
                            className="btn btn-outline"
                            style={{ padding: "0.5rem 1rem" }}
                        >
                            {t("logIn")}
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="btn btn-primary"
                            style={{ padding: "0.5rem 1rem" }}
                        >
                            {t("signUp")}
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
