"use client";

import { useEffect, useState } from "react";

interface TodayStatusProps {
    checkInsLeft: number;
    totalCheckIns: number;
    checkOutsLeft: number;
    totalCheckOuts: number;
    roomsInUse: number;
    totalRooms: number;
    eodOccupancy: number;
    roomsLeft: number;
}

function AnimatedProgress({ value, max, color }: { value: number; max: number; color: string }) {
    const [width, setWidth] = useState(0);
    const percentage = max > 0 ? (value / max) * 100 : 0;

    useEffect(() => {
        const timer = setTimeout(() => setWidth(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    return (
        <div style={{
            width: "100%",
            height: "6px",
            background: "var(--color-bg-secondary)",
            borderRadius: "3px",
            overflow: "hidden",
        }}>
            <div style={{
                width: `${width}%`,
                height: "100%",
                background: color,
                borderRadius: "3px",
                transition: "width 0.8s ease-out",
            }} />
        </div>
    );
}

export function TodayStatus({
    checkInsLeft,
    totalCheckIns,
    checkOutsLeft,
    totalCheckOuts,
    roomsInUse,
    totalRooms,
    eodOccupancy,
    roomsLeft,
}: TodayStatusProps) {
    const occupancyColor = eodOccupancy >= 80 ? "#10b981" : eodOccupancy >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
            {/* Header with gradient accent */}
            <div style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--color-border)",
                background: "linear-gradient(90deg, rgba(29, 53, 87, 0.05) 0%, transparent 100%)",
            }}>
                <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span style={{ fontSize: "1.25rem" }}>📊</span>
                    Today&apos;s Status
                </h2>
            </div>

            <div style={{ padding: "1rem 1.25rem" }}>
                {/* Occupancy Gauge - Prominent at top */}
                <div style={{
                    textAlign: "center",
                    padding: "1rem",
                    marginBottom: "1rem",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "12px",
                }}>
                    <div style={{
                        fontSize: "2.5rem",
                        fontWeight: 700,
                        color: occupancyColor,
                        lineHeight: 1,
                    }}>
                        {eodOccupancy}%
                    </div>
                    <div style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                        marginTop: "0.25rem",
                    }}>
                        EOD Occupancy • {roomsLeft} rooms left
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                        <AnimatedProgress value={eodOccupancy} max={100} color={occupancyColor} />
                    </div>
                </div>

                {/* Status rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    <div className="oyo-status-row" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--color-border)",
                    }}>
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            Check-ins remaining
                        </span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                            <strong style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                color: checkInsLeft > 0 ? "var(--color-success)" : "var(--color-text-primary)",
                            }}>
                                {String(checkInsLeft).padStart(2, "0")}
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                / {totalCheckIns}
                            </span>
                        </span>
                    </div>

                    <div className="oyo-status-row" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--color-border)",
                    }}>
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            Checkouts remaining
                        </span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                            <strong style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                color: checkOutsLeft > 0 ? "var(--color-warning)" : "var(--color-text-primary)",
                            }}>
                                {String(checkOutsLeft).padStart(2, "0")}
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                / {totalCheckOuts}
                            </span>
                        </span>
                    </div>

                    <div className="oyo-status-row" style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem 0",
                    }}>
                        <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            Rooms in use
                        </span>
                        <span style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                            <strong style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                color: "var(--color-primary)",
                            }}>
                                {roomsInUse}
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                / {totalRooms}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

