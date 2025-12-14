"use client";

interface MonthlyData {
    month: string;
    bookings: number;
    revenue: number;
    commission: number;
}

interface MonthlyChartProps {
    data: MonthlyData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.map((month) => (
                <div key={month.month} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "40px", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        {month.month}
                    </div>
                    <div style={{ flex: 1, height: "24px", display: "flex", gap: "2px" }}>
                        {/* Revenue Bar */}
                        <div
                            style={{
                                height: "100%",
                                width: `${(month.revenue / maxRevenue) * 100}%`,
                                backgroundColor: "#22c55e",
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                                minWidth: month.revenue > 0 ? "4px" : 0,
                            }}
                        />
                        {/* Commission Bar */}
                        <div
                            style={{
                                height: "100%",
                                width: `${(month.commission / maxRevenue) * 100}%`,
                                backgroundColor: "#8b5cf6",
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                                minWidth: month.commission > 0 ? "4px" : 0,
                            }}
                        />
                    </div>
                    <div style={{ width: "80px", textAlign: "right", fontSize: "0.75rem", fontWeight: 500 }}>
                        ৳{month.revenue.toLocaleString()}
                    </div>
                </div>
            ))}

            {/* Legend */}
            <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
                    <div style={{ width: "12px", height: "12px", backgroundColor: "#22c55e", borderRadius: "2px" }} />
                    Revenue
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}>
                    <div style={{ width: "12px", height: "12px", backgroundColor: "#8b5cf6", borderRadius: "2px" }} />
                    Commission
                </div>
            </div>
        </div>
    );
}

export default MonthlyChart;
