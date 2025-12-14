"use client";

import { useState } from "react";
import { MdDelete, MdPause, MdPlayArrow } from "react-icons/md";
import { updateProgramStatus, deleteProgram } from "../actions/incentives";

interface Program {
    id: string;
    name: string;
    description: string | null;
    type: string;
    status: string;
    targetValue: number;
    targetUnit: string;
    rewardAmount: string;
    startDate: Date;
    endDate: Date;
    badgeIcon: string | null;
}

interface ProgramListProps {
    programs: Program[];
}

export function ProgramList({ programs }: ProgramListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleStatusChange = async (id: string, status: "ACTIVE" | "PAUSED") => {
        setLoadingId(id);
        try {
            await updateProgramStatus(id, status);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this program?")) return;
        setLoadingId(id);
        try {
            await deleteProgram(id);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "#22c55e";
            case "PAUSED": return "#f59e0b";
            case "EXPIRED": return "#6b7280";
            default: return "#3b82f6";
        }
    };

    if (programs.length === 0) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                <p>No incentive programs yet</p>
                <p style={{ fontSize: "0.875rem" }}>Create your first program to get started</p>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {programs.map((program) => (
                <div key={program.id} className="card" style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                                <span style={{ fontSize: "1.25rem" }}>{program.badgeIcon || "🎯"}</span>
                                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{program.name}</h3>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        padding: "0.125rem 0.5rem",
                                        borderRadius: "4px",
                                        backgroundColor: `${getStatusColor(program.status)}20`,
                                        color: getStatusColor(program.status),
                                        fontWeight: 600,
                                    }}
                                >
                                    {program.status}
                                </span>
                            </div>
                            {program.description && (
                                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                                    {program.description}
                                </p>
                            )}
                            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
                                <span>
                                    <strong>Target:</strong> {program.targetValue} {program.targetUnit}
                                </span>
                                <span>
                                    <strong>Reward:</strong> ৳{parseFloat(program.rewardAmount).toLocaleString()}
                                </span>
                                <span>
                                    <strong>Duration:</strong> {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {program.status === "ACTIVE" ? (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(program.id, "PAUSED")}
                                    disabled={loadingId === program.id}
                                    className="btn-icon"
                                    title="Pause"
                                    style={{ color: "#f59e0b" }}
                                >
                                    <MdPause />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange(program.id, "ACTIVE")}
                                    disabled={loadingId === program.id}
                                    className="btn-icon"
                                    title="Activate"
                                    style={{ color: "#22c55e" }}
                                >
                                    <MdPlayArrow />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDelete(program.id)}
                                disabled={loadingId === program.id}
                                className="btn-icon"
                                title="Delete"
                                style={{ color: "#ef4444" }}
                            >
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
                .btn-icon {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: var(--color-bg-secondary);
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    transition: opacity 0.15s ease;
                }
                .btn-icon:hover:not(:disabled) {
                    opacity: 0.8;
                }
                .btn-icon:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default ProgramList;
