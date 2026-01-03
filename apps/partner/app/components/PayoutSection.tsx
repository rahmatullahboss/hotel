"use client";

import { useState, useTransition } from "react";
import { requestPayout, cancelPayoutRequest } from "../actions/payout";

interface PayoutSectionProps {
    availableBalance: number;
    pendingPayouts: number;
    payouts: Array<{
        id: string;
        amount: number;
        status: string;
        paymentMethod: string;
        accountNumber: string;
        transactionReference: string | null;
        createdAt: Date;
    }>;
}

const statusLabels: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "badge-warning" },
    APPROVED: { label: "Approved", className: "badge-info" },
    PROCESSING: { label: "Processing", className: "badge-info" },
    PAID: { label: "Paid", className: "badge-success" },
    REJECTED: { label: "Rejected", className: "badge-error" },
};

export function PayoutSection({ availableBalance, pendingPayouts, payouts }: PayoutSectionProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form fields
    const [amount, setAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "BANK" | "NAGAD">("BKASH");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount < 500) {
            setMessage({ type: "error", text: "Minimum payout is ৳500" });
            return;
        }
        if (numAmount > availableBalance) {
            setMessage({ type: "error", text: "Amount exceeds available balance" });
            return;
        }
        if (!accountNumber) {
            setMessage({ type: "error", text: "Account number is required" });
            return;
        }

        startTransition(async () => {
            const result = await requestPayout({
                amount: numAmount,
                paymentMethod,
                accountNumber,
                accountName: accountName || undefined,
            });

            if (result.success) {
                setMessage({ type: "success", text: "Payout request submitted!" });
                setIsFormOpen(false);
                setAmount("");
                setAccountNumber("");
                setAccountName("");
            } else {
                setMessage({ type: "error", text: result.error || "Failed to request payout" });
            }
        });
    };

    const handleCancel = async (payoutId: string) => {
        if (!confirm("Are you sure you want to cancel this payout request?")) return;

        startTransition(async () => {
            const result = await cancelPayoutRequest(payoutId);
            if (result.success) {
                setMessage({ type: "success", text: "Payout request cancelled" });
            } else {
                setMessage({ type: "error", text: result.error || "Failed to cancel" });
            }
        });
    };

    return (
        <section style={{ marginBottom: "1.5rem" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                    }}
                >
                    Payouts
                </h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsFormOpen(true)}
                    disabled={availableBalance < 500}
                    style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                >
                    💸 Request Payout
                </button>
            </div>

            {/* Balance Info */}
            <div
                style={{
                    marginBottom: "16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "16px",
                    padding: "16px",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9"
                }}
            >
                <div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Available to Withdraw
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>
                        ৳{availableBalance.toLocaleString()}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Pending Payouts
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f59e0b" }}>
                        ৳{pendingPayouts.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`card ${message.type === "error" ? "badge-error" : "badge-success"}`}
                    style={{
                        marginBottom: "1rem",
                        padding: "0.75rem 1rem",
                        backgroundColor: message.type === "error" ? "rgba(230, 57, 70, 0.1)" : "rgba(42, 157, 143, 0.1)",
                        color: message.type === "error" ? "var(--color-error)" : "var(--color-success)",
                    }}
                >
                    {message.text}
                </div>
            )}

            {/* Payout History */}
            {payouts.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {payouts.slice(0, 5).map((payout) => (
                        <div
                            key={payout.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "16px",
                                background: "white",
                                borderRadius: "16px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                border: "1px solid #f1f5f9"
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    ৳{payout.amount.toLocaleString()} via {payout.paymentMethod}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    {payout.accountNumber} • {new Date(payout.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className={`badge ${statusLabels[payout.status]?.className || "badge-secondary"}`}>
                                    {statusLabels[payout.status]?.label || payout.status}
                                </span>
                                {payout.status === "PENDING" && (
                                    <button
                                        onClick={() => handleCancel(payout.id)}
                                        disabled={isPending}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "var(--color-error)",
                                            cursor: "pointer",
                                            fontSize: "0.875rem",
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className="card"
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    No payout requests yet
                </div>
            )}

            {/* Payout Request Modal */}
            {isFormOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 200,
                        padding: "1rem",
                    }}
                    onClick={() => setIsFormOpen(false)}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            padding: "24px",
                            background: "white",
                            borderRadius: "16px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                            Request Payout
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Amount (৳)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Minimum ৳500"
                                    min="500"
                                    max={availableBalance}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
                                />
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                                    Available: ৳{availableBalance.toLocaleString()}
                                </div>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    Payment Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as "BKASH" | "BANK" | "NAGAD")}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                        background: "white",
                                    }}
                                >
                                    <option value="BKASH">bKash</option>
                                    <option value="NAGAD">Nagad</option>
                                    <option value="BANK">Bank Transfer</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                    {paymentMethod === "BANK" ? "Account Number" : "Mobile Number"}
                                </label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder={paymentMethod === "BANK" ? "Enter account number" : "e.g., 01XXXXXXXXX"}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        fontSize: "1rem",
                                    }}
                                />
                            </div>

                            {paymentMethod === "BANK" && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem" }}>
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder="Enter account holder name"
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "0.5rem",
                                            fontSize: "1rem",
                                        }}
                                    />
                                </div>
                            )}

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setIsFormOpen(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isPending}
                                    style={{ flex: 1 }}
                                >
                                    {isPending ? "Submitting..." : "Request Payout"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
