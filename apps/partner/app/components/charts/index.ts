"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Export all chart components
export { RevenueChart } from "./RevenueChart";
export { OccupancyGauge } from "./OccupancyGauge";
export { BookingSourcesPie } from "./BookingSourcesPie";
export { RevPARTrend } from "./RevPARTrend";

// Re-export chart types for convenience
export { Line, Doughnut, Bar };
