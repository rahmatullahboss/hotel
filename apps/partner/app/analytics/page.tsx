import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerHotel } from "../actions/dashboard";
import { getAnalyticsData } from "../actions/analytics";
import { BottomNav } from "../components";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ period?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const period = (params.period || "month") as "week" | "month" | "year";
    const analytics = await getAnalyticsData(period);

    const periodLabels = {
        week: "Last 7 Days",
        month: "Last 30 Days",
        year: "Last 12 Months",
    };

    // Calculate max for chart scaling
    const maxRevenue = Math.max(...analytics.dailyRevenue.map((d) => d.revenue), 1);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/settings"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Analytics</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Performance insights
                </p>
            </header>

            <main style={{ padding: "1rem", paddingBottom: "6rem" }}>
                {/* Period Filter */}
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    {(["week", "month", "year"] as const).map((p) => (
                        <Link
                            key={p}
                            href={`/analytics?period=${p}`}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                background: period === p
                                    ? "var(--color-primary)"
                                    : "var(--color-bg-secondary)",
                                color: period === p
                                    ? "white"
                                    : "var(--color-text-primary)",
                                textAlign: "center",
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                fontWeight: period === p ? 600 : 400,
                            }}
                        >
                            {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
                        </Link>
                    ))}
                </div>

                {/* Summary Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="card stat-card">
                        <div className="stat-value">৳{analytics.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{analytics.totalBookings}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">৳{analytics.avgBookingValue.toLocaleString()}</div>
                        <div className="stat-label">Avg. Booking</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{analytics.occupancyRate}%</div>
                        <div className="stat-label">Occupancy Rate</div>
                    </div>
                </div>

                {/* Revenue Chart (Simple CSS bars) */}
                <section className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Revenue Trend
                    </h2>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            height: "120px",
                            gap: "2px",
                        }}
                    >
                        {analytics.dailyRevenue.slice(-14).map((day, i) => (
                            <div
                                key={day.date}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        width: "100%",
                                        background: day.revenue > 0
                                            ? "var(--color-primary)"
                                            : "var(--color-bg-secondary)",
                                        borderRadius: "2px 2px 0 0",
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "flex-end",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                                            background: "var(--color-primary)",
                                            borderRadius: "2px 2px 0 0",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
                        {periodLabels[period]}
                    </div>
                </section>

                {/* Booking Source Breakdown */}
                <section className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Booking Sources
                    </h2>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📱</div>
                            <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                                {analytics.platformBookings}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                Platform
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                                ৳{analytics.platformRevenue.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ width: "1px", background: "var(--color-border)" }} />
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>🚶</div>
                            <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                                {analytics.walkInBookings}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                Walk-in
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                                ৳{analytics.walkInRevenue.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Performing Rooms */}
                {analytics.topRooms.length > 0 && (
                    <section className="card" style={{ padding: "1.25rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Top Performing Rooms
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {analytics.topRooms.map((room, index) => (
                                <div
                                    key={room.roomNumber}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            background: index === 0
                                                ? "var(--color-accent)"
                                                : "var(--color-bg-secondary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: index === 0 ? "white" : "var(--color-text-secondary)",
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600 }}>Room {room.roomNumber}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                            {room.bookings} bookings
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: "var(--color-success)" }}>
                                        ৳{room.revenue.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <BottomNav />
        </>
    );
}
