import { redirect } from "next/navigation";
import Link from "next/link";
import { MdTrendingUp, MdTrendingDown, MdCompareArrows, MdBusiness, MdAdd } from "react-icons/md";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getCompetitors, getPriceComparison, getPricingStats } from "../actions/competitorPricing";
import { BottomNav } from "../components";
import { CompetitorList } from "./CompetitorList";
import { AddCompetitorForm } from "./AddCompetitorForm";

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const [competitors, comparison, stats] = await Promise.all([
        getCompetitors(),
        getPriceComparison(),
        getPricingStats(),
    ]);

    const getPositionColor = (position: string) => {
        switch (position) {
            case "LOWEST":
                return "#22c55e";
            case "BELOW_AVERAGE":
                return "#10b981";
            case "AVERAGE":
                return "#3b82f6";
            case "ABOVE_AVERAGE":
                return "#f59e0b";
            case "HIGHEST":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    const getPositionLabel = (position: string) => {
        return position.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/pricing-rules"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Pricing Intelligence</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Monitor competitor rates & optimize pricing
                </p>
            </header>

            <main>
                {/* Market Position Card */}
                {comparison && (
                    <div
                        className="card"
                        style={{
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                            background: "linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%)",
                            border: `2px solid ${getPositionColor(comparison.position)}`,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
                                    Your Market Position
                                </div>
                                <div
                                    style={{
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        color: getPositionColor(comparison.position),
                                    }}
                                >
                                    {getPositionLabel(comparison.position)}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Your Avg
                                </div>
                                <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                                    ৳{Math.round(comparison.yourPrice).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Price Comparison Bar */}
                        <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                <span>৳{Math.round(comparison.competitorMin).toLocaleString()}</span>
                                <span>৳{Math.round(comparison.competitorMax).toLocaleString()}</span>
                            </div>
                            <div
                                style={{
                                    height: "8px",
                                    background: "var(--color-bg-tertiary)",
                                    borderRadius: "4px",
                                    position: "relative",
                                }}
                            >
                                {/* Average marker */}
                                {comparison.competitorMax > comparison.competitorMin && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: `${((comparison.competitorAvg - comparison.competitorMin) / (comparison.competitorMax - comparison.competitorMin)) * 100}%`,
                                            top: "-4px",
                                            width: "2px",
                                            height: "16px",
                                            background: "var(--color-text-muted)",
                                        }}
                                    />
                                )}
                                {/* Your price marker */}
                                {comparison.competitorMax > comparison.competitorMin && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: `${Math.min(100, Math.max(0, ((comparison.yourPrice - comparison.competitorMin) / (comparison.competitorMax - comparison.competitorMin)) * 100))}%`,
                                            top: "-6px",
                                            width: "12px",
                                            height: "20px",
                                            marginLeft: "-6px",
                                            background: getPositionColor(comparison.position),
                                            borderRadius: "4px",
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Difference */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            {comparison.percentageDiff > 0 ? (
                                <MdTrendingUp style={{ color: "#ef4444" }} />
                            ) : comparison.percentageDiff < 0 ? (
                                <MdTrendingDown style={{ color: "#22c55e" }} />
                            ) : (
                                <MdCompareArrows style={{ color: "#6b7280" }} />
                            )}
                            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                {comparison.percentageDiff > 0 ? "+" : ""}{comparison.percentageDiff.toFixed(1)}% vs market avg
                            </span>
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                {stats && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "0.75rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div className="card" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <MdBusiness style={{ color: "var(--color-primary)" }} />
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Competitors</span>
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.competitorCount}</div>
                        </div>
                        <div className="card" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <MdTrendingUp style={{ color: "var(--color-accent)" }} />
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Suggestions</span>
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.pendingRecommendations}</div>
                        </div>
                    </div>
                )}

                {/* Add Competitor Section */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MdAdd style={{ color: "var(--color-primary)" }} />
                        Add Competitor
                    </h2>
                    <AddCompetitorForm />
                </section>

                {/* Competitors List */}
                <section>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MdBusiness style={{ color: "var(--color-primary)" }} />
                        Your Competitors ({competitors.length})
                    </h2>

                    {competitors.length === 0 ? (
                        <div
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <MdBusiness style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }} />
                            <p>No competitors added yet</p>
                            <p style={{ fontSize: "0.875rem" }}>Add competitors to track market prices</p>
                        </div>
                    ) : (
                        <CompetitorList competitors={competitors} />
                    )}
                </section>
            </main>

            <BottomNav role={roleInfo.role} />
        </>
    );
}
