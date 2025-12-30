import { getAdminStats, getRecentActivity, getQualityAlerts, getPendingPaymentBookings } from "@/actions/dashboard";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const [stats, activities, alerts, pendingPayments] = await Promise.all([
        getAdminStats(),
        getRecentActivity(8),
        getQualityAlerts(),
        getPendingPaymentBookings(10),
    ]);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "CHECK_IN": return "🚪";
            case "PAYMENT": return "💰";
            case "HOTEL_REGISTRATION": return "🏨";
            default: return "📋";
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Platform overview and management</p>
            </div>

            {/* Quality Alerts Banner */}
            {(alerts.pendingCount > 0 || alerts.lowRatedHotels.length > 0) && (
                <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
                    <div
                        className="card"
                        style={{
                            background: "rgba(233, 196, 106, 0.1)",
                            borderColor: "var(--color-warning)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ fontSize: "2rem" }}>⚠️</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    Action Required
                                </div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {alerts.pendingCount > 0 && (
                                        <span>{alerts.pendingCount} hotel(s) pending approval</span>
                                    )}
                                    {alerts.pendingCount > 0 && alerts.lowRatedHotels.length > 0 && " • "}
                                    {alerts.lowRatedHotels.length > 0 && (
                                        <span>{alerts.lowRatedHotels.length} hotel(s) with low ratings</span>
                                    )}
                                </div>
                            </div>
                            <Link href="/hotels#pending" className="btn btn-sm btn-primary">
                                View
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Today's Stats */}
            <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
                    Today&apos;s Overview
                </h2>
                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="card stat-card">
                        <div className="stat-value">{stats.todayBookings}</div>
                        <div className="stat-label">Bookings</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">৳{stats.todayRevenue.toLocaleString()}</div>
                        <div className="stat-label">Revenue</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{stats.todayCheckIns}</div>
                        <div className="stat-label">Check-ins</div>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
                    Platform Stats
                </h2>
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value">৳{stats.totalRevenue.toLocaleString()}</div>
                        <div className="stat-subtext">Lifetime earnings</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Monthly Revenue</div>
                        <div className="stat-value">৳{stats.monthlyRevenue.toLocaleString()}</div>
                        <div className="stat-subtext">This month</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Platform Commission</div>
                        <div className="stat-value" style={{ color: "var(--color-success)" }}>
                            ৳{stats.platformCommission.toLocaleString()}
                        </div>
                        <div className="stat-subtext">Your earnings</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Avg Booking Value</div>
                        <div className="stat-value">৳{stats.averageBookingValue.toLocaleString()}</div>
                        <div className="stat-subtext">Per booking</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Active Hotels</div>
                        <div className="stat-value">{stats.activeHotels}</div>
                        <div className="stat-subtext">
                            {stats.pendingHotels > 0 && (
                                <span style={{ color: "var(--color-warning)" }}>
                                    {stats.pendingHotels} pending
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Total Rooms</div>
                        <div className="stat-value">{stats.totalRooms}</div>
                        <div className="stat-subtext">Across all hotels</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Total Bookings</div>
                        <div className="stat-value">{stats.totalBookings}</div>
                        <div className="stat-subtext">Excluding cancelled</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Total Cancellations</div>
                        <div className="stat-value" style={{ color: "var(--color-error)" }}>
                            {stats.totalCancellations}
                        </div>
                        <div className="stat-subtext">Auto-expired & cancelled</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-subtext">Registered accounts</div>
                    </div>
                </div>
            </div>

            {/* Pending Payments Section - Monitor incomplete payments */}
            {pendingPayments.length > 0 && (
                <div style={{ padding: "0 1.5rem", marginBottom: "1.5rem" }}>
                    <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-warning)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                ⏳ Pending Payments ({pendingPayments.length})
                            </h2>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                Auto-expires after 20 min
                            </span>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {pendingPayments.map((booking) => (
                                <div
                                    key={booking.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        padding: "0.75rem",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                                            {booking.guestName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                            {booking.hotelName} • {booking.roomName || "Room"} • {booking.checkIn}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: 600, color: "var(--color-warning)" }}>
                                            ৳{booking.bookingFee.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: booking.minutesRemaining && booking.minutesRemaining <= 5 ? "var(--color-error)" : "var(--color-text-muted)" }}>
                                            {booking.minutesRemaining !== null
                                                ? booking.minutesRemaining <= 0
                                                    ? "Expired"
                                                    : `${booking.minutesRemaining}m left`
                                                : "No expiry"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Activity Section */}
            <div style={{ padding: "0 1.5rem" }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
                        Recent Activity
                    </h2>

                    {activities.length === 0 ? (
                        <div style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem" }}>
                            No recent activity
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {activities.map((activity) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        padding: "0.75rem",
                                        background: "var(--color-bg-secondary)",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem" }}>
                                        {getActivityIcon(activity.type)}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, marginBottom: "0.125rem" }}>
                                            {activity.title}
                                        </div>
                                        <div style={{
                                            fontSize: "0.875rem",
                                            color: "var(--color-text-secondary)",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                            {activity.hotelName && `${activity.hotelName} • `}
                                            {activity.description}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-text-muted)",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {formatTimeAgo(activity.timestamp)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

