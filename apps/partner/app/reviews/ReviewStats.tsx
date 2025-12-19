"use client";

import { type ReviewStats as ReviewStatsType } from "../actions/reviews";
import { FiStar, FiMessageCircle, FiTrendingUp } from "react-icons/fi";

interface ReviewStatsProps {
    stats: ReviewStatsType;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "#22c55e";
        if (rating >= 4.0) return "#84cc16";
        if (rating >= 3.0) return "#f59e0b";
        return "#ef4444";
    };

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            {/* Main Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "1.5rem" }}>
                {/* Average Rating */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            color: getRatingColor(stats.averageRating),
                            lineHeight: 1,
                        }}
                    >
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.125rem", margin: "0.5rem 0" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                                key={star}
                                size={14}
                                fill={star <= Math.round(stats.averageRating) ? "#f59e0b" : "none"}
                                color={star <= Math.round(stats.averageRating) ? "#f59e0b" : "#d1d5db"}
                            />
                        ))}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        Average Rating
                    </div>
                </div>

                {/* Total Reviews */}
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--color-primary)", lineHeight: 1 }}>
                        {stats.totalReviews}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.75rem" }}>
                        <FiMessageCircle style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                        Total Reviews
                    </div>
                </div>

                {/* Response Rate */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: 700,
                            color: stats.responseRate >= 80 ? "#22c55e" : stats.responseRate >= 50 ? "#f59e0b" : "#ef4444",
                            lineHeight: 1,
                        }}
                    >
                        {stats.responseRate}%
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.75rem" }}>
                        <FiTrendingUp style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                        Response Rate
                    </div>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                    RATING BREAKDOWN
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {stats.ratingBreakdown.map((item) => (
                        <div key={item.rating} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ width: "20px", fontSize: "0.75rem", fontWeight: 600 }}>
                                {item.rating}★
                            </span>
                            <div
                                style={{
                                    flex: 1,
                                    height: "8px",
                                    backgroundColor: "var(--color-bg-secondary)",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        width: `${item.percentage}%`,
                                        height: "100%",
                                        backgroundColor: item.rating >= 4 ? "#22c55e" : item.rating >= 3 ? "#f59e0b" : "#ef4444",
                                        borderRadius: "4px",
                                        transition: "width 0.3s ease",
                                    }}
                                />
                            </div>
                            <span style={{ width: "40px", fontSize: "0.75rem", color: "var(--color-text-secondary)", textAlign: "right" }}>
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Averages */}
            {(stats.categoryAverages.cleanliness > 0 || stats.categoryAverages.service > 0) && (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>
                        CATEGORY SCORES
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                        {[
                            { label: "Cleanliness", value: stats.categoryAverages.cleanliness },
                            { label: "Service", value: stats.categoryAverages.service },
                            { label: "Value", value: stats.categoryAverages.value },
                            { label: "Location", value: stats.categoryAverages.location },
                        ].map((cat) => (
                            <div key={cat.label} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.25rem", fontWeight: 600, color: getRatingColor(cat.value) }}>
                                    {cat.value > 0 ? cat.value.toFixed(1) : "—"}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                                    {cat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
