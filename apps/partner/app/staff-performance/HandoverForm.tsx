"use client";

import { useState, useTransition } from "react";
import {
    FiClipboard,
    FiCheckCircle,
    FiClock,
    FiAlertTriangle,
    FiPlus,
    FiTrash2,
    FiSend,
} from "react-icons/fi";
import {
    createHandoverReport,
    type HandoverReport,
} from "../actions/staffAttendance";
import type { HandoverTask } from "@repo/db/schema";
import type { StaffMember } from "../actions/staff";

interface HandoverFormProps {
    staffMembers: StaffMember[];
    latestReport: HandoverReport | null;
    onSuccess?: () => void;
}

export function HandoverForm({ staffMembers, latestReport, onSuccess }: HandoverFormProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [toStaffId, setToStaffId] = useState("");
    const [notes, setNotes] = useState("");
    const [checkInsHandled, setCheckInsHandled] = useState(0);
    const [checkOutsHandled, setCheckOutsHandled] = useState(0);
    const [walkInsRecorded, setWalkInsRecorded] = useState(0);
    const [issuesReported, setIssuesReported] = useState(0);

    // Initialize pending tasks from latest report if available
    const [pendingTasks, setPendingTasks] = useState<HandoverTask[]>(
        latestReport?.pendingTasks?.filter((t) => t.status !== "COMPLETED") || []
    );
    const [completedTasks, setCompletedTasks] = useState<HandoverTask[]>([]);

    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

    const addPendingTask = () => {
        if (!newTaskDesc.trim()) return;

        const newTask: HandoverTask = {
            id: crypto.randomUUID(),
            description: newTaskDesc.trim(),
            priority: newTaskPriority,
            status: "PENDING",
        };

        setPendingTasks([...pendingTasks, newTask]);
        setNewTaskDesc("");
    };

    const removeTask = (taskId: string, fromCompleted: boolean) => {
        if (fromCompleted) {
            setCompletedTasks(completedTasks.filter((t) => t.id !== taskId));
        } else {
            setPendingTasks(pendingTasks.filter((t) => t.id !== taskId));
        }
    };

    const markTaskComplete = (taskId: string) => {
        const task = pendingTasks.find((t) => t.id === taskId);
        if (task) {
            setPendingTasks(pendingTasks.filter((t) => t.id !== taskId));
            setCompletedTasks([...completedTasks, { ...task, status: "COMPLETED" }]);
        }
    };

    const handleSubmit = () => {
        setError(null);
        setSuccess(false);

        startTransition(async () => {
            const result = await createHandoverReport({
                toStaffId: toStaffId || undefined,
                pendingTasks,
                completedTasks,
                notes: notes || undefined,
                checkInsHandled,
                checkOutsHandled,
                walkInsRecorded,
                issuesReported,
            });

            if (result.success) {
                setSuccess(true);
                // Reset form
                setToStaffId("");
                setNotes("");
                setPendingTasks([]);
                setCompletedTasks([]);
                setCheckInsHandled(0);
                setCheckOutsHandled(0);
                setWalkInsRecorded(0);
                setIssuesReported(0);
                onSuccess?.();
            } else {
                setError(result.error || "Failed to create handover report");
            }
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH":
                return "#ef4444";
            case "MEDIUM":
                return "#f59e0b";
            case "LOW":
                return "#22c55e";
            default:
                return "#9ca3af";
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <FiClipboard style={{ marginRight: "0.5rem" }} />
                    Shift Handover Report
                </h3>
            </div>
            <div className="card-body">
                {/* Shift Statistics */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <input
                            type="number"
                            min="0"
                            value={checkInsHandled}
                            onChange={(e) => setCheckInsHandled(parseInt(e.target.value) || 0)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                textAlign: "center",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                            Check-ins
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input
                            type="number"
                            min="0"
                            value={checkOutsHandled}
                            onChange={(e) => setCheckOutsHandled(parseInt(e.target.value) || 0)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                textAlign: "center",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                            Check-outs
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input
                            type="number"
                            min="0"
                            value={walkInsRecorded}
                            onChange={(e) => setWalkInsRecorded(parseInt(e.target.value) || 0)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                textAlign: "center",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                            Walk-ins
                        </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <input
                            type="number"
                            min="0"
                            value={issuesReported}
                            onChange={(e) => setIssuesReported(parseInt(e.target.value) || 0)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                textAlign: "center",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                            Issues
                        </div>
                    </div>
                </div>

                {/* Next Staff */}
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                        Handing over to
                    </label>
                    <select
                        value={toStaffId}
                        onChange={(e) => setToStaffId(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.875rem",
                        }}
                    >
                        <option value="">Not specified</option>
                        {staffMembers.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.name || staff.email} ({staff.role})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pending Tasks */}
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                        <FiClock style={{ marginRight: "0.5rem" }} />
                        Pending Tasks ({pendingTasks.length})
                    </label>

                    {pendingTasks.map((task) => (
                        <div
                            key={task.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                marginBottom: "0.5rem",
                                backgroundColor: "var(--color-bg-secondary)",
                                borderRadius: "0.5rem",
                                borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
                            }}
                        >
                            <button
                                onClick={() => markTaskComplete(task.id)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#22c55e",
                                }}
                                title="Mark complete"
                            >
                                <FiCheckCircle />
                            </button>
                            <span style={{ flex: 1, fontSize: "0.875rem" }}>{task.description}</span>
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    padding: "0.125rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    backgroundColor: getPriorityColor(task.priority),
                                    color: "white",
                                }}
                            >
                                {task.priority}
                            </span>
                            <button
                                onClick={() => removeTask(task.id, false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#ef4444",
                                }}
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}

                    {/* Add new task */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <input
                            type="text"
                            placeholder="Add pending task..."
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPendingTask()}
                            style={{
                                flex: 1,
                                padding: "0.5rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.875rem",
                            }}
                        />
                        <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                            style={{
                                padding: "0.5rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.875rem",
                            }}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                        <button className="btn btn-outline" onClick={addPendingTask}>
                            <FiPlus />
                        </button>
                    </div>
                </div>

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                            <FiCheckCircle style={{ marginRight: "0.5rem", color: "#22c55e" }} />
                            Completed This Shift ({completedTasks.length})
                        </label>
                        {completedTasks.map((task) => (
                            <div
                                key={task.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem",
                                    marginBottom: "0.25rem",
                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                    borderRadius: "0.5rem",
                                    textDecoration: "line-through",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                <FiCheckCircle style={{ color: "#22c55e" }} />
                                <span style={{ flex: 1, fontSize: "0.875rem" }}>{task.description}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Notes */}
                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>
                        Notes for Next Shift
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any important information for the next shift..."
                        rows={3}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            border: "1px solid var(--color-border)",
                            fontSize: "0.875rem",
                            resize: "vertical",
                        }}
                    />
                </div>

                {/* Error/Success */}
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
                        <FiAlertTriangle />
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.75rem",
                            marginBottom: "1rem",
                            borderRadius: "0.5rem",
                            backgroundColor: "rgba(34, 197, 94, 0.1)",
                            color: "#22c55e",
                            fontSize: "0.875rem",
                        }}
                    >
                        <FiCheckCircle />
                        Handover report submitted successfully!
                    </div>
                )}

                {/* Submit */}
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isPending}
                    style={{ width: "100%" }}
                >
                    <FiSend style={{ marginRight: "0.5rem" }} />
                    {isPending ? "Submitting..." : "Submit Handover Report"}
                </button>
            </div>
        </div>
    );
}
