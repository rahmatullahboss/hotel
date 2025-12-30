"use client";

import { AnimatedStatCard } from "./AnimatedStatCard";

interface RevenueMetricsProps {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    monthlyTarget: number;
    projectedMonthly: number;
    revpar: number;
    adr: number;
    occupancyRate: number;
}

export function RevenueMetrics({
    todayRevenue,
    weekRevenue,
    monthRevenue,
    monthlyTarget,
    projectedMonthly,
    revpar,
    adr,
    occupancyRate,
}: RevenueMetricsProps) {
    const targetProgress = monthlyTarget > 0 ? (monthRevenue / monthlyTarget) * 100 : 0;
    const isOnTarget = projectedMonthly >= monthlyTarget;

    return (
        <div className="animate-fade-in">
            {/* Revenue Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                }}
            >
                <AnimatedStatCard
                    value={todayRevenue}
                    label="Today's Revenue"
                    icon="💰"
                    prefix="৳"
                    iconBgClass="gradient-success"
                    delay={0}
                />
                <AnimatedStatCard
                    value={weekRevenue}
                    label="This Week"
                    icon="📈"
                    prefix="৳"
                    iconBgClass="gradient-primary"
                    delay={0.1}
                />
                <AnimatedStatCard
                    value={revpar}
                    label="RevPAR"
                    icon="🏨"
                    prefix="৳"
                    iconBgClass="gradient-accent"
                    delay={0.2}
                />
                <AnimatedStatCard
                    value={adr}
                    label="ADR"
                    icon="🎯"
                    prefix="৳"
                    iconBgClass="gradient-warning"
                    delay={0.3}
                />
            </div>

            {/* Monthly Target Progress */}
            <div className="glass-card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                        <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            Monthly Revenue Target
                        </h3>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                            {new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: isOnTarget ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: isOnTarget ? "#10B981" : "#F59E0B",
                        }}
                    >
                        {isOnTarget ? "On Track" : "Below Target"}
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: "1rem" }}>
                    <div
                        style={{
                            height: "12px",
                            background: "var(--color-bg-secondary)",
                            borderRadius: "6px",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                width: `${Math.min(targetProgress, 100)}%`,
                                background: targetProgress >= 100
                                    ? "linear-gradient(90deg, #10B981, #34D399)"
                                    : targetProgress >= 75
                                    ? "linear-gradient(90deg, #3B82F6, #60A5FA)"
                                    : targetProgress >= 50
                                    ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                                    : "linear-gradient(90deg, #EF4444, #F87171)",
                                borderRadius: "6px",
                                transition: "width 1s ease-out",
                            }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Current</div>
                        <div style={{ fontWeight: 700 }}>৳{monthRevenue.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Projected</div>
                        <div style={{ fontWeight: 700, color: isOnTarget ? "#10B981" : "#F59E0B" }}>
                            ৳{projectedMonthly.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>Target</div>
                        <div style={{ fontWeight: 700 }}>৳{monthlyTarget.toLocaleString()}</div>
                    </div>
                </div>

                {/* Occupancy indicator */}
                <div
                    style={{
                        marginTop: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                        Current Occupancy
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                            style={{
                                width: "80px",
                                height: "6px",
                                background: "var(--color-bg-secondary)",
                                borderRadius: "3px",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${occupancyRate}%`,
                                    background: occupancyRate >= 80
                                        ? "#10B981"
                                        : occupancyRate >= 50
                                        ? "#F59E0B"
                                        : "#EF4444",
                                    borderRadius: "3px",
                                }}
                            />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{occupancyRate}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
