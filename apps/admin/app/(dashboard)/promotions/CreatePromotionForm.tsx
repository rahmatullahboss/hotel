"use client";

import { useState, useTransition } from "react";
import { createPromotion } from "@/actions/promotions";

export function CreatePromotionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createPromotion({
                code: formData.get("code") as string,
                name: formData.get("name") as string,
                description: formData.get("description") as string || undefined,
                type: formData.get("type") as "PERCENTAGE" | "FIXED",
                value: Number(formData.get("value")),
                minBookingAmount: formData.get("minBookingAmount")
                    ? Number(formData.get("minBookingAmount"))
                    : undefined,
                maxDiscountAmount: formData.get("maxDiscountAmount")
                    ? Number(formData.get("maxDiscountAmount"))
                    : undefined,
                maxUses: formData.get("maxUses")
                    ? Number(formData.get("maxUses"))
                    : undefined,
                validFrom: formData.get("validFrom") as string || undefined,
                validTo: formData.get("validTo") as string || undefined,
            });

            if (result.success) {
                setMessage({ type: "success", text: "Promotion created successfully!" });
                setIsOpen(false);
                (e.target as HTMLFormElement).reset();
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: "error", text: result.error || "Failed to create promotion" });
            }
        });
    };

    if (!isOpen) {
        return (
            <div>
                {message && (
                    <div
                        style={{
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            backgroundColor: message.type === "success"
                                ? "rgba(44, 182, 125, 0.1)"
                                : "rgba(208, 0, 0, 0.1)",
                            color: message.type === "success"
                                ? "var(--color-success)"
                                : "var(--color-error)",
                        }}
                    >
                        {message.text}
                    </div>
                )}
                <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
                    + Create Promotion
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
                    Create New Promotion
                </h2>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        color: "var(--color-text-secondary)",
                    }}
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Promo Code *
                        </label>
                        <input
                            name="code"
                            type="text"
                            required
                            placeholder="e.g., SAVE20"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                                textTransform: "uppercase",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Promotion Name *
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="e.g., Weekend Sale"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                        Description
                    </label>
                    <textarea
                        name="description"
                        placeholder="Optional description..."
                        rows={2}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "2px solid var(--color-border)",
                            borderRadius: "0.5rem",
                            fontSize: "1rem",
                            resize: "vertical",
                        }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Discount Type *
                        </label>
                        <select
                            name="type"
                            required
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (৳)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Discount Value *
                        </label>
                        <input
                            name="value"
                            type="number"
                            required
                            min="1"
                            placeholder="e.g., 20"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Max Uses
                        </label>
                        <input
                            name="maxUses"
                            type="number"
                            min="1"
                            placeholder="Unlimited"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Min Booking Amount
                        </label>
                        <input
                            name="minBookingAmount"
                            type="number"
                            min="0"
                            placeholder="No minimum"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Max Discount Amount
                        </label>
                        <input
                            name="maxDiscountAmount"
                            type="number"
                            min="0"
                            placeholder="No cap"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Valid From
                        </label>
                        <input
                            name="validFrom"
                            type="date"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", fontWeight: 500, marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                            Valid To
                        </label>
                        <input
                            name="validTo"
                            type="date"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "2px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                fontSize: "1rem",
                            }}
                        />
                    </div>
                </div>

                {message && (
                    <div
                        style={{
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            backgroundColor: message.type === "success"
                                ? "rgba(44, 182, 125, 0.1)"
                                : "rgba(208, 0, 0, 0.1)",
                            color: message.type === "success"
                                ? "var(--color-success)"
                                : "var(--color-error)",
                        }}
                    >
                        {message.text}
                    </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isPending}
                        style={{ flex: 1 }}
                    >
                        {isPending ? "Creating..." : "Create Promotion"}
                    </button>
                </div>
            </form>
        </div>
    );
}
