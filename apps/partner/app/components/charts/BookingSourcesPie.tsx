"use client";

import "./chartjs-register"; // Must be first - registers Chart.js components
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

export function BookingSourcesPie({ sources }: BookingSourcesPieProps) {
  const totalBookings = sources.reduce((sum, s) => sum + s.count, 0);

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
       <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
           {/* Chart */}
          <div style={{ position: 'relative', width: '180px', height: '180px', zIndex: 10 }}>
             <Doughnut data={chartData} options={options} />
             {/* Center text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>
                {totalBookings}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bookings
              </div>
            </div>
          </div>
            {/* Soft Glow behind chart */}
           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '128px', height: '128px', background: 'rgba(219, 234, 254, 0.5)', borderRadius: '9999px', filter: 'blur(48px)', zIndex: 0 }} />
       </div>

      {/* Legend Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
        {sources.slice(0, 4).map((source) => {
           const color = sourceColors[source.source] || "#6B7280";
           return (
             <div key={source.source} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '12px', background: 'rgba(248, 250, 252, 0.8)', border: '1px solid #f1f5f9' }}>
                <div style={{ width: '8px', height: '32px', borderRadius: '9999px', backgroundColor: color }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{source.source}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {source.count} • ৳{(source.revenue / 1000).toFixed(1)}k
                  </div>
                </div>
             </div>
           )
        })}
      </div>
    </div>
  );
}
