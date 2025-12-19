import Link from "next/link";

interface OccupancyData {
    date: string;
    value: number;
    cityAvg: number;
}

interface BookingSourceData {
    source: string;
    count: number;
    revenue: number;
}

interface PerformanceChartsProps {
    occupancyData: OccupancyData[];
    occupancyThisMonth: number;
    bookingSources: BookingSourceData[];
    totalBookings: number;
    avgARR: number;
}

export function PerformanceCharts({
    occupancyData,
    occupancyThisMonth,
    bookingSources,
    totalBookings,
    avgARR,
}: PerformanceChartsProps) {
    const maxOccupancy = Math.max(...occupancyData.map((d) => Math.max(d.value, d.cityAvg)), 100);
    const totalSourceCount = bookingSources.reduce((sum, s) => sum + s.count, 0);

    return (
        <section>
            <h2 className="oyo-section-title">Property performance</h2>

            <div className="oyo-perf-grid">
                {/* Occupancy Chart */}
                <div className="oyo-card">
                    <div className="oyo-card-body">
                        <div className="oyo-chart-header">
                            <span className="oyo-chart-title">Occupancy</span>
                            <span className="oyo-chart-subtitle">({occupancyThisMonth}% this month)</span>
                        </div>

                        {/* Simple CSS Chart */}
                        <div style={{ position: "relative", height: "150px", marginBottom: "1rem" }}>
                            {/* Y-axis labels */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 20,
                                    width: "40px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    fontSize: "0.625rem",
                                    color: "#9ca3af",
                                }}
                            >
                                <span>100%</span>
                                <span>50%</span>
                                <span>0%</span>
                            </div>

                            {/* Chart area */}
                            <div
                                style={{
                                    marginLeft: "45px",
                                    height: "130px",
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: "4px",
                                    borderBottom: "1px solid #e5e7eb",
                                }}
                            >
                                {occupancyData.map((d, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "2px",
                                        }}
                                    >
                                        {/* City avg line marker */}
                                        <div
                                            style={{
                                                width: "100%",
                                                height: `${(d.value / maxOccupancy) * 100}%`,
                                                background: "linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%)",
                                                borderRadius: "4px 4px 0 0",
                                                position: "relative",
                                            }}
                                        >
                                            {/* City average marker */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: `${((d.cityAvg - d.value) / maxOccupancy) * 100}%`,
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    width: "6px",
                                                    height: "6px",
                                                    background: "#f97316",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* X-axis labels */}
                            <div
                                style={{
                                    marginLeft: "45px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "0.625rem",
                                    color: "#9ca3af",
                                    marginTop: "4px",
                                }}
                            >
                                {occupancyData.slice(0, 5).map((d, i) => (
                                    <span key={i}>{d.date}</span>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <div style={{ width: "12px", height: "12px", background: "#3b82f6", borderRadius: "2px" }} />
                                <span>Your Occupancy</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <div style={{ width: "8px", height: "8px", background: "#f97316", borderRadius: "50%" }} />
                                <span>Avg. City Occupancy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Sources */}
                <div className="oyo-card">
                    <div className="oyo-card-body">
                        <div className="oyo-chart-header">
                            <span className="oyo-chart-title">{totalBookings} URNs</span>
                            <span className="oyo-chart-subtitle">(Last 7 Days)</span>
                        </div>

                        {/* Bar chart */}
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            {bookingSources.map((source, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "80px",
                                            display: "flex",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: `${(source.count / totalSourceCount) * 100}%`,
                                                background:
                                                    i === 0
                                                        ? "#1e3a5f"
                                                        : i === 1
                                                            ? "#3b82f6"
                                                            : i === 2
                                                                ? "#60a5fa"
                                                                : "#93c5fd",
                                                borderRadius: "4px 4px 0 0",
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, marginTop: "0.5rem" }}>
                                        {Math.round((source.count / totalSourceCount) * 100)}%
                                    </span>
                                    <span style={{ fontSize: "0.625rem", color: "#9ca3af" }}>{source.source}</span>
                                </div>
                            ))}
                        </div>

                        {/* Revenue breakdown */}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {bookingSources.map((source, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        textAlign: "center",
                                        padding: "0.5rem",
                                        background: "#f9fafb",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                                        {Math.round((source.count / totalSourceCount) * 100)}%
                                    </div>
                                    <div style={{ fontSize: "0.625rem", color: "#9ca3af" }}>৳{source.revenue}</div>
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "0.75rem",
                                fontSize: "0.75rem",
                                color: "#6b7280",
                            }}
                        >
                            Avg ARR ৳{avgARR}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Ranking Card
interface RankingCardProps {
    occupancyRank: number;
    occupancyChange: "up" | "down" | "same";
    arrRank: string;
    guestExpRank: string;
}

export function RankingCard({ occupancyRank, occupancyChange, arrRank, guestExpRank }: RankingCardProps) {
    return (
        <div className="oyo-card">
            <div className="oyo-card-header">
                <h2 className="oyo-card-title">Rank <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>(Last 7 Days)</span></h2>
                <Link href="/portfolio" className="oyo-card-link">Details</Link>
            </div>
            <div className="oyo-card-body">
                <div className="oyo-rank-item">
                    <span className="oyo-rank-label">
                        Occupancy Rank <span style={{ color: "#9ca3af" }}>ⓘ</span>
                    </span>
                    <span className={`oyo-rank-value ${occupancyChange === "up" ? "oyo-rank-up" : ""}`}>
                        {occupancyChange === "up" && "↑"}
                        {occupancyChange === "down" && "↓"}
                        {occupancyRank}
                    </span>
                </div>
                <div className="oyo-rank-item">
                    <span className="oyo-rank-label">
                        ARR Rank <span style={{ color: "#9ca3af" }}>ⓘ</span>
                    </span>
                    <span className="oyo-rank-value oyo-rank-badge">{arrRank}</span>
                </div>
                <div className="oyo-rank-item">
                    <span className="oyo-rank-label">
                        Guest Exp. Rank
                    </span>
                    <span className="oyo-rank-value oyo-rank-badge">{guestExpRank}</span>
                </div>
            </div>
        </div>
    );
}

// Guest Experience Card
interface GuestExpCardProps {
    happyPercent: number;
    unhappyPercent: number;
    level: number;
}

export function GuestExpCard({ happyPercent, unhappyPercent, level }: GuestExpCardProps) {
    return (
        <div className="oyo-card">
            <div className="oyo-card-header">
                <h2 className="oyo-card-title">Guest Exp <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>(Last 10 Days)</span></h2>
                <Link href="/reviews" className="oyo-card-link">Details</Link>
            </div>
            <div className="oyo-card-body">
                <div className="oyo-guest-exp-item">
                    <span className="oyo-guest-exp-label">Happy</span>
                    <span className="oyo-guest-exp-value oyo-guest-exp-happy">{happyPercent}%</span>
                </div>
                <div className="oyo-guest-exp-item">
                    <span className="oyo-guest-exp-label">Unhappy</span>
                    <span className="oyo-guest-exp-value oyo-guest-exp-unhappy">{unhappyPercent}%</span>
                </div>
                <div className="oyo-guest-exp-item">
                    <span className="oyo-guest-exp-label">3C Level</span>
                    <span className="oyo-guest-exp-value">{level}</span>
                </div>
            </div>
        </div>
    );
}
