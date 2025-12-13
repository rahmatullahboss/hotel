import { getAllChannelConnections, getChannelStats, getRecentSyncLogs } from "../../actions/channels";
import ChannelsAdminClient from "./ChannelsAdminClient";

export const dynamic = "force-dynamic";

// Channel metadata
const CHANNEL_INFO: Record<string, { name: string; logo: string }> = {
    AGODA: { name: "Agoda", logo: "🔵" },
    BOOKING_COM: { name: "Booking.com", logo: "🔷" },
    EXPEDIA: { name: "Expedia", logo: "🟡" },
    SHARETRIP: { name: "ShareTrip", logo: "🟢" },
    GOZAYAAN: { name: "Gozayaan", logo: "🔴" },
};

export default async function ChannelsAdminPage() {
    const [connections, stats, recentLogs] = await Promise.all([
        getAllChannelConnections(),
        getChannelStats(),
        getRecentSyncLogs(30),
    ]);

    return (
        <div className="page-container">
            <header className="page-header">
                <h1 className="page-title">Channel Manager</h1>
                <p className="page-subtitle">Monitor OTA connections across all hotels</p>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Connections</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: "var(--color-success)" }}>
                    <div className="stat-value" style={{ color: "var(--color-success)" }}>{stats.active}</div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: "var(--color-error)" }}>
                    <div className="stat-value" style={{ color: "var(--color-error)" }}>{stats.errors}</div>
                    <div className="stat-label">Errors</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: "var(--color-warning)" }}>
                    <div className="stat-value" style={{ color: "var(--color-warning)" }}>{stats.syncing}</div>
                    <div className="stat-label">Syncing</div>
                </div>
            </div>

            {/* Channel Breakdown */}
            <section style={{ marginBottom: "2rem" }}>
                <h2 className="section-title">By Channel</h2>
                <div className="card-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                    {stats.byChannel.map((ch) => (
                        <div key={ch.channelType} className="card" style={{ padding: "1rem", textAlign: "center" }}>
                            <span style={{ fontSize: "2rem" }}>{CHANNEL_INFO[ch.channelType]?.logo || "🔗"}</span>
                            <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>
                                {CHANNEL_INFO[ch.channelType]?.name || ch.channelType}
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {ch.activeCount}/{ch.count} active
                            </div>
                        </div>
                    ))}
                    {stats.byChannel.length === 0 && (
                        <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-secondary)" }}>
                            No channel connections yet
                        </div>
                    )}
                </div>
            </section>

            {/* Interactive Component */}
            <ChannelsAdminClient
                connections={connections}
                recentLogs={recentLogs}
                channelInfo={CHANNEL_INFO}
            />
        </div>
    );
}
