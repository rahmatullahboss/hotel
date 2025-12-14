import { MdBlock, MdCheckCircle, MdWarning, MdHotel, MdRefresh } from "react-icons/md";
import { getSuspensionStats, getHotelsWithStatus, getHotelsBelowRating } from "../actions/suspension";
import { HotelStatusTable } from "./HotelStatusTable";
import { SuspensionSettings } from "./SuspensionSettings";
import { BulkSuspendButton } from "./BulkSuspendButton";

export const dynamic = 'force-dynamic';

export default async function SuspensionPage() {
    // First get stats to get the threshold
    const stats = await getSuspensionStats();

    // Then fetch other data using the threshold
    const [hotels, lowRatedHotels] = await Promise.all([
        getHotelsWithStatus(),
        getHotelsBelowRating(stats.suspensionThreshold),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Hotel Suspension Management</h1>
                    <p className="text-muted">Monitor and manage hotel statuses based on ratings</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdHotel />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Hotels</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdCheckCircle />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdBlock />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.suspended}</span>
                        <span className="stat-label">Suspended</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdRefresh />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdWarning />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.lowRatedActive}</span>
                        <span className="stat-label">Low Rated</span>
                    </div>
                </div>
            </div>

            {/* Suspension Settings */}
            <section className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>Suspension Threshold</h3>
                        <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                            Hotels with rating below {stats.suspensionThreshold} can be suspended
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <SuspensionSettings currentThreshold={stats.suspensionThreshold} />
                        {lowRatedHotels.length > 0 && (
                            <BulkSuspendButton
                                count={lowRatedHotels.length}
                                threshold={stats.suspensionThreshold}
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Low Rated Hotels Alert */}
            {lowRatedHotels.length > 0 && (
                <section className="card" style={{
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    borderColor: "#ef4444",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <MdWarning style={{ fontSize: "1.5rem", color: "#ef4444" }} />
                        <div>
                            <h4 style={{ margin: 0, color: "#ef4444" }}>
                                {lowRatedHotels.length} Hotels Below Rating Threshold
                            </h4>
                            <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                                These active hotels have ratings below {stats.suspensionThreshold}
                            </p>
                        </div>
                    </div>
                    <ul style={{ margin: "0.75rem 0 0 0", paddingLeft: "1.5rem" }}>
                        {lowRatedHotels.slice(0, 5).map((hotel) => (
                            <li key={hotel.id} style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                                {hotel.name} ({hotel.city}) - Rating: {hotel.rating}
                            </li>
                        ))}
                        {lowRatedHotels.length > 5 && (
                            <li style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                                ...and {lowRatedHotels.length - 5} more
                            </li>
                        )}
                    </ul>
                </section>
            )}

            {/* Hotels Table */}
            <section>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    All Hotels ({hotels.length})
                </h2>
                <HotelStatusTable hotels={hotels} />
            </section>

            <style jsx>{`
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .stat-content {
                    display: flex;
                    flex-direction: column;
                }
                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                }
                .stat-label {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
}
