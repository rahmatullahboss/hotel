"use client";

import { useState } from "react";
import { MdTrendingUp, MdTrendingDown, MdAutoAwesome, MdCheck, MdClose } from "react-icons/md";

interface PricingSuggestion {
    id: string;
    type: "increase" | "decrease";
    roomName: string;
    date: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    potentialRevenue?: number;
    confidence: number;
}

interface PricingSuggestionsProps {
    suggestions: PricingSuggestion[];
    onAccept?: (suggestion: PricingSuggestion) => void;
    onReject?: (suggestion: PricingSuggestion) => void;
}

export function PricingSuggestions({
    suggestions,
    onAccept,
    onReject,
}: PricingSuggestionsProps) {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    const activeSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

    const handleReject = (suggestion: PricingSuggestion) => {
        setDismissedIds((prev) => new Set([...prev, suggestion.id]));
        onReject?.(suggestion);
    };

    if (activeSuggestions.length === 0) {
        return (
            <div className="glass-card animate-slide-up" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✨</div>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Pricing Optimized</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    No pricing suggestions at this time. Check back later!
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card animate-slide-up" style={{ overflow: "hidden" }}>
            {/* Header */}
            <div
                style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <MdAutoAwesome size={20} color="var(--color-primary)" />
                    AI Pricing Suggestions
                </h2>
                <div
                    style={{
                        background: "var(--color-primary)",
                        color: "white",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                    }}
                >
                    {activeSuggestions.length} new
                </div>
            </div>

            {/* Suggestions List */}
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {activeSuggestions.map((suggestion) => {
                    const priceDiff = suggestion.suggestedPrice - suggestion.currentPrice;
                    const percentDiff = ((priceDiff / suggestion.currentPrice) * 100).toFixed(0);
                    const isIncrease = priceDiff > 0;

                    return (
                        <div
                            key={suggestion.id}
                            style={{
                                padding: "1rem 1.25rem",
                                borderBottom: "1px solid var(--color-border)",
                                display: "flex",
                                gap: "0.75rem",
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "10px",
                                    background: isIncrease
                                        ? "rgba(16, 185, 129, 0.1)"
                                        : "rgba(249, 115, 22, 0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                {isIncrease ? (
                                    <MdTrendingUp size={20} color="#10B981" />
                                ) : (
                                    <MdTrendingDown size={20} color="#F97316" />
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                                        {suggestion.roomName}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            color: isIncrease ? "#10B981" : "#F97316",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {isIncrease ? "+" : ""}{percentDiff}%
                                    </div>
                                </div>

                                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                                    {suggestion.reason}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                                    <span style={{ color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                                        ৳{suggestion.currentPrice.toLocaleString()}
                                    </span>
                                    <span style={{ color: "var(--color-text-primary)" }}>→</span>
                                    <span style={{ fontWeight: 700, color: isIncrease ? "#10B981" : "#F97316" }}>
                                        ৳{suggestion.suggestedPrice.toLocaleString()}
                                    </span>
                                    <span style={{ color: "var(--color-text-muted)" }}>
                                        • {suggestion.date}
                                    </span>
                                </div>

                                {suggestion.potentialRevenue && (
                                    <div
                                        style={{
                                            marginTop: "0.5rem",
                                            fontSize: "0.75rem",
                                            color: "var(--color-success)",
                                        }}
                                    >
                                        💰 Potential extra revenue: ৳{suggestion.potentialRevenue.toLocaleString()}
                                    </div>
                                )}

                                {/* Confidence bar */}
                                <div style={{ marginTop: "0.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", marginBottom: "2px" }}>
                                        <span style={{ color: "var(--color-text-muted)" }}>Confidence</span>
                                        <span style={{ color: "var(--color-text-secondary)" }}>{suggestion.confidence}%</span>
                                    </div>
                                    <div
                                        style={{
                                            height: "4px",
                                            background: "var(--color-bg-secondary)",
                                            borderRadius: "2px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${suggestion.confidence}%`,
                                                background: suggestion.confidence >= 80
                                                    ? "#10B981"
                                                    : suggestion.confidence >= 60
                                                    ? "#F59E0B"
                                                    : "#EF4444",
                                                borderRadius: "2px",
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <button
                                    onClick={() => onAccept?.(suggestion)}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "rgba(16, 185, 129, 0.1)",
                                        color: "#10B981",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    title="Accept suggestion"
                                >
                                    <MdCheck size={20} />
                                </button>
                                <button
                                    onClick={() => handleReject(suggestion)}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "rgba(239, 68, 68, 0.1)",
                                        color: "#EF4444",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    title="Dismiss suggestion"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
