"use client";

import { useState, useTransition } from "react";
import type { PayoutWithDetails } from "../../actions/payout";
import { approvePayout, rejectPayout, markPayoutAsPaid } from "../../actions/payout";

interface PayoutsClientProps {
    payouts: PayoutWithDetails[];
}

const statusColors: Record<string, string> = {
    PENDING: "#f59e0b",
    APPROVED: "#3b82f6",
    PROCESSING: "#8b5cf6",
    PAID: "#22c55e",
    REJECTED: "#ef4444",
};

export function PayoutsClient({ payouts }: PayoutsClientProps) {
    const [isPending, startTransition] = useTransition();
    const [selectedPayout, setSelectedPayout] = useState<PayoutWithDetails | null>(null);
    const [actionType, setActionType] = useState<"approve" | "reject" | "paid" | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [transactionRef, setTransactionRef] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleAction = async () => {
        if (!selectedPayout) return;

        startTransition(async () => {
            let result;
            switch (actionType) {
                case "approve":
                    result = await approvePayout(selectedPayout.id);
                    break;
                case "reject":
                    if (!rejectReason) {
                        setMessage({ type: "error", text: "Please provide a rejection reason" });
                        return;
                    }
                    result = await rejectPayout(selectedPayout.id, rejectReason);
                    break;
                case "paid":
                    if (!transactionRef) {
                        setMessage({ type: "error", text: "Please provide transaction reference" });
                        return;
                    }
                    result = await markPayoutAsPaid(selectedPayout.id, transactionRef);
                    break;
            }

            if (result?.success) {
                setMessage({ type: "success", text: `Payout ${actionType === "paid" ? "marked as paid" : actionType + "d"} successfully!` });
                setSelectedPayout(null);
                setActionType(null);
                setRejectReason("");
                setTransactionRef("");
            } else {
                setMessage({ type: "error", text: result?.error || "Action failed" });
            }
        });
    };

    const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
    const approvedCount = payouts.filter((p) => p.status === "APPROVED").length;
    const totalPending = payouts
        .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <>
            {/* Summary Cards */}
            <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                <div className="stat-card">
                    <div className="stat-value">{pendingCount}</div>
                    <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{approvedCount}</div>
                    <div className="stat-label">Approved (Awaiting Payment)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">৳{totalPending.toLocaleString()}</div>
                    <div className="stat-label">Total Outstanding</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{payouts.length}</div>
                    <div className="stat-label">Total Requests</div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    style={{
                        padding: "1rem",
                        marginBottom: "1rem",
                        borderRadius: "0.5rem",
                        backgroundColor: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                        color: message.type === "error" ? "#ef4444" : "#22c55e",
                    }}
                >
                    {message.text}
                </div>
            )}

            {/* Payouts Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Hotel</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Account</th>
                            <th>Status</th>
                            <th>Requested</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((payout) => (
                            <tr key={payout.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{payout.hotelName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                        by {payout.requesterName || "Unknown"}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>৳{payout.amount.toLocaleString()}</td>
                                <td>{payout.paymentMethod}</td>
                                <td>
                                    <div>{payout.accountNumber}</div>
                                    {payout.accountName && (
                                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                            {payout.accountName}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <span
                                        style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "9999px",
                                            fontSize: "0.75rem",
                                            fontWeight: 500,
                                            backgroundColor: `${statusColors[payout.status]}20`,
                                            color: statusColors[payout.status],
                                        }}
                                    >
                                        {payout.status}
                                    </span>
                                </td>
                                <td style={{ fontSize: "0.875rem" }}>
                                    {new Date(payout.createdAt).toLocaleDateString()}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {payout.status === "PENDING" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setActionType("approve");
                                                    }}
                                                    disabled={isPending}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => {
                                                        setSelectedPayout(payout);
                                                        setActionType("reject");
                                                    }}
                                                    disabled={isPending}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                        {payout.status === "APPROVED" && (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => {
                                                    setSelectedPayout(payout);
                                                    setActionType("paid");
                                                }}
                                                disabled={isPending}
                                            >
                                                💰 Mark Paid
                                            </button>
                                        )}
                                        {payout.status === "PAID" && payout.transactionReference && (
                                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                                Ref: {payout.transactionReference}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Action Modal */}
            {selectedPayout && actionType && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                    }}
                    onClick={() => {
                        setSelectedPayout(null);
                        setActionType(null);
                    }}
                >
                    <div
                        className="card"
                        style={{ width: "400px", padding: "1.5rem" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            {actionType === "approve" && "Approve Payout"}
                            {actionType === "reject" && "Reject Payout"}
                            {actionType === "paid" && "Mark as Paid"}
                        </h3>

                        <div style={{ marginBottom: "1rem" }}>
                            <p>
                                <strong>Hotel:</strong> {selectedPayout.hotelName}
                            </p>
                            <p>
                                <strong>Amount:</strong> ৳{selectedPayout.amount.toLocaleString()}
                            </p>
                            <p>
                                <strong>To:</strong> {selectedPayout.paymentMethod} - {selectedPayout.accountNumber}
                            </p>
                        </div>

                        {actionType === "reject" && (
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Rejection Reason
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "0.5rem",
                                    }}
                                />
                            </div>
                        )}

                        {actionType === "paid" && (
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Transaction Reference
                                </label>
                                <input
                                    type="text"
                                    value={transactionRef}
                                    onChange={(e) => setTransactionRef(e.target.value)}
                                    placeholder="e.g., bKash TRX ID"
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "0.5rem",
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSelectedPayout(null);
                                    setActionType(null);
                                }}
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${actionType === "reject" ? "btn-danger" : "btn-primary"}`}
                                onClick={handleAction}
                                disabled={isPending}
                                style={{ flex: 1 }}
                            >
                                {isPending ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
