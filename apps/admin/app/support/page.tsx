import { MdSupport, MdInbox, MdPending, MdCheckCircle, MdWarning } from "react-icons/md";
import { getSupportStats, getAllTickets } from "../actions/support";
import { TicketTable } from "./TicketTable";

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
    const [stats, tickets] = await Promise.all([
        getSupportStats(),
        getAllTickets(),
    ]);

    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div>
                    <h1>Support Tickets</h1>
                    <p className="text-muted">Handle partner support requests and issues</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <MdSupport />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Tickets</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <MdInbox />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.open}</span>
                        <span className="stat-label">Open</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                        <MdPending />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.inProgress}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <MdCheckCircle />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.resolved}</span>
                        <span className="stat-label">Resolved</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <MdWarning />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.urgent}</span>
                        <span className="stat-label">Urgent</span>
                    </div>
                </div>
            </div>

            {/* Urgent Tickets Alert */}
            {stats.urgent > 0 && (
                <div className="card" style={{
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                    borderColor: "#ef4444",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <MdWarning style={{ fontSize: "1.5rem", color: "#ef4444" }} />
                        <div>
                            <h4 style={{ margin: 0, color: "#ef4444" }}>
                                {stats.urgent} Urgent Ticket{stats.urgent > 1 ? "s" : ""} Need Attention
                            </h4>
                            <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                                Please prioritize resolving urgent tickets
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tickets Table */}
            <section>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                    All Tickets ({tickets.length})
                </h2>
                <TicketTable tickets={tickets} />
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
