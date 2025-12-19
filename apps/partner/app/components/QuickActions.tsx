"use client";

import Link from "next/link";
import { FiPlus, FiCamera, FiDollarSign, FiGrid } from "react-icons/fi";

interface QuickActionsProps {
    hotelId: string;
}

const actions = [
    {
        href: "/walkin",
        label: "New Walk-in",
        icon: <FiPlus />,
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.1)",
    },
    {
        href: "/scanner",
        label: "Scan QR",
        icon: <FiCamera />,
        color: "#3b82f6",
        bgColor: "rgba(59, 130, 246, 0.1)",
    },
    {
        href: "/settings/pricing",
        label: "Pricing",
        icon: <FiDollarSign />,
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
        href: "/rooms",
        label: "Rooms",
        icon: <FiGrid />,
        color: "#8b5cf6",
        bgColor: "rgba(139, 92, 246, 0.1)",
    },
];

export function QuickActions({ hotelId }: QuickActionsProps) {
    return (
        <section style={{ marginBottom: "1.5rem" }}>
            <h2
                style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.75rem",
                }}
            >
                Quick Actions
            </h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.5rem",
                }}
            >
                {actions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0.75rem 0.5rem",
                            borderRadius: "12px",
                            background: action.bgColor,
                            textDecoration: "none",
                            transition: "transform 0.15s, box-shadow 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "0.5rem",
                                color: action.color,
                                fontSize: "1.125rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            {action.icon}
                        </div>
                        <span
                            style={{
                                fontSize: "0.6875rem",
                                fontWeight: 600,
                                color: "var(--color-text-primary)",
                                textAlign: "center",
                            }}
                        >
                            {action.label}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
