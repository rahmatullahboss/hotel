"use client";

import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar } from "../components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
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
    );
}
