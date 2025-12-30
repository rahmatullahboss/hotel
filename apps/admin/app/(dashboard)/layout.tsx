"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar } from "../components/AdminSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Fetch pending count on mount
    useEffect(() => {
        async function fetchPendingCount() {
            try {
                const response = await fetch('/api/admin/pending-count');
                if (response.ok) {
                    const data = await response.json();
                    setPendingCount(data.pendingCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch pending count:', error);
            }
        }
        fetchPendingCount();
    }, []);

    return (
        <div className="admin-layout">
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                pendingCount={pendingCount}
            />
            <AdminHeader
                onMenuClick={() => setSidebarOpen(true)}
                notificationCount={pendingCount}
            />
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
