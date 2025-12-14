import { MdNotifications, MdSend, MdPeople, MdDevices } from "react-icons/md";
import { getNotificationStats } from "../actions/notifications";
import { BroadcastForm } from "./BroadcastForm";
import { QuickNotifications } from "./QuickNotifications";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const stats = await getNotificationStats();

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Push Notifications</h1>
                    <p className="text-muted">Send updates and announcements to hotel partners</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdDevices />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeSubscriptions}</span>
                        <span className="stat-label">Active Devices</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdPeople />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.uniqueUsers}</span>
                        <span className="stat-label">Subscribed Users</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdNotifications />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalSubscriptions}</span>
                        <span className="stat-label">Total Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* VAPID Warning */}
            {!process.env.VAPID_PUBLIC_KEY && (
                <div className="card" style={{
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    backgroundColor: "rgba(245, 158, 11, 0.05)",
                    borderColor: "#f59e0b",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                        <div>
                            <h4 style={{ margin: 0, color: "#f59e0b" }}>VAPID Keys Not Configured</h4>
                            <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                                Push notifications require VAPID keys. Run <code>npx web-push generate-vapid-keys</code> and add to environment variables.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                {/* Broadcast Form */}
                <section className="card" style={{ padding: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>
                        <MdSend style={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
                        Send Broadcast
                    </h2>
                    <BroadcastForm />
                </section>

                {/* Quick Notifications */}
                <section className="card" style={{ padding: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>
                        Quick Actions
                    </h2>
                    <QuickNotifications />
                </section>
            </div>

            <style jsx>{`
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .stat-label {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
                code {
                    padding: 0.125rem 0.375rem;
                    background: var(--color-bg-secondary);
                    border-radius: 4px;
                    font-size: 0.75rem;
                }
            `}</style>
        </div>
    );
}
