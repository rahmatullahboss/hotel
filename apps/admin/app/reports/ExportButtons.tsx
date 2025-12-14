"use client";

import { useState } from "react";
import { MdDownload, MdReceipt, MdBusiness, MdPayment } from "react-icons/md";
import { generateExportData } from "../actions/reports";

export function ExportButtons() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleExport = async (type: "bookings" | "revenue-by-hotel" | "payouts") => {
        setLoading(type);
        try {
            const csvData = await generateExportData(type);

            // Create blob and download
            const blob = new Blob([csvData], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export report");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
                type="button"
                onClick={() => handleExport("bookings")}
                disabled={loading !== null}
                style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    background: "var(--color-bg-secondary)",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    opacity: loading && loading !== "bookings" ? 0.5 : 1,
                }}
            >
                <MdReceipt />
                {loading === "bookings" ? "Exporting..." : "Bookings"}
            </button>
            <button
                type="button"
                onClick={() => handleExport("revenue-by-hotel")}
                disabled={loading !== null}
                style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    background: "var(--color-bg-secondary)",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    opacity: loading && loading !== "revenue-by-hotel" ? 0.5 : 1,
                }}
            >
                <MdBusiness />
                {loading === "revenue-by-hotel" ? "Exporting..." : "Revenue"}
            </button>
            <button
                type="button"
                onClick={() => handleExport("payouts")}
                disabled={loading !== null}
                style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    background: "var(--color-bg-secondary)",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontSize: "0.875rem",
                    opacity: loading && loading !== "payouts" ? 0.5 : 1,
                }}
            >
                <MdPayment />
                {loading === "payouts" ? "Exporting..." : "Payouts"}
            </button>
        </div>
    );
}

export default ExportButtons;
