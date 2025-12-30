"use client";

import { useState } from "react";
import { FiDownload, FiCalendar, FiFileText, FiBarChart2, FiDollarSign, FiUsers } from "react-icons/fi";

type ReportType = "revenue" | "occupancy" | "bookings" | "guests" | "performance";

interface ReportConfig {
    type: ReportType;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const reportConfigs: ReportConfig[] = [
    {
        type: "revenue",
        icon: <FiDollarSign size={20} />,
        title: "Revenue Report",
        description: "Daily, weekly, monthly revenue breakdowns",
        color: "#10B981",
    },
    {
        type: "occupancy",
        icon: <FiBarChart2 size={20} />,
        title: "Occupancy Report",
        description: "Room utilization and occupancy trends",
        color: "#3B82F6",
    },
    {
        type: "bookings",
        icon: <FiFileText size={20} />,
        title: "Bookings Report",
        description: "Booking sources, cancellations, trends",
        color: "#8B5CF6",
    },
    {
        type: "guests",
        icon: <FiUsers size={20} />,
        title: "Guest Report",
        description: "Guest demographics and loyalty data",
        color: "#F59E0B",
    },
    {
        type: "performance",
        icon: <FiBarChart2 size={20} />,
        title: "Performance Report",
        description: "RevPAR, ADR, and KPI metrics",
        color: "#EF4444",
    },
];

interface ReportBuilderProps {
    onGenerate?: (config: {
        type: ReportType;
        startDate: string;
        endDate: string;
        format: "pdf" | "excel" | "csv";
    }) => void;
}

export function ReportBuilder({ onGenerate }: ReportBuilderProps) {
    const [selectedType, setSelectedType] = useState<ReportType>("revenue");
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await onGenerate?.({
                type: selectedType,
                startDate: startDate || "",
                endDate: endDate || "",
                format,
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="glass-card" style={{ overflow: "hidden" }}>
                {/* Header */}
                <div
                    style={{
                        padding: "1rem 1.25rem",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FiFileText size={18} />
                        Report Builder
                    </h2>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                        Generate custom reports for your hotel
                    </p>
                </div>

                <div style={{ padding: "1.25rem" }}>
                    {/* Report Types */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem" }}>
                            Report Type
                        </label>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                                gap: "0.75rem",
                            }}
                        >
                            {reportConfigs.map((config) => (
                                <button
                                    key={config.type}
                                    onClick={() => setSelectedType(config.type)}
                                    style={{
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        border: `2px solid ${selectedType === config.type ? config.color : "var(--color-border)"}`,
                                        background: selectedType === config.type ? `${config.color}10` : "transparent",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: `${config.color}20`,
                                            color: config.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {config.icon}
                                    </div>
                                    <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "2px" }}>
                                        {config.title}
                                    </div>
                                    <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                                        {config.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem" }}>
                            <FiCalendar style={{ verticalAlign: "middle", marginRight: "0.375rem" }} />
                            Date Range
                        </label>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "140px" }}>
                                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate || ""}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.625rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--color-border)",
                                        background: "var(--color-bg-secondary)",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: "140px" }}>
                                <label style={{ display: "block", fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate || ""}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.625rem 0.75rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--color-border)",
                                        background: "var(--color-bg-secondary)",
                                        fontSize: "0.875rem",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Format */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.75rem" }}>
                            Export Format
                        </label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {(["pdf", "excel", "csv"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    style={{
                                        flex: 1,
                                        padding: "0.625rem 1rem",
                                        borderRadius: "8px",
                                        border: `1px solid ${format === f ? "var(--color-primary)" : "var(--color-border)"}`,
                                        background: format === f ? "var(--color-primary)" : "transparent",
                                        color: format === f ? "white" : "var(--color-text-secondary)",
                                        fontSize: "0.875rem",
                                        fontWeight: format === f ? 600 : 400,
                                        cursor: "pointer",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn-gradient"
                        style={{
                            width: "100%",
                            padding: "0.875rem",
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            opacity: generating ? 0.7 : 1,
                            cursor: generating ? "wait" : "pointer",
                        }}
                    >
                        <FiDownload size={18} />
                        {generating ? "Generating..." : "Generate Report"}
                    </button>
                </div>
            </div>

            {/* Recent Reports (placeholder) */}
            <div className="glass-card" style={{ marginTop: "1rem", padding: "1.25rem" }}>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                    Recent Reports
                </h3>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}
                >
                    {["Revenue Report - Dec 2024", "Occupancy Report - Dec 2024", "Performance Report - Q4 2024"].map((report, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.75rem",
                                background: "var(--color-bg-secondary)",
                                borderRadius: "8px",
                            }}
                        >
                            <span style={{ fontSize: "0.875rem" }}>{report}</span>
                            <button
                                style={{
                                    padding: "0.375rem 0.625rem",
                                    borderRadius: "6px",
                                    border: "1px solid var(--color-border)",
                                    background: "transparent",
                                    color: "var(--color-text-secondary)",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                <FiDownload size={12} />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
