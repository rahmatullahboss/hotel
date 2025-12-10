export default async function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem"
            }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Total Revenue</h3>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>৳1,254,300</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>+12% from last month</div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Active Hotels</h3>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>48</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>3 pending approval</div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Total Bookings</h3>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>1,245</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>+8% from last month</div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>Active Accounts</h3>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>3,890</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>+150 this week</div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="card" style={{ padding: "1.5rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Recent Activity</h2>
                <div style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem" }}>
                    Activity feed coming soon...
                </div>
            </div>
        </div>
    );
}
