"use client";

import { useState } from "react";
import { MdReply, MdDelete, MdCheckCircle, MdClose, MdPriorityHigh } from "react-icons/md";
import { updateTicketStatus, updateTicketPriority, addTicketReply, deleteTicket } from "../actions/support";

interface Ticket {
    id: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    userName: string | null;
    userEmail: string | null;
    hotelName: string | null;
    resolution: string | null;
    replyCount: number;
    createdAt: Date;
    updatedAt: Date;
}

interface TicketTableProps {
    tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [replyModal, setReplyModal] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [resolveModal, setResolveModal] = useState<string | null>(null);
    const [resolution, setResolution] = useState("");

    const handleStatusChange = async (id: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED", res?: string) => {
        setLoadingId(id);
        try {
            await updateTicketStatus(id, status, res);
            setResolveModal(null);
            setResolution("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handlePriorityChange = async (id: string, priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT") => {
        setLoadingId(id);
        try {
            await updateTicketPriority(id, priority);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyMessage.trim()) return;
        setLoadingId(id);
        try {
            await addTicketReply(id, replyMessage);
            setReplyModal(null);
            setReplyMessage("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        setLoadingId(id);
        try {
            await deleteTicket(id);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            OPEN: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
            IN_PROGRESS: { bg: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" },
            RESOLVED: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
            CLOSED: { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" },
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
                {status.replace("_", " ")}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, { bg: string; color: string }> = {
            LOW: { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" },
            MEDIUM: { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
            HIGH: { bg: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
            URGENT: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
        };
        const defaultStyle = { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" };
        const style = colors[priority] ?? defaultStyle;
        return (
            <span style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 600,
                backgroundColor: style.bg,
                color: style.color,
            }}>
                {priority}
            </span>
        );
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            BOOKING_ISSUE: "Booking",
            PAYMENT_ISSUE: "Payment",
            TECHNICAL_ISSUE: "Technical",
            ACCOUNT_ISSUE: "Account",
            PAYOUT_ISSUE: "Payout",
            OTHER: "Other",
        };
        return labels[category] || category;
    };

    if (tickets.length === 0) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                No support tickets found
            </div>
        );
    }

    return (
        <>
            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Ticket</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>User</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Category</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Priority</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Status</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "0.75rem 1rem", maxWidth: "250px" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{ticket.subject}</div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-text-muted)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {ticket.description}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                                        {new Date(ticket.createdAt).toLocaleDateString()} • {ticket.replyCount} replies
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ fontSize: "0.875rem" }}>{ticket.userName || "Unknown"}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                        {ticket.hotelName || ticket.userEmail || "N/A"}
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    <span style={{ fontSize: "0.75rem" }}>{getCategoryLabel(ticket.category)}</span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    <select
                                        value={ticket.priority}
                                        onChange={(e) => handlePriorityChange(ticket.id, e.target.value as any)}
                                        disabled={loadingId === ticket.id}
                                        style={{
                                            padding: "0.25rem",
                                            borderRadius: "4px",
                                            border: "1px solid var(--color-border)",
                                            fontSize: "0.75rem",
                                            background: "var(--color-bg-secondary)",
                                        }}
                                    >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                        <option value="URGENT">URGENT</option>
                                    </select>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    {getStatusBadge(ticket.status)}
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                                        <button
                                            type="button"
                                            onClick={() => setReplyModal(ticket.id)}
                                            disabled={loadingId === ticket.id}
                                            title="Reply"
                                            style={{
                                                padding: "0.375rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                color: "#3b82f6",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <MdReply />
                                        </button>
                                        {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                                            <button
                                                type="button"
                                                onClick={() => setResolveModal(ticket.id)}
                                                disabled={loadingId === ticket.id}
                                                title="Resolve"
                                                style={{
                                                    padding: "0.375rem",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                                                    color: "#22c55e",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <MdCheckCircle />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(ticket.id)}
                                            disabled={loadingId === ticket.id}
                                            title="Delete"
                                            style={{
                                                padding: "0.375rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Reply Modal */}
            {replyModal && (
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
                        maxWidth: "450px",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>Reply to Ticket</h3>
                        <textarea
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Write your reply..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                resize: "vertical",
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => { setReplyModal(null); setReplyMessage(""); }}
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
                                onClick={() => handleReply(replyModal)}
                                disabled={loadingId === replyModal || !replyMessage.trim()}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "var(--color-primary)",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolve Modal */}
            {resolveModal && (
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
                        maxWidth: "450px",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>Resolve Ticket</h3>
                        <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Optional: Add resolution notes..."
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                resize: "vertical",
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => { setResolveModal(null); setResolution(""); }}
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
                                onClick={() => handleStatusChange(resolveModal, "RESOLVED", resolution)}
                                disabled={loadingId === resolveModal}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "#22c55e",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Mark Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TicketTable;
