"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface OccupancyGaugeProps {
  occupancyRate: number;
  targetRate?: number;
  size?: number;
}

export function OccupancyGauge({
  occupancyRate,
  targetRate = 80,
  size = 180,
}: OccupancyGaugeProps) {
  const getColor = (rate: number) => {
    if (rate >= 80) return "#10B981"; // Green
    if (rate >= 50) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const mainColor = getColor(occupancyRate);

  const chartData = {
    datasets: [
      {
        data: [occupancyRate, 100 - occupancyRate],
        backgroundColor: [mainColor, "rgba(148, 163, 184, 0.1)"],
        borderWidth: 0,
        cutout: "75%",
        rotation: -90,
        circumference: 180,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const isOnTarget = occupancyRate >= targetRate;

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size / 2 + 30}px`,
        margin: "0 auto",
      }}
    >
      <div style={{ width: `${size}px`, height: `${size}px`, marginTop: `-${size / 4}px` }}>
        <Doughnut data={chartData} options={options} />
      </div>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, 0)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: `${size / 5}px`,
            fontWeight: 700,
            color: mainColor,
            lineHeight: 1,
          }}
        >
          {occupancyRate}%
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            marginTop: "4px",
          }}
        >
          Occupancy
        </div>
      </div>

      {/* Target indicator */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.75rem",
          color: isOnTarget ? "var(--color-success)" : "var(--color-text-muted)",
        }}
      >
        {isOnTarget ? "✓" : "○"} Target: {targetRate}%
      </div>
    </div>
  );
}
