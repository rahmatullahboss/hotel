"use client";

import { useState } from "react";
import {
    FiPlus,
    FiCheckCircle,
    FiClock,
    FiAlertTriangle,
    FiUser,
    FiTool,
    FiCalendar,
} from "react-icons/fi";
import {
    createMaintenanceRequest,
    updateMaintenanceStatus,
} from "../actions/maintenance";
import { MAINTENANCE_TYPES } from "../lib/constants";
import type { MaintenanceRequest, Vendor, PreventiveMaintenance } from "../actions/maintenance";

interface MaintenanceClientProps {
    requests: MaintenanceRequest[];
    vendors: Vendor[];
    preventive: PreventiveMaintenance[];
    roomList: { roomNumber: string; floor: string }[];
    hotelId: string;
}

const PRIORITY_COLORS = {
    LOW: "#94a3b8",
    MEDIUM: "#fbbf24",
    HIGH: "#f97316",
    URGENT: "#ef4444",
};

const STATUS_CONFIG = {
    OPEN: { label: "Open", color: "#ef4444", icon: FiAlertTriangle },
    IN_PROGRESS: { label: "In Progress", color: "#3b82f6", icon: FiTool },
    PENDING_PARTS: { label: "Pending Parts", color: "#f59e0b", icon: FiClock },
    COMPLETED: { label: "Completed", color: "#10b981", icon: FiCheckCircle },
    CANCELLED: { label: "Cancelled", color: "#6b7280", icon: FiAlertTriangle },
};

