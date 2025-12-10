"use client";

import { signOut, useSession } from "next-auth/react";

export function AdminHeader() {
    const { data: session } = useSession();

    return (
        <header
            style={{
                height: "64px",
                background: "white",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 2rem",
                marginLeft: "250px", // Offset for fixed sidebar
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt=""
                            style={{ width: 32, height: 32, borderRadius: "50%" }}
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
                                fontWeight: 700,
                            }}
                        >
                            {(session?.user?.name || "A")?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                        {session?.user?.name || "Admin"}
                    </span>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    style={{
                        padding: "0.5rem",
                        background: "none",
                        border: "none",
                        color: "var(--color-text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                    }}
                >
                    Sign Out
                </button>
            </div>
        </header>
    );
}
