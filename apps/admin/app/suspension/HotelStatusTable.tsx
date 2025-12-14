"use client";

import { useState } from "react";
import { MdBlock, MdCheckCircle, MdMoreVert } from "react-icons/md";
import { suspendHotel, activateHotel } from "../actions/suspension";

interface Hotel {
    id: string;
    name: string;
    city: string;
    status: string;
    rating: string | null;
    reviewCount: number;
    ownerName: string | null;
    ownerPhone: string | null;
    createdAt: Date;
}

interface HotelStatusTableProps {
    hotels: Hotel[];
}

export function HotelStatusTable({ hotels }: HotelStatusTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);

    const handleSuspend = async (hotelId: string) => {
        if (!suspendReason.trim()) {
            alert("Please provide a reason for suspension");
            return;
        }
        setLoadingId(hotelId);
        try {
            await suspendHotel(hotelId, suspendReason);
            setShowModal(null);
            setSuspendReason("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleActivate = async (hotelId: string) => {
        setLoadingId(hotelId);
        try {
            await activateHotel(hotelId);
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
        const defaultStyle = { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" };
        const style = colors[status] ?? defaultStyle;
        return (
            <span style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: style.bg,
                color: style.color,
            }}>
                {status}
            </span>
        );
    };

    const getRatingColor = (rating: string | null) => {
        const r = parseFloat(rating || "0");
        if (r >= 4) return "#22c55e";
        if (r >= 3) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <>
            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Hotel</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Owner</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Rating</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Status</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.map((hotel) => (
                            <tr key={hotel.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{hotel.name}</div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{hotel.city}</div>
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div>
                                        <div style={{ fontSize: "0.875rem" }}>{hotel.ownerName || "N/A"}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{hotel.ownerPhone || "N/A"}</div>
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    <span style={{
                                        fontWeight: 700,
                                        color: getRatingColor(hotel.rating),
                                        fontSize: "1rem",
                                    }}>
                                        {hotel.rating ? parseFloat(hotel.rating).toFixed(1) : "N/A"}
                                    </span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "0.25rem" }}>
                                        ({hotel.reviewCount})
                                    </span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    {getStatusBadge(hotel.status)}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    {hotel.status === "SUSPENDED" ? (
                                        <button
                                            type="button"
                                            onClick={() => handleActivate(hotel.id)}
                                            disabled={loadingId === hotel.id}
                                            style={{
                                                padding: "0.375rem 0.75rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(34, 197, 94, 0.1)",
                                                color: "#22c55e",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            <MdCheckCircle /> Activate
                                        </button>
                                    ) : hotel.status === "PENDING" ? (
                                        <button
                                            type="button"
                                            onClick={() => handleActivate(hotel.id)}
                                            disabled={loadingId === hotel.id}
                                            style={{
                                                padding: "0.375rem 0.75rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                color: "#3b82f6",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            <MdCheckCircle /> Approve
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(hotel.id)}
                                            disabled={loadingId === hotel.id}
                                            style={{
                                                padding: "0.375rem 0.75rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            <MdBlock /> Suspend
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Suspend Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "var(--color-bg-primary)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        width: "100%",
                        maxWidth: "400px",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>Suspend Hotel</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                            Please provide a reason for suspending this hotel:
                        </p>
                        <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="e.g., Rating dropped below threshold, Multiple complaints..."
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                resize: "none",
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => { setShowModal(null); setSuspendReason(""); }}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "8px",
                                    background: "var(--color-bg-secondary)",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSuspend(showModal)}
                                disabled={loadingId === showModal}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#ef4444",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                {loadingId === showModal ? "Suspending..." : "Suspend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HotelStatusTable;
