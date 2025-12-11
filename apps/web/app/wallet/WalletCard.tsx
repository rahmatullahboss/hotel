"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMoneyToWallet } from "../actions/wallet";

interface WalletCardProps {
    balance: number;
}

export function WalletCard({ balance }: WalletCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showTopUp, setShowTopUp] = useState(false);
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const quickAmounts = [100, 500, 1000, 2000];

    const handleTopUp = () => {
        const numAmount = Number(amount);
        if (!numAmount || numAmount < 50) {
            setMessage({ type: "error", text: "Minimum amount is ৳50" });
            return;
        }

        startTransition(async () => {
            const result = await addMoneyToWallet(numAmount);
            if (result.success) {
                setMessage({ type: "success", text: `৳${numAmount} added successfully!` });
                setAmount("");
                setShowTopUp(false);
                router.refresh();
            } else {
                setMessage({ type: "error", text: result.error || "Failed to add money" });
            }
        });
    };

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #1d3557 0%, #2a4a69 100%)",
                borderRadius: "1rem",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                color: "white",
            }}
        >
            <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>Available Balance</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                ৳{balance.toLocaleString()}
            </div>

            {!showTopUp ? (
                <button
                    onClick={() => setShowTopUp(true)}
                    style={{
                        width: "100%",
                        padding: "0.875rem",
                        background: "white",
                        color: "#1d3557",
                        border: "none",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        fontSize: "1rem",
                        cursor: "pointer",
                    }}
                >
                    + Add Money
                </button>
            ) : (
                <div>
                    {/* Quick amounts */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                        {quickAmounts.map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setAmount(amt.toString())}
                                style={{
                                    padding: "0.5rem",
                                    background: amount === amt.toString() ? "white" : "rgba(255,255,255,0.2)",
                                    color: amount === amt.toString() ? "#1d3557" : "white",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                ৳{amt}
                            </button>
                        ))}
                    </div>

                    {/* Custom amount */}
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        style={{
                            width: "100%",
                            padding: "0.875rem",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontSize: "1rem",
                            marginBottom: "0.75rem",
                        }}
                    />

                    {message && (
                        <div
                            style={{
                                padding: "0.5rem",
                                borderRadius: "0.5rem",
                                marginBottom: "0.75rem",
                                textAlign: "center",
                                background: message.type === "error" ? "rgba(208,0,0,0.2)" : "rgba(44,182,125,0.2)",
                            }}
                        >
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <button
                            onClick={() => setShowTopUp(false)}
                            style={{
                                padding: "0.875rem",
                                background: "rgba(255,255,255,0.2)",
                                color: "white",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleTopUp}
                            disabled={isPending}
                            style={{
                                padding: "0.875rem",
                                background: "white",
                                color: "#1d3557",
                                border: "none",
                                borderRadius: "0.75rem",
                                fontWeight: 600,
                                cursor: isPending ? "wait" : "pointer",
                            }}
                        >
                            {isPending ? "Adding..." : "Add Money"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
