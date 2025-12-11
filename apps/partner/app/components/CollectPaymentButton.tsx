"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface CollectPaymentButtonProps {
    bookingId: string;
    hotelId: string;
    remainingAmount: number;
}

export function CollectPaymentButton({ bookingId, hotelId, remainingAmount }: CollectPaymentButtonProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleCollect = async () => {
        setError(null);
        startTransition(async () => {
            try {
                const res = await fetch("/api/collect-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookingId, hotelId }),
                });
                const data = await res.json();
                if (data.success) {
                    router.refresh();
                } else {
                    setError(data.error || "Failed to collect payment");
                }
            } catch {
                setError("Failed to collect payment");
            }
        });
    };

    return (
        <div>
            {error && (
                <div style={{ fontSize: "0.75rem", color: "var(--color-error)", marginBottom: "0.5rem" }}>
                    {error}
                </div>
            )}
            <button
                onClick={handleCollect}
                disabled={isPending}
                className="btn btn-success"
                style={{
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    width: "100%",
                    background: "var(--color-success)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    cursor: isPending ? "wait" : "pointer",
                    opacity: isPending ? 0.7 : 1,
                }}
            >
                {isPending ? "Processing..." : `✓ Collect ৳${remainingAmount.toLocaleString()}`}
            </button>
        </div>
    );
}
