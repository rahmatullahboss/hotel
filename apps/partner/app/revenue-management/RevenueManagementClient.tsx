"use client";

import { useState } from "react";
import {
    FiTrendingUp,
    FiTrendingDown,
    FiZap,
    FiToggleLeft,
    FiToggleRight,
    FiTrash2,
    FiPlus,
    FiCheck,
} from "react-icons/fi";
import {
    toggleYieldRule,
    deleteYieldRule,
    applyForecastPrice,
} from "../actions/revenue-management";
import type { DemandForecast, YieldRule, OccupancyTrend } from "../actions/revenue-management";

interface RevenueManagementClientProps {
    forecast: DemandForecast[];
    yieldRules: YieldRule[];
    trends: OccupancyTrend[];
    hotelId: string;
}

const DEMAND_COLORS = {
    LOW: "#94a3b8",
    MEDIUM: "#fbbf24",
    HIGH: "#f97316",
    VERY_HIGH: "#ef4444",
};

const RULE_TYPE_LABELS = {
    OCCUPANCY_THRESHOLD: "Occupancy Based",
    ADVANCE_BOOKING: "Advance Booking",
    DAY_OF_WEEK: "Day of Week",
    SEASONAL: "Seasonal",
};

export default function RevenueManagementClient({
    forecast,
    yieldRules: initialRules,
    hotelId,
}: RevenueManagementClientProps) {
    const [rules, setRules] = useState(initialRules);
    const [activeTab, setActiveTab] = useState<"forecast" | "rules">("forecast");
    const [loading, setLoading] = useState<string | null>(null);
    const [appliedDates, setAppliedDates] = useState<Set<string>>(new Set());

    const handleToggleRule = async (ruleId: string) => {
        setLoading(`toggle-${ruleId}`);
        await toggleYieldRule(ruleId);
        setRules((prev) =>
            prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
        );
        setLoading(null);
    };

    const handleDeleteRule = async (ruleId: string) => {
        if (!confirm("Delete this yield rule?")) return;
        
        setLoading(`delete-${ruleId}`);
        await deleteYieldRule(ruleId);
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        setLoading(null);
    };

    const handleApplyPrice = async (date: string, multiplier: number) => {
        setLoading(`apply-${date}`);
        const result = await applyForecastPrice(hotelId, date, multiplier);
        if (result.success) {
            setAppliedDates((prev) => new Set([...prev, date]));
        }
        setLoading(null);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("bn-BD", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    };

    return (
        <>
            {/* Tab Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "0.5rem",
                }}
            >
                {[
                    { key: "forecast", label: "Demand Forecast" },
                    { key: "rules", label: "Yield Rules" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as "forecast" | "rules")}
                        style={{
                            flex: 1,
                            padding: "0.75rem",
                            borderRadius: "0.5rem 0.5rem 0 0",
                            border: "none",
                            background: activeTab === tab.key ? "var(--color-primary)" : "transparent",
                            color: activeTab === tab.key ? "white" : "var(--color-text-secondary)",
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Forecast Tab */}
            {activeTab === "forecast" && (
                <section>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
                            Next 14 Days Forecast
                        </h2>
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.65rem" }}>
                            {Object.entries(DEMAND_COLORS).map(([level, color]) => (
                                <span key={level} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                                    {level}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {forecast.map((day) => {
                            const isApplied = appliedDates.has(day.date);
                            const showApply = day.suggestedPriceMultiplier !== 1.0;
                            
                            return (
                                <div
                                    key={day.date}
                                    className="glass-card"
                                    style={{
                                        padding: "0.75rem 1rem",
                                        borderLeft: `4px solid ${DEMAND_COLORS[day.predictedDemand]}`,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                                {formatDate(day.date)}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                    {day.predictedOccupancy >= 70 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                                                    {day.predictedOccupancy}% occupancy
                                                </span>
                                                {day.events.length > 0 && (
                                                    <span style={{ background: "var(--color-accent)", color: "white", padding: "0.125rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.625rem" }}>
                                                        {day.events[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            {showApply && (
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "0.75rem", color: day.suggestedPriceMultiplier > 1 ? "var(--color-success)" : "var(--color-warning)" }}>
                                                        {day.suggestedPriceMultiplier > 1 ? "+" : ""}
                                                        {Math.round((day.suggestedPriceMultiplier - 1) * 100)}%
                                                    </div>
                                                    <div style={{ fontSize: "0.625rem", color: "var(--color-text-muted)" }}>
                                                        {day.confidence}% confidence
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {showApply && !isApplied && (
                                                <button
                                                    className="btn btn-sm btn-accent"
                                                    onClick={() => handleApplyPrice(day.date, day.suggestedPriceMultiplier)}
                                                    disabled={loading === `apply-${day.date}`}
                                                    style={{ fontSize: "0.7rem", padding: "0.375rem 0.5rem" }}
                                                >
                                                    {loading === `apply-${day.date}` ? "..." : "Apply"}
                                                </button>
                                            )}
                                            
                                            {isApplied && (
                                                <span style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" }}>
                                                    <FiCheck size={14} /> Applied
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Yield Rules Tab */}
            {activeTab === "rules" && (
                <section>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
                            Yield Management Rules
                        </h2>
                        <button
                            className="btn btn-accent"
                            style={{ fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
                        >
                            <FiPlus size={14} /> New Rule
                        </button>
                    </div>

                    {rules.length === 0 ? (
                        <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                                No yield rules configured yet
                            </p>
                            <button className="btn btn-primary">
                                Create Your First Rule
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {rules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="glass-card"
                                    style={{
                                        padding: "1rem",
                                        opacity: rule.isActive ? 1 : 0.6,
                                        borderLeft: rule.isActive
                                            ? "4px solid var(--color-success)"
                                            : "4px solid var(--color-text-muted)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <FiZap style={{ color: "var(--color-warning)" }} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{rule.name}</div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                                    {RULE_TYPE_LABELS[rule.type]}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleRule(rule.id)}
                                            disabled={loading === `toggle-${rule.id}`}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                                color: rule.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                                            }}
                                        >
                                            {rule.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ fontSize: "0.875rem" }}>
                                            <span style={{ color: rule.action.priceAdjustment > 0 ? "var(--color-success)" : "var(--color-warning)" }}>
                                                {rule.action.priceAdjustment > 0 ? "+" : ""}
                                                {rule.action.priceAdjustment}%
                                            </span>
                                            <span style={{ color: "var(--color-text-secondary)" }}> price adjustment</span>
                                            {rule.action.minStay && (
                                                <span style={{ color: "var(--color-text-secondary)" }}>
                                                    {" "}• Min stay: {rule.action.minStay} nights
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            disabled={loading === `delete-${rule.id}`}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "var(--color-error)",
                                                padding: "0.25rem",
                                            }}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
