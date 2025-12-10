"use client";

import { SessionProvider } from "next-auth/react";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <div style={{ minHeight: "100vh", background: "var(--color-bg-tertiary)" }}>
                <AdminSidebar />
                <AdminHeader />
                <main
                    style={{
                        marginLeft: "250px", // Sidebar width
                        padding: "2rem",
                    }}
                >
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
