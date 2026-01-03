"use client";

import "./chartjs-register"; // Must be first - registers Chart.js components
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface RevPARTrendProps {
  data: { date: string; revpar: number; adr: number }[];
  height?: number;
}

export function RevPARTrend({ data, height = 200 }: RevPARTrendProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "RevPAR",
        data: data.map((d) => d.revpar),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        fill: true,
      },
      {
        label: "ADR",
        data: data.map((d) => d.adr),
        borderColor: "#F97316",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#F97316",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          color: "var(--color-text-secondary)",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `${context.dataset.label}: ৳${(context.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "var(--color-text-muted)",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        border: {
          display: false,
        },
        ticks: {
          color: "var(--color-text-muted)",
          font: {
            size: 11,
          },
          callback: (value) => `৳${value}`,
        },
      },
    },
  };

  // Calculate current metrics
  const currentRevPAR = data[data.length - 1]?.revpar ?? 0;
  const currentADR = data[data.length - 1]?.adr ?? 0;
  const previousRevPAR = data[data.length - 2]?.revpar ?? currentRevPAR;
  const revparChange = previousRevPAR > 0 
    ? ((currentRevPAR - previousRevPAR) / previousRevPAR * 100).toFixed(1)
    : "0";

  return (
    <div>
      {/* Metric Cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div
          style={{
            flex: 1,
            padding: "1rem",
            background: "rgba(139, 92, 246, 0.1)",
            borderRadius: "12px",
            borderLeft: "4px solid #8B5CF6",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
            RevPAR (Revenue Per Available Room)
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#8B5CF6" }}>
              ৳{currentRevPAR.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: Number(revparChange) >= 0 ? "var(--color-success)" : "var(--color-error)",
              }}
            >
              {Number(revparChange) >= 0 ? "↑" : "↓"} {Math.abs(Number(revparChange))}%
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "1rem",
            background: "rgba(249, 115, 22, 0.1)",
            borderRadius: "12px",
            borderLeft: "4px solid #F97316",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
            ADR (Average Daily Rate)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#F97316" }}>
            ৳{currentADR.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
