import { getAdminStats } from "@/actions/dashboard";

export default async function DashboardPage() {
    const stats = await getAdminStats();

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="card stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value">৳{stats.totalRevenue.toLocaleString()}</div>
                    <div className="stat-subtext">From paid bookings</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-label">Active Hotels</div>
                    <div className="stat-value">{stats.activeHotels}</div>
                    <div className="stat-subtext">{stats.pendingHotels} pending approval</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{stats.totalBookings}</div>
                    <div className="stat-subtext">All time</div>
                </div>

                <div className="card stat-card">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-subtext">Registered accounts</div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                    Recent Activity
                </h2>
                <div style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem" }}>
                    Activity feed coming soon...
                </div>
            </div>
        </div>
    );
}
