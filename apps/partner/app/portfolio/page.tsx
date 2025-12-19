import { redirect } from "next/navigation";
import { getAggregateStats, getHotelComparison, getCityBreakdown } from "../actions/aggregate";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getAllPartnerHotels } from "../actions/dashboard";
import { BottomNav, ScannerFAB } from "../components";
import { FiTrendingUp, FiHome, FiMapPin, FiDollarSign, FiStar, FiPercent } from "react-icons/fi";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Only owners can see portfolio view
    if (roleInfo.role !== "OWNER") {
        redirect("/?accessDenied=portfolio");
    }

    const [aggregateStats, hotelComparison, cityBreakdown, allHotels] = await Promise.all([
        getAggregateStats(),
        getHotelComparison(),
        getCityBreakdown(),
        getAllPartnerHotels(),
    ]);

    // Single hotel owner shouldn't see portfolio
    if (allHotels.length <= 1) {
        redirect("/");
    }

    return (
        <>
            <main className="dashboard-content">
                {/* Header */}
                <header className="page-header" style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                            style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                            }}
                        >
                            <FiTrendingUp size={20} />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
                                Portfolio Overview
                            </h1>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {allHotels.length} properties across {cityBreakdown.length} cities
                            </p>
                        </div>
                    </div>
                </header>

                {/* Aggregate Stats */}
                {aggregateStats && (
                    <section style={{ marginBottom: "1.5rem" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "0.75rem",
                            }}
                        >
                            <div className="card stat-card">
                                <div className="stat-value">৳{aggregateStats.totalRevenue.toLocaleString()}</div>
                                <div className="stat-label">Total Revenue (Month)</div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-value">{aggregateStats.avgOccupancy}%</div>
                                <div className="stat-label">Avg Occupancy</div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-value">{aggregateStats.totalRooms}</div>
                                <div className="stat-label">Total Rooms</div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-value">{aggregateStats.totalBookings}</div>
                                <div className="stat-label">Bookings (Month)</div>
                            </div>
                        </div>
                    </section>
                )}

                {/* City Breakdown */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiMapPin /> City Performance
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {cityBreakdown.map((city) => (
                            <div key={city.city} className="card" style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{city.city}</span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginLeft: "0.5rem" }}>
                                            {city.hotelCount} hotels • {city.totalRooms} rooms
                                        </span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: "var(--color-success)" }}>
                                        ৳{city.totalRevenue.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    <span><FiPercent style={{ verticalAlign: "middle" }} /> {city.avgOccupancy}% occupancy</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Hotel Comparison */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiHome /> Property Performance
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {hotelComparison.map((hotel, index) => (
                            <Link
                                key={hotel.hotelId}
                                href={`/?switchTo=${hotel.hotelId}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <div
                                    className="card"
                                    style={{
                                        padding: "1rem",
                                        borderLeft: `4px solid ${index === 0 ? "var(--color-success)" : index === 1 ? "var(--color-primary)" : "var(--color-border)"}`,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{hotel.hotelName}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                {hotel.city} • {hotel.totalRooms} rooms
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: 600, color: "var(--color-success)" }}>
                                                ৳{hotel.monthlyRevenue.toLocaleString()}
                                            </div>
                                            <span
                                                className={`badge ${hotel.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}
                                                style={{ fontSize: "0.625rem" }}
                                            >
                                                {hotel.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        <span><FiPercent style={{ verticalAlign: "middle" }} /> {hotel.occupancyRate}%</span>
                                        <span><FiDollarSign style={{ verticalAlign: "middle" }} /> {hotel.totalBookings} bookings</span>
                                        {hotel.rating > 0 && (
                                            <span><FiStar style={{ verticalAlign: "middle" }} /> {hotel.rating} ({hotel.reviewCount})</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav role={roleInfo.role} />
        </>
    );
}
