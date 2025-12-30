"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface BookingSource {
  source: string;
  count: number;
  revenue: number;
}

interface BookingSourcesPieProps {
  sources: BookingSource[];
  size?: number;
}

const sourceColors: Record<string, string> = {
  Platform: "#3B82F6",
  "Walk-in": "#10B981",
  Direct: "#8B5CF6",
  OTA: "#F59E0B",
  Corporate: "#EC4899",
  Other: "#6B7280",
};

export function BookingSourcesPie({ sources, size = 200 }: BookingSourcesPieProps) {
  const totalBookings = sources.reduce((sum, s) => sum + s.count, 0);
  const totalRevenue = sources.reduce((sum, s) => sum + s.revenue, 0);

  const chartData = {
    labels: sources.map((s) => s.source),
    datasets: [
      {
        data: sources.map((s) => s.count),
        backgroundColor: sources.map((s) => sourceColors[s.source] || "#6B7280"),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const source = sources[context.dataIndex];
            const percentage = totalBookings > 0 
              ? ((source?.count ?? 0) / totalBookings * 100).toFixed(0) 
              : "0";
            return `${source?.count ?? 0} bookings (${percentage}%)`;
          },
          afterLabel: (context) => {
            const source = sources[context.dataIndex];
            return `Revenue: ৳${(source?.revenue ?? 0).toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
      {/* Chart */}
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
        }}
      >
        <Doughnut data={chartData} options={options} />

        {/* Center text */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            {totalBookings}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            Bookings
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
        {sources.map((source) => {
          const percentage = totalBookings > 0 
            ? ((source.count / totalBookings) * 100).toFixed(0) 
            : "0";
          const color = sourceColors[source.source] || "#6B7280";

          return (
            <div
              key={source.source}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    background: color,
                  }}
                />
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                  {source.source}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {source.count} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({percentage}%)</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-success)" }}>
                  ৳{source.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "0.5rem",
            marginTop: "auto",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>Total Revenue</span>
          <span style={{ fontWeight: 700, color: "var(--color-success)", fontSize: "1.125rem" }}>
            ৳{totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
