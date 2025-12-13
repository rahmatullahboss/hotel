"use client";

import { useState } from "react";
import { adminForceSyncChannel, adminToggleConnection } from "../../actions/channels";

interface Connection {
    id: string;
    hotelId: string;
    hotelName: string;
    hotelCity: string;
    channelType: string;
    isActive: boolean;
    lastSyncAt: Date | null;
    syncStatus: string | null;
    syncError: string | null;
    externalPropertyId: string | null;
    createdAt: Date;
}

interface SyncLog {
    id: string;
    connectionId: string;
    hotelName: string;
    channelType: string;
    syncType: string;
    status: string;
    itemsSynced: number | null;
    errorMessage: string | null;
    startedAt: Date;
    completedAt: Date | null;
}

interface ChannelInfo {
    [key: string]: { name: string; logo: string };
}

interface Props {
    connections: Connection[];
    recentLogs: SyncLog[];
    channelInfo: ChannelInfo;
}

export default function ChannelsAdminClient({ connections, recentLogs, channelInfo }: Props) {
    const [loading, setLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"connections" | "logs">("connections");

    const handleSync = async (connectionId: string) => {
        setLoading(`sync-${connectionId}`);
        const result = await adminForceSyncChannel(connectionId);
        if (!result.success) {
            alert(result.errorMessage || "Sync failed");
        }
        setLoading(null);
        // Would need to revalidate or refresh here
    };

    const handleToggle = async (connectionId: string, currentActive: boolean) => {
        setLoading(`toggle-${connectionId}`);
        await adminToggleConnection(connectionId, !currentActive);
        setLoading(null);
        // Reload page to see changes
        window.location.reload();
    };

    return (
        <>
            {/* Tab Navigation */}
            <div className="tabs" style={{ marginBottom: "1.5rem" }}>
                <button
                    className={`tab ${activeTab === "connections" ? "active" : ""}`}
                    onClick={() => setActiveTab("connections")}
                >
                    Connections ({connections.length})
                </button>
                <button
                    className={`tab ${activeTab === "logs" ? "active" : ""}`}
                    onClick={() => setActiveTab("logs")}
                >
                    Recent Logs ({recentLogs.length})
                </button>
            </div>

            {/* Connections Table */}
            {activeTab === "connections" && (
                <section>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Hotel</th>
                                    <th>Channel</th>
                                    <th>Property ID</th>
                                    <th>Status</th>
                                    <th>Last Sync</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {connections.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                                            No channel connections found
                                        </td>
                                    </tr>
                                ) : (
                                    connections.map((conn) => (
                                        <tr key={conn.id}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{conn.hotelName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                    {conn.hotelCity}
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{ marginRight: "0.5rem" }}>
                                                    {channelInfo[conn.channelType]?.logo || "🔗"}
                                                </span>
                                                {channelInfo[conn.channelType]?.name || conn.channelType}
                                            </td>
                                            <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                                                {conn.externalPropertyId || "—"}
                                            </td>
                                            <td>
                                                {conn.syncError ? (
                                                    <span className="badge badge-error" title={conn.syncError}>
                                                        Error
                                                    </span>
                                                ) : conn.syncStatus === "SYNCING" ? (
                                                    <span className="badge badge-warning">Syncing</span>
                                                ) : conn.isActive ? (
                                                    <span className="badge badge-success">Active</span>
                                                ) : (
                                                    <span className="badge badge-secondary">Inactive</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: "0.8rem" }}>
                                                {conn.lastSyncAt
                                                    ? new Date(conn.lastSyncAt).toLocaleString()
                                                    : "Never"}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => handleSync(conn.id)}
                                                        disabled={loading === `sync-${conn.id}`}
                                                    >
                                                        {loading === `sync-${conn.id}` ? "..." : "Sync"}
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${conn.isActive ? "btn-outline" : "btn-success"}`}
                                                        onClick={() => handleToggle(conn.id, conn.isActive)}
                                                        disabled={loading === `toggle-${conn.id}`}
                                                    >
                                                        {conn.isActive ? "Disable" : "Enable"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Sync Logs Table */}
            {activeTab === "logs" && (
                <section>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Hotel</th>
                                    <th>Channel</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Items</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                                            No sync logs found
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log) => {
                                        const duration = log.completedAt
                                            ? Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                                            : null;

                                        return (
                                            <tr key={log.id}>
                                                <td style={{ fontSize: "0.8rem" }}>
                                                    {new Date(log.startedAt).toLocaleString()}
                                                </td>
                                                <td>{log.hotelName}</td>
                                                <td>
                                                    <span style={{ marginRight: "0.5rem" }}>
                                                        {channelInfo[log.channelType]?.logo || "🔗"}
                                                    </span>
                                                    {channelInfo[log.channelType]?.name || log.channelType}
                                                </td>
                                                <td style={{ textTransform: "capitalize" }}>
                                                    {log.syncType.toLowerCase().replace("_", " ")}
                                                </td>
                                                <td>
                                                    {log.status === "SUCCESS" ? (
                                                        <span className="badge badge-success">Success</span>
                                                    ) : log.status === "FAILED" ? (
                                                        <span className="badge badge-error" title={log.errorMessage || undefined}>
                                                            Failed
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-warning">In Progress</span>
                                                    )}
                                                </td>
                                                <td>{log.itemsSynced ?? "—"}</td>
                                                <td>{duration !== null ? `${duration}s` : "—"}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </>
    );
}
