"use client";

import "./chartjs-register"; // Must be first - registers Chart.js components
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
  height?: number;
}

export function RevenueChart({ data, height = 200 }: RevenueChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.revenue),
        fill: true,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(59, 130, 246)",
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
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
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "white",
        bodyColor: "white",
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `৳${(context.parsed.y ?? 0).toLocaleString()}`,
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
          color: "#94a3b8", // slate-400
          font: {
            size: 11,
          },
          maxRotation: 0,
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
          color: "#94a3b8", // slate-400
          font: {
            size: 11,
          },
          callback: (value) => `৳${Number(value) >= 1000 ? `${Number(value) / 1000}K` : value}`,
        },
      },
    },
  };

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
