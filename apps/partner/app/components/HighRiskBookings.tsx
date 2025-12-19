"use client";

import { useState } from "react";
import { type BookingRiskScore } from "../actions/prediction";
import { FiAlertTriangle, FiPhone, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface HighRiskBookingsProps {
    bookings: BookingRiskScore[];
}

export function HighRiskBookings({ bookings }: HighRiskBookingsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (bookings.length === 0) {
        return null;
    }

    const getRiskColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
        switch (level) {
            case "HIGH":
                return "var(--color-error)";
            case "MEDIUM":
                return "var(--color-warning)";
            default:
                return "var(--color-success)";
        }
    };

    const getRiskBadgeClass = (level: "LOW" | "MEDIUM" | "HIGH") => {
        switch (level) {
            case "HIGH":
                return "badge-error";
            case "MEDIUM":
                return "badge-warning";
            default:
                return "badge-success";
        }
    };

    return (
        <section style={{ marginBottom: "1.5rem" }}>
            <h2
                style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                    color: "var(--color-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <FiAlertTriangle style={{ color: "var(--color-warning)" }} />
                No-Show Risk Alert ({bookings.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {bookings.map((booking) => {
                    const isExpanded = expandedId === booking.bookingId;

                    return (
                        <div
                            key={booking.bookingId}
                            className="card"
                            style={{
                                padding: 0,
                                overflow: "hidden",
                                borderLeft: `4px solid ${getRiskColor(booking.riskLevel)}`,
                            }}
                        >
                            {/* Main Row */}
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : booking.bookingId)}
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ fontWeight: 600 }}>{booking.guestName}</span>
                                        <span className={`badge ${getRiskBadgeClass(booking.riskLevel)}`} style={{ fontSize: "0.625rem" }}>
                                            {booking.riskScore}% Risk
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        🚪 {booking.roomNumber} • 📅 {booking.checkIn}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <a
                                        href={`tel:${booking.guestPhone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="btn btn-outline"
                                        style={{ padding: "0.5rem", fontSize: "0.75rem" }}
                                    >
                                        <FiPhone />
                                    </a>
                                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                </div>
                            </button>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div
                                    style={{
                                        padding: "0 1rem 1rem",
                                        borderTop: "1px dashed var(--color-border)",
                                    }}
                                >
                                    {/* Risk Factors */}
                                    <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>
                                            RISK FACTORS
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            {booking.riskFactors.map((factor, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        fontSize: "0.8125rem",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                    }}
                                                >
                                                    <span style={{ color: "var(--color-warning)" }}>⚠️</span>
                                                    <span>{factor.name}</span>
                                                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                                                        (+{Math.round(factor.weight)} pts)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div
                                        style={{
                                            background: "var(--color-bg-secondary)",
                                            padding: "0.75rem",
                                            borderRadius: "0.5rem",
                                            marginBottom: "0.75rem",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>Total Bill</span>
                                            <span style={{ fontWeight: 600 }}>৳{booking.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                                            <span style={{ color: booking.advancePaid > 0 ? "var(--color-success)" : "var(--color-warning)" }}>
                                                {booking.advancePaid > 0 ? "✓ Advance Paid" : "⚠️ No Advance"}
                                            </span>
                                            <span style={{ fontWeight: 600 }}>৳{booking.advancePaid.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Suggested Actions */}
                                    <div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text-secondary)" }}>
                                            SUGGESTED ACTIONS
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            {booking.suggestedActions.map((action, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        fontSize: "0.8125rem",
                                                        padding: "0.5rem",
                                                        background: "var(--color-bg-tertiary)",
                                                        borderRadius: "0.25rem",
                                                    }}
                                                >
                                                    {action}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
