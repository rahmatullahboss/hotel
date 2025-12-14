import { MdCardGiftcard, MdToggleOn, MdToggleOff, MdAdd, MdPending, MdCheckCircle } from "react-icons/md";
import { getIncentiveDashboardStats, getAllPrograms, getPendingClaims } from "../actions/incentives";
import { IncentiveToggle } from "./IncentiveToggle";
import { ProgramList } from "./ProgramList";
import { ClaimsList } from "./ClaimsList";
import { CreateProgramButton } from "./CreateProgramButton";

export const dynamic = 'force-dynamic';

export default async function IncentivesPage() {
    const [stats, programs, pendingClaims] = await Promise.all([
        getIncentiveDashboardStats(),
        getAllPrograms(),
        getPendingClaims(),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Incentive Management</h1>
                    <p className="text-muted">Manage incentive programs for hotel owners</p>
                </div>
            </header>

            {/* Toggle Section */}
            <section className="card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>Hotel Owner Incentives</h3>
                        <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                            {stats.isEnabled
                                ? "Incentives are visible to hotel owners"
                                : "Incentives are hidden from hotel owners"}
                        </p>
                    </div>
                    <IncentiveToggle isEnabled={stats.isEnabled} />
                </div>
            </section>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdCardGiftcard />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activePrograms}</span>
                        <span className="stat-label">Active Programs</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdPending />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.pendingClaims}</span>
                        <span className="stat-label">Pending Claims</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdCheckCircle />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{stats.totalPaid.toLocaleString()}</span>
                        <span className="stat-label">Total Paid Out</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdCardGiftcard />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalPrograms}</span>
                        <span className="stat-label">Total Programs</span>
                    </div>
                </div>
            </div>

            {/* Pending Claims */}
            {pendingClaims.length > 0 && (
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Pending Claims ({pendingClaims.length})
                    </h2>
                    <ClaimsList claims={pendingClaims} />
                </section>
            )}

            {/* Programs Section */}
            <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
                        Incentive Programs ({programs.length})
                    </h2>
                    <CreateProgramButton />
                </div>
                <ProgramList programs={programs} />
            </section>
        </div>
    );
}

