"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Dashboard", href: "/", icon: "📊" },
    { name: "Hotels", href: "/hotels", icon: "hotel" },
    { name: "Users", href: "/users", icon: "👥" },
    { name: "Bookings", href: "/bookings", icon: "📅" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: "250px",
                height: "100vh",
                background: "var(--color-bg-secondary)",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                left: 0,
                top: 0,
            }}
        >
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-primary)" }}>
                    Admin Panel
                </h1>
            </div>

            <nav style={{ flex: 1, padding: "1rem" }}>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "0.5rem",
                                        textDecoration: "none",
                                        color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                                        background: isActive ? "rgba(42, 157, 143, 0.1)" : "transparent",
                                        fontWeight: isActive ? 600 : 400,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <span>{item.icon === "hotel" ? "🏨" : item.icon}</span>
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Vibe Admin v1.0.0
                </div>
            </div>
        </aside>
    );
}
