import { MdPercent, MdBusiness, MdTrendingUp, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { getCommissionStats, getHotelsWithCommission } from "../actions/commission";
import { DefaultCommission } from "./DefaultCommission";
import { CommissionTable } from "./CommissionTable";

export const dynamic = 'force-dynamic';

export default async function CommissionPage() {
    const [stats, hotels] = await Promise.all([
        getCommissionStats(),
        getHotelsWithCommission(),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Commission Settings</h1>
                    <p className="text-muted">Configure platform commission rates for hotels</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdPercent />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.defaultCommission}%</span>
                        <span className="stat-label">Default Rate</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.avgCommission}%</span>
                        <span className="stat-label">Average</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdArrowDownward />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.minCommission}%</span>
                        <span className="stat-label">Minimum</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdArrowUpward />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.maxCommission}%</span>
                        <span className="stat-label">Maximum</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdBusiness />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.customCommissionCount}</span>
                        <span className="stat-label">Custom Rates</span>
                    </div>
                </div>
            </div>

            {/* Default Commission Settings */}
            <section className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>Default Commission Rate</h3>
                        <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                            New hotels will be assigned this commission rate
                        </p>
                    </div>
                    <DefaultCommission currentRate={stats.defaultCommission} />
                </div>
            </section>

            {/* Hotel Commissions Table */}
            <section>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    Hotel Commission Rates ({hotels.length})
                </h2>
                <CommissionTable hotels={hotels} defaultRate={stats.defaultCommission} />
            </section>
        </div>
    );
}

