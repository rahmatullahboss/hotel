import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiTrendingUp, FiZap, FiDollarSign, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getDemandForecast, getYieldRules, getOccupancyTrends } from "../actions/revenue-management";
import { BottomNav, ScannerFAB } from "../components";
import RevenueManagementClient from "./RevenueManagementClient";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
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
        fontSize: "26px",
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
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "14px",
        marginBottom: "24px",
    } as React.CSSProperties,
    statCard: {
        padding: "20px",
        background: "white",
        borderRadius: "18px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        textAlign: "center" as const,
    } as React.CSSProperties,
};

export default async function RevenueManagementPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const [forecast, yieldRules, trends] = await Promise.all([
        getDemandForecast(hotel.id, 14),
        getYieldRules(hotel.id),
        getOccupancyTrends(hotel.id, "week"),
    ]);

    const highDemandDays = forecast.filter((f) => f.predictedDemand === "HIGH" || f.predictedDemand === "VERY_HIGH").length;
    const avgOccupancy = Math.round(forecast.reduce((sum, f) => sum + f.predictedOccupancy, 0) / forecast.length);
    const activeRules = yieldRules.filter((r) => r.isActive).length;
    const potentialRevenue = Math.round(forecast.filter((f) => f.suggestedPriceMultiplier > 1).length * 500);

    const statCards = [
        {
            icon: FiTrendingUp,
            value: `${avgOccupancy}%`,
            label: "Predicted Avg Occupancy",
            gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            iconColor: "#059669",
        },
        {
            icon: FiCalendar,
            value: highDemandDays,
            label: "High Demand Days",
            gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            iconColor: "#2563eb",
        },
        {
            icon: FiZap,
            value: activeRules,
            label: "Active Yield Rules",
            gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            iconColor: "#d97706",
        },
        {
            icon: FiDollarSign,
            value: `৳${potentialRevenue.toLocaleString()}`,
            label: "Potential Extra Revenue",
            gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
            iconColor: "#7c3aed",
        },
    ];

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiBarChart2 size={26} />
                        Revenue Management
                    </h1>
                    <p style={styles.pageSubtitle}>
                        AI-powered pricing & demand forecasting
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
                        <div key={index} style={styles.statCard}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: stat.gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                            }}>
                                <stat.icon size={22} color={stat.iconColor} />
                            </div>
                            <div style={{
                                fontSize: "24px",
                                fontWeight: "800",
                                color: "#1a1a2e",
                                marginBottom: "4px",
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                fontWeight: "500",
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <RevenueManagementClient
                    forecast={forecast}
                    yieldRules={yieldRules}
                    trends={trends}
                    hotelId={hotel.id}
                />
            </main>

            <ScannerFAB />
            <BottomNav />
        </div>
    );
}
