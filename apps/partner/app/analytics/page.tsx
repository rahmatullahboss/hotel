import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiBarChart2, FiTrendingUp, FiCalendar, FiDollarSign, FiPieChart, FiAward } from "react-icons/fi";
import { getPartnerHotel } from "../actions/dashboard";
import { getAnalyticsData } from "../actions/analytics";
import { BottomNav, AnimatedStatCard } from "../components";
import { AnalyticsExportClient } from "../components/AnalyticsExportClient";
import { RevenueChart } from "../components/charts/RevenueChart";
import { OccupancyGauge } from "../components/charts/OccupancyGauge";
import { BookingSourcesPie } from "../components/charts/BookingSourcesPie";
import { RevPARTrend } from "../components/charts/RevPARTrend";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
        marginBottom: "24px",
    } as React.CSSProperties,
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        fontWeight: "500",
        textDecoration: "none",
        marginBottom: "12px",
    } as React.CSSProperties,
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "white",
        margin: 0,
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    } as React.CSSProperties,
    pageSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "15px",
        margin: 0,
    } as React.CSSProperties,
    main: {
        padding: "0 16px",
        maxWidth: "900px",
        margin: "0 auto",
    } as React.CSSProperties,
    periodFilter: {
        display: "flex",
        gap: "10px",
        marginBottom: "24px",
        background: "white",
        padding: "6px",
        borderRadius: "16px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
    periodBtn: {
        flex: 1,
        padding: "12px 16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        textAlign: "center" as const,
        textDecoration: "none",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "14px",
        marginBottom: "24px",
    } as React.CSSProperties,
    section: {
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        marginBottom: "20px",
    } as React.CSSProperties,
    sectionTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#1a1a2e",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    } as React.CSSProperties,
    emptyState: {
        textAlign: "center" as const,
        color: "#6b7280",
        padding: "32px",
    } as React.CSSProperties,
};

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

    const bookingSources = [
        { source: "Platform", count: analytics.platformBookings, revenue: analytics.platformRevenue },
        { source: "Walk-in", count: analytics.walkInBookings, revenue: analytics.walkInRevenue },
    ].filter(s => s.count > 0);

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ 
                    maxWidth: "900px", 
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                }}>
                    <div>
                        <Link href="/" style={styles.backLink}>
                            <FiArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 style={styles.pageTitle}>
                            <FiBarChart2 size={28} />
                            Analytics Dashboard
                        </h1>
                        <p style={styles.pageSubtitle}>
                            Performance insights • {periodLabels[period]}
                        </p>
                    </div>
                    <div style={{ marginTop: "30px" }}>
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
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                {/* Period Filter */}
                <div style={styles.periodFilter}>
                    {(["week", "month", "year"] as const).map((p) => (
                        <Link
                            key={p}
                            href={`/analytics?period=${p}`}
                            style={{
                                ...styles.periodBtn,
                                background: period === p
                                    ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                                    : "transparent",
                                color: period === p ? "white" : "#6b7280",
                                boxShadow: period === p
                                    ? "0 4px 12px rgba(139, 92, 246, 0.3)"
                                    : "none",
                            }}
                        >
                            {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
                        </Link>
                    ))}
                </div>

                {/* KPI Cards */}
                <div style={styles.statsGrid}>
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
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FiTrendingUp size={20} color="#8b5cf6" />
                        Occupancy Rate
                    </h2>
                    <OccupancyGauge occupancyRate={analytics.occupancyRate} targetRate={80} size={200} />
                </section>

                {/* Revenue Trend Chart */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FiDollarSign size={20} color="#10b981" />
                        Revenue Trend
                    </h2>
                    {analytics.dailyRevenue.length > 0 ? (
                        <RevenueChart data={analytics.dailyRevenue} height={220} />
                    ) : (
                        <div style={styles.emptyState}>
                            No revenue data for this period
                        </div>
                    )}
                </section>

                {/* RevPAR & ADR Trend */}
                {analytics.revparTrend.length > 0 && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <FiBarChart2 size={20} color="#3b82f6" />
                            RevPAR & ADR Trend
                        </h2>
                        <RevPARTrend data={analytics.revparTrend} />
                    </section>
                )}

                {/* Booking Sources */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FiPieChart size={20} color="#ec4899" />
                        Booking Sources
                    </h2>
                    {bookingSources.length > 0 ? (
                        <BookingSourcesPie sources={bookingSources} size={160} />
                    ) : (
                        <div style={styles.emptyState}>
                            No booking data for this period
                        </div>
                    )}
                </section>

                {/* Top Performing Rooms */}
                {analytics.topRooms.length > 0 && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <FiAward size={20} color="#f59e0b" />
                            Top Performing Rooms
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {analytics.topRooms.map((room, index) => (
                                <div
                                    key={room.roomNumber}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                        padding: "14px 16px",
                                        background: index === 0 
                                            ? "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
                                            : "#f8fafc",
                                        borderRadius: "14px",
                                        borderLeft: index === 0 ? "4px solid #8b5cf6" : "4px solid transparent",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "50%",
                                            background: index === 0
                                                ? "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                                                : "#e5e7eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            fontWeight: "800",
                                            color: index === 0 ? "white" : "#6b7280",
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "700", fontSize: "15px", color: "#1a1a2e" }}>
                                            Room {room.roomNumber}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                            {room.bookings} bookings
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: "800", fontSize: "16px", color: "#10b981" }}>
                                        ৳{room.revenue.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
