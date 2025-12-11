import { getHotelsWithRedFlags, getAllHotelMetrics } from "../../actions/metrics";

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
    const [flaggedHotels, allMetrics] = await Promise.all([
        getHotelsWithRedFlags(),
        getAllHotelMetrics(),
    ]);

    return (
        <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Hotel Metrics & Fraud Detection
            </h1>

            {/* Red Flag Alert Section */}
            {flaggedHotels.length > 0 && (
                <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}>
                        🚩 Flagged Hotels ({flaggedHotels.length})
                    </h2>

                    <div style={{
                        background: "rgba(220, 38, 38, 0.05)",
                        border: "1px solid rgba(220, 38, 38, 0.2)",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                    }}>
                        {flaggedHotels.map((hotel) => (
                            <div
                                key={hotel.hotelId}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "1rem",
                                    borderBottom: "1px solid rgba(220, 38, 38, 0.1)",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                        {hotel.hotelName}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "#666" }}>
                                        {hotel.totalCancellations} cancellations / {hotel.totalBookings} bookings
                                        {" • "}{hotel.totalWalkIns} walk-ins
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{
                                        color: "#dc2626",
                                        fontWeight: 600,
                                        marginBottom: "0.25rem",
                                    }}>
                                        🚩 {hotel.redFlags} flag{hotel.redFlags > 1 ? 's' : ''}
                                    </div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "#666",
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
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    All Hotel Performance
                </h2>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                        <thead>
                            <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>Hotel</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Bookings</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Cancellations</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Walk-ins</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Cancel Rate</th>
                                <th style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMetrics.map((hotel) => {
                                const cancelRate = Number(hotel.cancellationRate);
                                const isWarning = cancelRate > 20;
                                const isDanger = cancelRate > 30;

                                return (
                                    <tr key={hotel.hotelId}>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                                            {hotel.hotelName}
                                        </td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                                            {hotel.totalBookings}
                                        </td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                                            {hotel.totalCancellations}
                                        </td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                                            {hotel.totalWalkIns}
                                        </td>
                                        <td style={{
                                            padding: "0.75rem",
                                            borderBottom: "1px solid #e5e7eb",
                                            textAlign: "center",
                                            color: isDanger ? "#dc2626" : isWarning ? "#f59e0b" : "#059669",
                                            fontWeight: 500,
                                        }}>
                                            {cancelRate.toFixed(1)}%
                                        </td>
                                        <td style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>
                                            {hotel.redFlags > 0 ? (
                                                <span style={{
                                                    padding: "0.25rem 0.5rem",
                                                    background: "#fef2f2",
                                                    color: "#dc2626",
                                                    borderRadius: "1rem",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                }}>
                                                    🚩 Flagged
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: "0.25rem 0.5rem",
                                                    background: "#f0fdf4",
                                                    color: "#059669",
                                                    borderRadius: "1rem",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 500,
                                                }}>
                                                    ✓ Good
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Legend */}
            <div style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#f9fafb",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
            }}>
                <strong>Red Flag Detection:</strong>
                <ul style={{ marginTop: "0.5rem", marginLeft: "1rem" }}>
                    <li>🚩 Added when cancellation rate {">"} 30% (min 5 bookings)</li>
                    <li>Search rank penalty: -5 points per flag (max -50)</li>
                    <li>High walk-in + high cancellation = potential fraud</li>
                </ul>
            </div>
        </div>
    );
}
