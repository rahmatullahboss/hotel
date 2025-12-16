import { getHotelsWithRedFlags, getAllHotelMetrics } from "../../actions/metrics";

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
    const [flaggedHotels, allMetrics] = await Promise.all([
        getHotelsWithRedFlags(),
        getAllHotelMetrics(),
    ]);

    return (
        <div style={{ padding: "0 0.5rem" }}>
            <div className="page-header">
                <h1 className="page-title">Hotel Metrics & Fraud Detection</h1>
                <p className="page-subtitle">Monitor hotel performance and detect suspicious patterns</p>
            </div>

            {/* Red Flag Alert Section */}
            {flaggedHotels.length > 0 && (
                <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "var(--color-error)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}>
                        🚩 Flagged Hotels ({flaggedHotels.length})
                    </h2>

                    <div className="card" style={{ padding: "0", overflow: "hidden" }}>
                        {flaggedHotels.map((hotel: any, index: number) => (
                            <div
                                key={hotel.hotelId}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "1rem 1.25rem",
                                    borderBottom: index < flaggedHotels.length - 1 ? "1px solid var(--color-border)" : "none",
                                    background: "rgba(239, 68, 68, 0.03)",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--color-text-primary)" }}>
                                        {hotel.hotelName}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        {hotel.totalCancellations} cancellations / {hotel.totalBookings} bookings
                                        {" • "}{hotel.totalWalkIns} walk-ins
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{
                                        color: "var(--color-error)",
                                        fontWeight: 600,
                                        marginBottom: "0.25rem",
                                    }}>
                                        🚩 {hotel.redFlags} flag{hotel.redFlags > 1 ? 's' : ''}
                                    </div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-text-secondary)",
                                    }}>
                                        {Number(hotel.cancellationRate).toFixed(0)}% cancel rate
                                        {" • "}-{hotel.searchRankPenalty} rank
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* All Hotels Metrics */}
            <section>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text-primary)" }}>
                    All Hotel Performance
                </h2>

                <div className="card" style={{ overflow: "hidden" }}>
                    <span className="scroll-hint">← Scroll to see more →</span>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Hotel</th>
                                    <th style={{ textAlign: "center" }}>Bookings</th>
                                    <th style={{ textAlign: "center" }}>Cancellations</th>
                                    <th style={{ textAlign: "center" }}>Walk-ins</th>
                                    <th style={{ textAlign: "center" }}>Cancel Rate</th>
                                    <th style={{ textAlign: "center" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allMetrics.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="table-empty">
                                            No hotel metrics available yet
                                        </td>
                                    </tr>
                                ) : (
                                    allMetrics.map((hotel: any) => {
                                        const cancelRate = Number(hotel.cancellationRate);
                                        const isWarning = cancelRate > 20;
                                        const isDanger = cancelRate > 30;

                                        return (
                                            <tr key={hotel.hotelId}>
                                                <td className="table-cell-primary">
                                                    {hotel.hotelName || "Unknown Hotel"}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {hotel.totalBookings}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {hotel.totalCancellations}
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {hotel.totalWalkIns}
                                                </td>
                                                <td style={{
                                                    textAlign: "center",
                                                    color: isDanger ? "var(--color-error)" : isWarning ? "var(--color-warning)" : "var(--color-success)",
                                                    fontWeight: 500,
                                                }}>
                                                    {cancelRate.toFixed(1)}%
                                                </td>
                                                <td style={{ textAlign: "center" }}>
                                                    {hotel.redFlags > 0 ? (
                                                        <span className="badge badge-error">
                                                            🚩 Flagged
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-success">
                                                            ✓ Good
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Legend */}
            <div className="card" style={{
                marginTop: "2rem",
                padding: "1.25rem",
            }}>
                <strong style={{ color: "var(--color-text-primary)" }}>Red Flag Detection:</strong>
                <ul style={{ marginTop: "0.75rem", marginLeft: "1.25rem", color: "var(--color-text-secondary)" }}>
                    <li style={{ marginBottom: "0.25rem" }}>🚩 Added when cancellation rate {">"} 30% (min 5 bookings)</li>
                    <li style={{ marginBottom: "0.25rem" }}>Search rank penalty: -5 points per flag (max -50)</li>
                    <li>High walk-in + high cancellation = potential fraud indicator</li>
                </ul>
            </div>
        </div>
    );
}
