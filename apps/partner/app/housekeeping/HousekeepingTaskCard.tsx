"use client";

import { useState } from "react";
import { MdPlayArrow, MdCheckCircle, MdVerified, MdPriorityHigh } from "react-icons/md";
import { startTask, completeTask, verifyTask } from "../actions/housekeeping";

type TaskType = "CHECKOUT_CLEAN" | "STAY_OVER" | "INSPECTION" | "MAINTENANCE" | "TURNDOWN" | "DEEP_CLEAN";
type TaskStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "VERIFIED" | "CANCELLED";
type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

interface Task {
    id: string;
    roomId: string;
    roomNumber: string;
    type: TaskType;
    status: TaskStatus;
    priority: Priority;
    assignedTo: string | null;
    assignedToName?: string | null;
    scheduledFor: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    notes: string | null;
    createdAt: Date;
}

interface HousekeepingTaskCardProps {
    task: Task;
}

export function HousekeepingTaskCard({ task }: HousekeepingTaskCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const getTypeLabel = (type: TaskType) => {
        switch (type) {
            case "CHECKOUT_CLEAN": return "Checkout Clean";
            case "STAY_OVER": return "Stay-over Clean";
            case "INSPECTION": return "Inspection";
            case "MAINTENANCE": return "Maintenance";
            case "TURNDOWN": return "Turndown";
            case "DEEP_CLEAN": return "Deep Clean";
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "PENDING":
            case "ASSIGNED":
                return "var(--color-warning)";
            case "IN_PROGRESS":
                return "var(--color-primary)";
            case "COMPLETED":
                return "var(--color-success)";
            case "VERIFIED":
                return "#3b82f6";
            case "CANCELLED":
                return "var(--color-text-muted)";
        }
    };

    const getPriorityIcon = (priority: Priority) => {
        if (priority === "HIGH" || priority === "URGENT") {
            return <MdPriorityHigh style={{ color: "var(--color-error)" }} />;
        }
        return null;
    };

    const handleStart = async () => {
        setIsLoading(true);
        try {
            await startTask(task.id);
        } catch (error) {
            console.error("Error starting task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await completeTask(task.id);
        } catch (error) {
            console.error("Error completing task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            await verifyTask(task.id, true);
        } catch (error) {
            console.error("Error verifying task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderAction = () => {
        if (isLoading) {
            return <span className="action-loading">...</span>;
        }

        switch (task.status) {
            case "PENDING":
            case "ASSIGNED":
                return (
                    <button type="button" className="action-btn start" onClick={handleStart}>
                        <MdPlayArrow /> Start
                    </button>
                );
            case "IN_PROGRESS":
                return (
                    <button type="button" className="action-btn complete" onClick={handleComplete}>
                        <MdCheckCircle /> Done
                    </button>
                );
            case "COMPLETED":
                return (
                    <button type="button" className="action-btn verify" onClick={handleVerify}>
                        <MdVerified /> Verify
                    </button>
                );
            case "VERIFIED":
                return (
                    <span className="status-badge verified">
                        <MdVerified /> Verified
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="task-card"
            style={{ borderLeftColor: getStatusColor(task.status) }}
        >
            <div className="task-header">
                <div className="task-room">
                    Room {task.roomNumber}
                    {getPriorityIcon(task.priority)}
                </div>
                <span
                    className="task-status"
                    style={{ background: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
                >
                    {task.status.replace("_", " ")}
                </span>
            </div>
            <div className="task-type">{getTypeLabel(task.type)}</div>
            {task.assignedToName && (
                <div className="task-assigned">Assigned to: {task.assignedToName}</div>
            )}
            {task.notes && (
                <div className="task-notes">{task.notes}</div>
            )}
            <div className="task-actions">
                {renderAction()}
            </div>

            <style jsx>{`
                .task-card {
                    background: var(--color-bg-primary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    border-left: 4px solid;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .task-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                .task-room {
                    font-weight: 600;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                .task-status {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }
                .task-type {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.5rem;
                }
                .task-assigned {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-bottom: 0.5rem;
                }
                .task-notes {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    padding: 0.5rem;
                    background: var(--color-bg-secondary);
                    border-radius: 0.375rem;
                    margin-bottom: 0.75rem;
                }
                .task-actions {
                    display: flex;
                    justify-content: flex-end;
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }
                .action-btn:hover {
                    opacity: 0.9;
                }
                .action-btn.start {
                    background: var(--color-primary);
                    color: white;
                }
                .action-btn.complete {
                    background: var(--color-success);
                    color: white;
                }
                .action-btn.verify {
                    background: #3b82f6;
                    color: white;
                }
                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .status-badge.verified {
                    color: #3b82f6;
                }
                .action-loading {
                    color: var(--color-text-muted);
                }
            `}</style>
        </div>
    );
}

export default HousekeepingTaskCard;
