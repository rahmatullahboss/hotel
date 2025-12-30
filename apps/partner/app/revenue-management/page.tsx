import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getDemandForecast, getYieldRules, getOccupancyTrends } from "../actions/revenue-management";
import { BottomNav, ScannerFAB } from "../components";
import RevenueManagementClient from "./RevenueManagementClient";
import { FiTrendingUp, FiZap, FiDollarSign, FiCalendar } from "react-icons/fi";

export const dynamic = "force-dynamic";

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
        getDemandForecast(hotel.id, 14), // Next 2 weeks
        getYieldRules(hotel.id),
        getOccupancyTrends(hotel.id, "week"),
    ]);

    // Calculate stats
    const highDemandDays = forecast.filter((f) => f.predictedDemand === "HIGH" || f.predictedDemand === "VERY_HIGH").length;
    const avgOccupancy = Math.round(forecast.reduce((sum, f) => sum + f.predictedOccupancy, 0) / forecast.length);
    const activeRules = yieldRules.filter((r) => r.isActive).length;
    const potentialRevenue = Math.round(forecast.filter((f) => f.suggestedPriceMultiplier > 1).length * 500); // Rough estimate

    return (
        <>
            <header className="page-header glass">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--color-bg-secondary)",
                            color: "var(--color-text-secondary)",
                            fontSize: "1rem",
                            textDecoration: "none",
                        }}
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>
                            Revenue Management
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            AI-powered pricing & demand forecasting
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ padding: "0 1rem 6rem 1rem" }}>
                {/* Stats Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiTrendingUp style={{ color: "var(--color-success)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{avgOccupancy}%</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Predicted Avg Occupancy
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiCalendar style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{highDemandDays}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            High Demand Days
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiZap style={{ color: "var(--color-warning)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{activeRules}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Active Yield Rules
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiDollarSign style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>৳{potentialRevenue.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Potential Extra Revenue
                        </div>
                    </div>
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
        </>
    );
}
