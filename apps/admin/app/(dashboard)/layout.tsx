"use client";

import { useState } from "react";
import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar } from "../components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <AdminHeader
                onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
