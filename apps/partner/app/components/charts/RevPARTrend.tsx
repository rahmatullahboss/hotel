"use client";

import "./chartjs-register"; // Must be first - registers Chart.js components
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

interface RevPARTrendProps {
  data: { date: string; revpar: number; adr: number }[];
}

export function RevPARTrend({ data }: RevPARTrendProps) {
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
          color: "#64748b", // slate-500
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
          color: "#94a3b8", // slate-400
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
          color: "#94a3b8", // slate-400
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Metric Cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          padding: '12px',
          background: '#f5f3ff',
          borderRadius: '12px',
          border: '1px solid #ede9fe'
        }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            RevPAR
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
              ৳{currentRevPAR.toLocaleString()}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '9999px',
              background: Number(revparChange) >= 0 ? '#dcfce7' : '#fee2e2',
              color: Number(revparChange) >= 0 ? '#15803d' : '#b91c1c'
            }}>
              {Number(revparChange) >= 0 ? "↑" : "↓"} {Math.abs(Number(revparChange))}%
            </span>
          </div>
        </div>

        <div style={{
          flex: 1,
          padding: '12px',
          background: '#fff7ed',
          borderRadius: '12px',
          border: '1px solid #ffedd5'
        }}>
           <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            ADR
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
                ৳{currentADR.toLocaleString()}
            </span>
             <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: '500' }}>Avg</span>
          </div>
        </div>
      </div>

      {/* Chart - Fixed height */}
      <div style={{ width: '100%', height: '120px', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
