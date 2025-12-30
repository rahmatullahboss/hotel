"use client";

import { useState } from "react";
import { FiPlus, FiTrash2, FiSend, FiToggleLeft, FiToggleRight, FiClock, FiMail } from "react-icons/fi";
import {
    createScheduledReport,
    toggleScheduledReport,
    deleteScheduledReport,
    sendReportNow,
} from "../actions/reports";
import type { ScheduledReport, ReportScheduleSettings } from "../actions/reports";

interface ReportsClientProps {
    scheduledReports: ScheduledReport[];
    scheduleSettings: ReportScheduleSettings;
    userEmail: string;
}

const REPORT_TYPES = [
    { value: "REVENUE", label: "Revenue Report", icon: "💰" },
    { value: "OCCUPANCY", label: "Occupancy Report", icon: "🏨" },
    { value: "BOOKING", label: "Booking Report", icon: "📅" },
    { value: "PERFORMANCE", label: "Performance Report", icon: "📊" },
] as const;

const FREQUENCIES = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
] as const;

const FORMATS = [
    { value: "PDF", label: "PDF" },
    { value: "EXCEL", label: "Excel" },
    { value: "CSV", label: "CSV" },
] as const;

export default function ReportsClient({
    scheduledReports: initialReports,
    userEmail,
}: ReportsClientProps) {
    const [reports, setReports] = useState(initialReports);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    
    // Create form state
    const [newReport, setNewReport] = useState({
        type: "REVENUE" as ScheduledReport["type"],
        frequency: "DAILY" as ScheduledReport["frequency"],
        format: "PDF" as ScheduledReport["format"],
        recipients: userEmail,
    });

    const handleCreate = async () => {
        setLoading("create");
        const result = await createScheduledReport({
            type: newReport.type,
            frequency: newReport.frequency,
            format: newReport.format,
            recipients: newReport.recipients.split(",").map((r) => r.trim()),
        });

        if (result.success) {
            setShowCreateModal(false);
            // In real app, would refresh from server
        }
        setLoading(null);
    };

    const handleToggle = async (id: string) => {
        setLoading(`toggle-${id}`);
        await toggleScheduledReport(id);
        setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
        );
        setLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this scheduled report?")) return;
        
        setLoading(`delete-${id}`);
        await deleteScheduledReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
        setLoading(null);
    };

    const handleSendNow = async (id: string) => {
        setLoading(`send-${id}`);
        const result = await sendReportNow(id);
        if (result.success) {
            alert("Report sent successfully!");
        }
        setLoading(null);
    };

    const getTypeConfig = (type: ScheduledReport["type"]) => {
        return REPORT_TYPES.find((t) => t.value === type);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "Never";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <>
            <section>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
                        Scheduled Reports
                    </h2>
                    <button
                        className="btn btn-accent"
                        onClick={() => setShowCreateModal(true)}
                        style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
                    >
                        <FiPlus size={14} /> New Schedule
                    </button>
                </div>

                {reports.length === 0 ? (
                    <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                        <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                            No scheduled reports yet
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create Your First Schedule
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {reports.map((report) => {
                            const typeConfig = getTypeConfig(report.type);
                            return (
                                <div
                                    key={report.id}
                                    className="glass-card"
                                    style={{
                                        padding: "1rem",
                                        opacity: report.isActive ? 1 : 0.6,
                                        borderLeft: report.isActive
                                            ? "4px solid var(--color-success)"
                                            : "4px solid var(--color-text-muted)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ fontSize: "1.25rem" }}>{typeConfig?.icon}</span>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{typeConfig?.label}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                    {report.frequency} • {report.format}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggle(report.id)}
                                            disabled={loading === `toggle-${report.id}`}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                                color: report.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                                            }}
                                        >
                                            {report.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <FiMail size={12} />
                                            {report.recipients.length} recipient(s)
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <FiClock size={12} />
                                            Next: {formatDate(report.nextSendAt)}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleSendNow(report.id)}
                                            disabled={loading === `send-${report.id}`}
                                            style={{ fontSize: "0.7rem", flex: 1 }}
                                        >
                                            {loading === `send-${report.id}` ? "Sending..." : <><FiSend size={12} /> Send Now</>}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => handleDelete(report.id)}
                                            disabled={loading === `delete-${report.id}`}
                                            style={{ fontSize: "0.7rem", color: "var(--color-error)", borderColor: "var(--color-error)" }}
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

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
                        className="card"
                        style={{ width: "100%", maxWidth: "400px", padding: "1.5rem" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                            Schedule New Report
                        </h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Report Type
                                </label>
                                <select
                                    className="input"
                                    value={newReport.type}
                                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value as ScheduledReport["type"] })}
                                    style={{ width: "100%" }}
                                >
                                    {REPORT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.icon} {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Frequency
                                </label>
                                <select
                                    className="input"
                                    value={newReport.frequency}
                                    onChange={(e) => setNewReport({ ...newReport, frequency: e.target.value as ScheduledReport["frequency"] })}
                                    style={{ width: "100%" }}
                                >
                                    {FREQUENCIES.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Format
                                </label>
                                <select
                                    className="input"
                                    value={newReport.format}
                                    onChange={(e) => setNewReport({ ...newReport, format: e.target.value as ScheduledReport["format"] })}
                                    style={{ width: "100%" }}
                                >
                                    {FORMATS.map((f) => (
                                        <option key={f.value} value={f.value}>
                                            {f.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Recipients (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newReport.recipients}
                                    onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
                                    placeholder="email@example.com"
                                    style={{ width: "100%" }}
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
                                disabled={loading === "create"}
                                style={{ flex: 1 }}
                            >
                                {loading === "create" ? "Creating..." : "Create Schedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
