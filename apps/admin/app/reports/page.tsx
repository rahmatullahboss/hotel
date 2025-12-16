import { MdDownload, MdTrendingUp, MdAttachMoney, MdReceipt, MdBusiness } from "react-icons/md";
import { getBookingReport, getMonthlyTrend, getRevenueByHotelReport } from "../actions/reports";
import { ExportButtons } from "./ExportButtons";
import { MonthlyChart } from "./MonthlyChart";
import { TopHotels } from "./TopHotels";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const year = new Date().getFullYear();
    const [report, monthlyData, hotelRevenue] = await Promise.all([
        getBookingReport(),
        getMonthlyTrend(year),
        getRevenueByHotelReport(),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>Reports & Analytics</h1>
                    <p className="text-muted">Platform-wide performance data and export</p>
                </div>
                <ExportButtons />
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdReceipt />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{report.totalBookings.toLocaleString()}</span>
                        <span className="stat-label">Total Bookings</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdAttachMoney />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{report.totalRevenue.toLocaleString()}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{report.totalCommission.toLocaleString()}</span>
                        <span className="stat-label">Commission Earned</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdBusiness />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{report.avgBookingValue.toLocaleString()}</span>
                        <span className="stat-label">Avg Booking Value</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                {/* Monthly Trend */}
                <section className="card" style={{ padding: "1.25rem" }}>
                    <h3 style={{ margin: "0 0 1rem 0" }}>Monthly Revenue Trend ({year})</h3>
                    <MonthlyChart data={monthlyData} />
                </section>

                {/* Top Hotels */}
                <section className="card" style={{ padding: "1.25rem" }}>
                    <h3 style={{ margin: "0 0 1rem 0" }}>Top Hotels by Revenue</h3>
                    <TopHotels hotels={hotelRevenue.slice(0, 5)} />
                </section>
            </div>

            {/* All Hotels Revenue Table */}
            <section className="card" style={{ overflow: "hidden" }}>
                <h3 style={{ margin: "1rem 1rem 0 1rem" }}>Revenue by Hotel</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Hotel</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Bookings</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Revenue</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Commission</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotelRevenue.map((hotel: any) => (
                            <tr key={hotel.hotelId} style={{ borderTop: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{hotel.hotelName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{hotel.city}</div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>{hotel.bookingCount}</td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 500 }}>
                                    ৳{hotel.revenue.toLocaleString()}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#8b5cf6" }}>
                                    ৳{hotel.commission.toLocaleString()}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#22c55e", fontWeight: 600 }}>
                                    ৳{hotel.netRevenue.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