export default function MaintenanceClient({
    requests: initialRequests,
    preventive,
    roomList,
    hotelId,
}: MaintenanceClientProps) {
    const [requests, setRequests] = useState(initialRequests);
    const [activeTab, setActiveTab] = useState<"requests" | "preventive">("requests");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "COMPLETED">("ALL");

    // Create form state
    const [newRequest, setNewRequest] = useState({
        type: "PLUMBING" as MaintenanceRequest["type"],
        priority: "MEDIUM" as MaintenanceRequest["priority"],
        roomNumber: "",
        location: "",
        description: "",
    });

    const handleCreate = async () => {
        if (!newRequest.location || !newRequest.description) return;

        setLoading("create");
        const result = await createMaintenanceRequest(hotelId, newRequest);

        if (result.success && result.requestId) {
            const newReq: MaintenanceRequest = {
                id: result.requestId,
                ...newRequest,
                status: "OPEN",
                reportedBy: "Partner App",
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setRequests((prev) => [newReq, ...prev]);
            setShowCreateModal(false);
            setNewRequest({
                type: "PLUMBING",
                priority: "MEDIUM",
                roomNumber: "",
                location: "",
                description: "",
            });
        }
        setLoading(null);
    };

    const handleStatusChange = async (requestId: string, status: MaintenanceRequest["status"]) => {
        setLoading(`status-${requestId}`);
        const result = await updateMaintenanceStatus(requestId, status);
        if (result.success) {
            setRequests((prev) =>
                prev.map((r) => (r.id === requestId ? { ...r, status, updatedAt: new Date() } : r))
            );
        }
        setLoading(null);
    };

    const filteredRequests = filter === "ALL" 
        ? requests 
        : requests.filter((r) => r.status === filter);

    const getTypeConfig = (type: MaintenanceRequest["type"]) => {
        return MAINTENANCE_TYPES.find((t) => t.value === type);
    };

    const formatTimeAgo = (date: Date) => {
        const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <>
            {/* Tab Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "0.5rem",
                    maxWidth: "1200px",
                    margin: "0 auto 1rem auto"
                }}
            >
                {[
                    { key: "requests", label: "Work Orders" },
                    { key: "preventive", label: "Preventive" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "requests" | "preventive")}
                        style={{
                            flex: 1,
                            padding: "0.75rem",
                            borderRadius: "0.5rem 0.5rem 0 0",
                            border: "none",
                            background: activeTab === tab.key ? "var(--color-primary)" : "transparent",
                            color: activeTab === tab.key ? "white" : "var(--color-text-secondary)",
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Work Orders Tab */}
            {activeTab === "requests" && (
                <section style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {/* Header with filters */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                            {(["ALL", "OPEN", "IN_PROGRESS", "COMPLETED"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: "0.375rem 0.5rem",
                                        borderRadius: "0.375rem",
                                        border: "none",
                                        fontSize: "0.7rem",
                                        background: filter === f ? "var(--color-primary)" : "var(--color-bg-secondary)",
                                        color: filter === f ? "white" : "var(--color-text-secondary)",
                                        cursor: "pointer",
                                    }}
                                >
                                    {f === "ALL" ? "All" : f.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-accent"
                            onClick={() => setShowCreateModal(true)}
                            style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
                        >
                            <FiPlus size={14} /> New Request
                        </button>
                    </div>

                    {/* Requests List */}
                    {filteredRequests.length === 0 ? (
                        <div style={{
                            padding: "32px",
                            textAlign: "center",
                            background: "white",
                            borderRadius: "16px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            border: "1px solid #f1f5f9"
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛠️</div>
                            <p style={{ color: "#64748b" }}>
                                No maintenance requests found
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {filteredRequests.map((request) => {
                                const typeConfig = getTypeConfig(request.type);
                                const statusConfig = STATUS_CONFIG[request.status];
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={request.id}
                                        style={{
                                            padding: "16px",
                                            background: "white",
                                            borderRadius: "16px",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                            border: `1px solid #f1f5f9`,
                                            borderLeft: `4px solid ${PRIORITY_COLORS[request.priority]}`,
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span style={{ fontSize: "1.25rem" }}>{typeConfig?.icon}</span>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                                        {request.roomNumber ? `Room ${request.roomNumber}` : request.location}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                        {typeConfig?.label} • {request.priority}
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    fontSize: "0.7rem",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "0.25rem",
                                                    background: statusConfig.color + "20",
                                                    color: statusConfig.color,
                                                }}
                                            >
                                                <StatusIcon size={12} />
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: "0.75rem", marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>
                                            {request.description}
                                        </p>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem" }}>
                                            <div style={{ display: "flex", gap: "0.75rem", color: "var(--color-text-muted)" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                    <FiUser size={10} />
                                                    {request.reportedBy}
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                    <FiClock size={10} />
                                                    {formatTimeAgo(request.createdAt)}
                                                </span>
                                            </div>

                                            {request.status === "OPEN" && (
                                                <button
                                                    onClick={() => handleStatusChange(request.id, "IN_PROGRESS")}
                                                    disabled={loading === `status-${request.id}`}
                                                    style={{
                                                        padding: "0.25rem 0.5rem",
                                                        borderRadius: "0.25rem",
                                                        border: "none",
                                                        fontSize: "0.65rem",
                                                        background: "var(--color-primary)",
                                                        color: "white",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Start Work
                                                </button>
                                            )}

                                            {request.status === "IN_PROGRESS" && (
                                                <button
                                                    onClick={() => handleStatusChange(request.id, "COMPLETED")}
                                                    disabled={loading === `status-${request.id}`}
                                                    style={{
                                                        padding: "0.25rem 0.5rem",
                                                        borderRadius: "0.25rem",
                                                        border: "none",
                                                        fontSize: "0.65rem",
                                                        background: "var(--color-success)",
                                                        color: "white",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {/* Preventive Tab */}
            {activeTab === "preventive" && (
                <section style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Scheduled Maintenance
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {preventive.map((schedule) => {
                            const isOverdue = new Date(schedule.nextDue) < new Date();
                            
                            return (
                                <div
                                    key={schedule.id}
                                    style={{
                                        padding: "16px",
                                        background: "white",
                                        borderRadius: "16px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                        border: `1px solid #f1f5f9`,
                                        borderLeft: isOverdue
                                            ? "4px solid #ef4444"
                                            : "4px solid #10b981",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                                {schedule.name}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                {schedule.type} • {schedule.scope.replace("_", " ")}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.65rem",
                                                fontWeight: 600,
                                                background: isOverdue ? "var(--color-error)" : "var(--color-success)",
                                                color: "white",
                                            }}
                                        >
                                            {isOverdue ? "OVERDUE" : "ON TRACK"}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: "0.75rem", marginBottom: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        {schedule.description}
                                    </p>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <FiCalendar size={10} />
                                                Due: {new Date(schedule.nextDue).toLocaleDateString()}
                                            </span>
                                            <span>
                                                {schedule.checklist.length} items
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-accent"
                                            style={{ fontSize: "0.7rem", padding: "0.375rem 0.5rem" }}
                                        >
                                            Start Checklist
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "24px",
                            maxHeight: "90vh",
                            overflow: "auto",
                            background: "white",
                            borderRadius: "16px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                            New Maintenance Request
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Type
                                </label>
                                <select
                                    className="input"
                                    value={newRequest.type}
                                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as MaintenanceRequest["type"] })}
                                    style={{ width: "100%" }}
                                >
                                    {MAINTENANCE_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.icon} {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Priority
                                </label>
                                <select
                                    className="input"
                                    value={newRequest.priority}
                                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as MaintenanceRequest["priority"] })}
                                    style={{ width: "100%" }}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Room (Optional)
                                </label>
                                <select
                                    className="input"
                                    value={newRequest.roomNumber}
                                    onChange={(e) => setNewRequest({ ...newRequest, roomNumber: e.target.value })}
                                    style={{ width: "100%" }}
                                >
                                    <option value="">Common Area / Other</option>
                                    {roomList.map((r) => (
                                        <option key={r.roomNumber} value={r.roomNumber}>
                                            Room {r.roomNumber} (Floor {r.floor})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Location / Area
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newRequest.location}
                                    onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                                    placeholder="e.g., Bathroom, Kitchen, Lobby"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Description
                                </label>
                                <textarea
                                    className="input"
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                    placeholder="Describe the issue..."
                                    rows={3}
                                    style={{ width: "100%", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowCreateModal(false)}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-accent"
                                onClick={handleCreate}
                                disabled={loading === "create" || !newRequest.location || !newRequest.description}
                                style={{ flex: 1 }}
                            >
                                {loading === "create" ? "Creating..." : "Create Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
