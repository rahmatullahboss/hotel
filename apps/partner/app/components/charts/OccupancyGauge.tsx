"use client";

import "./chartjs-register"; // Must be first - registers Chart.js components
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
      className="relative mx-auto flex flex-col items-center"
      style={{
        width: `${size}px`,
        height: `${size / 2 + 30}px`,
      }}
    >
      {/* Gauge Chart */}
      <div 
        className="relative overflow-hidden"
        style={{ width: `${size}px`, height: `${size / 2}px` }}
      >
        <div style={{ width: `${size}px`, height: `${size}px` }}>
           <Doughnut data={chartData} options={options} />
        </div>
      </div>

      {/* Center text Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none"
        style={{ height: `${size / 2}px` }}
      >
        <div
          className="font-bold leading-none"
          style={{
            fontSize: `${size / 5}px`,
            color: mainColor,
          }}
        >
          {occupancyRate}%
        </div>
        <div className="text-xs text-slate-500 mt-1 font-medium bg-white/80 px-2 rounded-full backdrop-blur-sm">
          Occupancy
        </div>
      </div>

      {/* Target indicator */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
        <span className={isOnTarget ? "text-emerald-600 font-bold" : "text-slate-400"}>
           {isOnTarget ? "✓" : "○"}
        </span>
        <span>Target: {targetRate}%</span>
      </div>
    </div>
  );
}
