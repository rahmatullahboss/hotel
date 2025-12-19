"use client";

import { useState, useTransition } from "react";
import {
    FiClock,
    FiLogIn,
    FiLogOut,
    FiAlertCircle,
} from "react-icons/fi";
import { clockIn, clockOut, type ShiftStatus } from "../actions/staffAttendance";

interface AttendanceWidgetProps {
    initialStatus: ShiftStatus;
}

export function AttendanceWidget({ initialStatus }: AttendanceWidgetProps) {
    const [status, setStatus] = useState<ShiftStatus>(initialStatus);
    const [isPending, startTransition] = useTransition();
    const [note, setNote] = useState("");
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClockIn = () => {
        setError(null);
        startTransition(async () => {
            const result = await clockIn(note || undefined);
            if (result.success) {
                setStatus({
                    isClockedIn: true,
                    currentAttendanceId: result.attendanceId || null,
                    clockInTime: new Date(),
                    hoursWorkedToday: status.hoursWorkedToday,
                });
                setNote("");
                setShowNoteInput(false);
            } else {
                setError(result.error || "Failed to clock in");
            }
        });
    };

    const handleClockOut = () => {
        setError(null);
        startTransition(async () => {
            const result = await clockOut(note || undefined);
            if (result.success) {
                setStatus({
                    isClockedIn: false,
                    currentAttendanceId: null,
                    clockInTime: null,
                    hoursWorkedToday: status.hoursWorkedToday + parseFloat(result.hoursWorked || "0"),
                });
                setNote("");
                setShowNoteInput(false);
            } else {
                setError(result.error || "Failed to clock out");
            }
        });
    };

    const formatTime = (date: Date | null) => {
        if (!date) return "--:--";
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const calculateDuration = () => {
        if (!status.clockInTime) return "0h 0m";
        const now = new Date();
        const clockIn = new Date(status.clockInTime);
        const diffMs = now.getTime() - clockIn.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <FiClock style={{ marginRight: "0.5rem" }} />
                    Shift Status
                </h3>
            </div>
            <div className="card-body">
                {/* Status Indicator */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        backgroundColor: status.isClockedIn
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(156, 163, 175, 0.1)",
                        border: `1px solid ${status.isClockedIn ? "rgba(34, 197, 94, 0.3)" : "rgba(156, 163, 175, 0.3)"}`,
                    }}
                >
                    <div
                        style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: status.isClockedIn ? "#22c55e" : "#9ca3af",
                            animation: status.isClockedIn ? "pulse 2s infinite" : "none",
                        }}
                    />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>
                            {status.isClockedIn ? "On Duty" : "Off Duty"}
                        </div>
                        {status.isClockedIn && (
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                Since {formatTime(status.clockInTime)} ({calculateDuration()})
                            </div>
                        )}
                    </div>
                </div>

                {/* Today's Summary */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            {status.hoursWorkedToday.toFixed(1)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Hours Today
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-secondary)" }}>
                            {status.isClockedIn ? calculateDuration() : "--"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Current Shift
                        </div>
                    </div>
                </div>

                {/* Note Input */}
                {showNoteInput && (
                    <div style={{ marginBottom: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Add a note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.875rem",
                            }}
                        />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            marginBottom: "1rem",
                            borderRadius: "0.5rem",
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            fontSize: "0.875rem",
                        }}
                    >
                        <FiAlertCircle />
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {!showNoteInput ? (
                        <>
                            {status.isClockedIn ? (
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowNoteInput(true)}
                                    disabled={isPending}
                                    style={{ flex: 1 }}
                                >
                                    <FiLogOut style={{ marginRight: "0.5rem" }} />
                                    Clock Out
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowNoteInput(true)}
                                    disabled={isPending}
                                    style={{ flex: 1 }}
                                >
                                    <FiLogIn style={{ marginRight: "0.5rem" }} />
                                    Clock In
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowNoteInput(false);
                                    setNote("");
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${status.isClockedIn ? "btn-secondary" : "btn-primary"}`}
                                onClick={status.isClockedIn ? handleClockOut : handleClockIn}
                                disabled={isPending}
                                style={{ flex: 1 }}
                            >
                                {isPending ? "..." : status.isClockedIn ? "Confirm Clock Out" : "Confirm Clock In"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}
