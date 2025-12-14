"use client";

import { useState } from "react";
import { MdRefresh, MdCheck } from "react-icons/md";
import { updateHotelCommission, resetHotelCommission } from "../actions/commission";

interface Hotel {
    id: string;
    name: string;
    city: string;
    commissionRate: string;
    status: string;
}

interface CommissionTableProps {
    hotels: Hotel[];
    defaultRate: number;
}

export function CommissionTable({ hotels, defaultRate }: CommissionTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRate, setEditRate] = useState<number>(0);

    const handleEdit = (hotel: Hotel) => {
        setEditingId(hotel.id);
        setEditRate(parseFloat(hotel.commissionRate));
    };

    const handleSave = async (hotelId: string) => {
        setLoadingId(hotelId);
        try {
            await updateHotelCommission(hotelId, editRate);
            setEditingId(null);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleReset = async (hotelId: string) => {
        setLoadingId(hotelId);
        try {
            await resetHotelCommission(hotelId);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            ACTIVE: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
            SUSPENDED: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
            PENDING: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
        };
        const defaultStyle = { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" };
        const style = colors[status] ?? defaultStyle;
        return (
            <span style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 600,
                backgroundColor: style.bg,
                color: style.color,
            }}>
                {status}
            </span>
        );
    };

    if (hotels.length === 0) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                No hotels found
            </div>
        );
    }

    return (
        <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Hotel</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Status</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Commission</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {hotels.map((hotel) => {
                        const isCustom = parseFloat(hotel.commissionRate) !== defaultRate;
                        const isEditing = editingId === hotel.id;

                        return (
                            <tr key={hotel.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{hotel.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{hotel.city}</div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    {getStatusBadge(hotel.status)}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            value={editRate}
                                            onChange={(e) => setEditRate(parseFloat(e.target.value))}
                                            step="0.5"
                                            min="0"
                                            max="50"
                                            style={{
                                                width: "60px",
                                                padding: "0.375rem",
                                                border: "1px solid var(--color-primary)",
                                                borderRadius: "4px",
                                                textAlign: "center",
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            onClick={() => handleEdit(hotel)}
                                            style={{
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                color: isCustom ? "#8b5cf6" : "inherit",
                                                padding: "0.375rem 0.75rem",
                                                borderRadius: "4px",
                                                backgroundColor: isCustom ? "rgba(139, 92, 246, 0.1)" : "transparent",
                                            }}
                                        >
                                            {parseFloat(hotel.commissionRate).toFixed(1)}%
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSave(hotel.id)}
                                                    disabled={loadingId === hotel.id}
                                                    style={{
                                                        padding: "0.375rem 0.75rem",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        backgroundColor: "var(--color-primary)",
                                                        color: "white",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    <MdCheck /> Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                    style={{
                                                        padding: "0.375rem 0.75rem",
                                                        border: "1px solid var(--color-border)",
                                                        borderRadius: "6px",
                                                        background: "var(--color-bg-secondary)",
                                                        cursor: "pointer",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            isCustom && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleReset(hotel.id)}
                                                    disabled={loadingId === hotel.id}
                                                    title="Reset to default"
                                                    style={{
                                                        padding: "0.375rem 0.75rem",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        backgroundColor: "rgba(107, 114, 128, 0.1)",
                                                        color: "#6b7280",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.25rem",
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    <MdRefresh /> Reset
                                                </button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default CommissionTable;
