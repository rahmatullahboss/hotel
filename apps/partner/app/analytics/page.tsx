import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerHotel } from "../actions/dashboard";
import { getAnalyticsData } from "../actions/analytics";
import { BottomNav, AnimatedStatCard } from "../components";
import { AnalyticsExportClient } from "../components/AnalyticsExportClient";
import { RevenueChart } from "../components/charts/RevenueChart";
import { OccupancyGauge } from "../components/charts/OccupancyGauge";
import { BookingSourcesPie } from "../components/charts/BookingSourcesPie";
import { RevPARTrend } from "../components/charts/RevPARTrend";

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

    // Prepare booking sources data for pie chart
    const bookingSources = [
        { source: "Platform", count: analytics.platformBookings, revenue: analytics.platformRevenue },
        { source: "Walk-in", count: analytics.walkInBookings, revenue: analytics.walkInRevenue },
    ].filter(s => s.count > 0);

    return (
        <>
            {/* Header */}
            <header className="page-header glass" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <Link
                        href="/"
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
                    <h1 className="page-title gradient-text" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                        Performance insights • {periodLabels[period]}
                    </p>
                </div>
                <AnalyticsExportClient
                    analytics={{
                        totalBookings: analytics.totalBookings,
                        totalRevenue: analytics.totalRevenue,
                        occupancyRate: analytics.occupancyRate,
                        avgBookingValue: analytics.avgBookingValue,
                        platformBookings: analytics.platformBookings,
                        walkInBookings: analytics.walkInBookings,
                    }}
                    hotelName={hotel.name}
                    period={periodLabels[period]}
                />
            </header>

            <main className="animate-fade-in">
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
                            className={period === p ? "btn-gradient" : ""}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                borderRadius: "0.75rem",
                                background: period === p
                                    ? undefined
                                    : "var(--color-bg-secondary)",
                                color: period === p
                                    ? "white"
                                    : "var(--color-text-primary)",
                                textAlign: "center",
                                fontSize: "0.875rem",
                                textDecoration: "none",
                                fontWeight: period === p ? 600 : 400,
                                border: period === p ? "none" : "1px solid var(--color-border)",
                            }}
                        >
                            {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
                        </Link>
                    ))}
                </div>

                {/* KPI Cards - Premium Animated */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <AnimatedStatCard
                        value={analytics.totalRevenue}
                        label="Total Revenue"
                        icon="💰"
                        prefix="৳"
                        iconBgClass="gradient-success"
                        delay={0}
                    />
                    <AnimatedStatCard
                        value={analytics.totalBookings}
                        label="Total Bookings"
                        icon="📋"
                        iconBgClass="gradient-primary"
                        delay={0.1}
                    />
                    <AnimatedStatCard
                        value={analytics.revpar}
                        label="RevPAR"
                        icon="📊"
                        prefix="৳"
                        iconBgClass="gradient-accent"
                        delay={0.2}
                    />
                    <AnimatedStatCard
                        value={analytics.adr}
                        label="ADR"
                        icon="🏷️"
                        prefix="৳"
                        iconBgClass="gradient-warning"
                        delay={0.3}
                    />
                </div>

                {/* Occupancy Gauge */}
                <section className="glass-card animate-slide-up" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>📈</span> Occupancy Rate
                    </h2>
                    <OccupancyGauge occupancyRate={analytics.occupancyRate} targetRate={80} size={200} />
                </section>

                {/* Revenue Trend Chart */}
                <section className="glass-card animate-slide-up" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>💹</span> Revenue Trend
                    </h2>
                    {analytics.dailyRevenue.length > 0 ? (
                        <RevenueChart data={analytics.dailyRevenue} height={220} />
                    ) : (
                        <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
                            No revenue data for this period
                        </div>
                    )}
                </section>

                {/* RevPAR & ADR Trend */}
                {analytics.revparTrend.length > 0 && (
                    <section className="glass-card animate-slide-up" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>📉</span> RevPAR & ADR Trend
                        </h2>
                        <RevPARTrend data={analytics.revparTrend} height={200} />
                    </section>
                )}

                {/* Booking Sources */}
                <section className="glass-card animate-slide-up" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>📱</span> Booking Sources
                    </h2>
                    {bookingSources.length > 0 ? (
                        <BookingSourcesPie sources={bookingSources} size={160} />
                    ) : (
                        <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
                            No booking data for this period
                        </div>
                    )}
                </section>

                {/* Top Performing Rooms */}
                {analytics.topRooms.length > 0 && (
                    <section className="glass-card animate-slide-up" style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span>🏆</span> Top Performing Rooms
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {analytics.topRooms.map((room, index) => (
                                <div
                                    key={room.roomNumber}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.75rem",
                                        padding: "0.75rem",
                                        background: index === 0 ? "rgba(139, 92, 246, 0.1)" : "var(--color-bg-secondary)",
                                        borderRadius: "0.75rem",
                                        borderLeft: index === 0 ? "4px solid #8B5CF6" : "4px solid transparent",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            background: index === 0
                                                ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                                                : "var(--color-border)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.875rem",
                                            fontWeight: 700,
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
