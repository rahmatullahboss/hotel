"use client";

import { MdStar } from "react-icons/md";

interface RatingBreakdownProps {
    breakdown: {
        fiveStar: number;
        fourStar: number;
        threeStar: number;
        twoStar: number;
        oneStar: number;
    };
    total: number;
}

export function RatingBreakdown({ breakdown, total }: RatingBreakdownProps) {
    const getPercentage = (count: number) => {
        if (total === 0) return 0;
        return (count / total) * 100;
    };

    const ratings = [
        { stars: 5, count: breakdown.fiveStar, color: "#22c55e" },
        { stars: 4, count: breakdown.fourStar, color: "#84cc16" },
        { stars: 3, count: breakdown.threeStar, color: "#f59e0b" },
        { stars: 2, count: breakdown.twoStar, color: "#f97316" },
        { stars: 1, count: breakdown.oneStar, color: "#ef4444" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {ratings.map((rating) => (
                <div key={rating.stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        width: "60px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.875rem",
                    }}>
                        <MdStar style={{ color: "#f59e0b" }} />
                        {rating.stars}
                    </div>
                    <div style={{ flex: 1, height: "8px", backgroundColor: "var(--color-bg-secondary)", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                            style={{
                                height: "100%",
                                width: `${getPercentage(rating.count)}%`,
                                backgroundColor: rating.color,
                                borderRadius: "4px",
                                transition: "width 0.3s ease",
                            }}
                        />
                    </div>
                    <div style={{
                        width: "60px",
                        textAlign: "right",
                        fontSize: "0.875rem",
                        color: "var(--color-text-muted)",
                    }}>
                        {rating.count} ({getPercentage(rating.count).toFixed(0)}%)
                    </div>
                </div>
            ))}
        </div>
    );
}

export default RatingBreakdown;
