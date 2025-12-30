"use client";

import { useState } from "react";
import { FiStar, FiMessageSquare, FiThumbsUp, FiThumbsDown, FiFlag } from "react-icons/fi";

interface Review {
    id: string;
    guestName: string;
    roomNumber: string;
    checkOutDate: string;
    rating: number;
    comment: string;
    sentiment?: "positive" | "neutral" | "negative";
    categories?: {
        cleanliness?: number;
        service?: number;
        location?: number;
        value?: number;
    };
    replied?: boolean;
}

interface FeedbackCardProps {
    review: Review;
    onReply?: (review: Review) => void;
    onFlag?: (review: Review) => void;
}

export function FeedbackCard({ review, onReply, onFlag }: FeedbackCardProps) {
    const [expanded, setExpanded] = useState(false);

    const getSentimentColor = (sentiment?: string) => {
        switch (sentiment) {
            case "positive":
                return "#10B981";
            case "negative":
                return "#EF4444";
            default:
                return "#F59E0B";
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case "positive":
                return <FiThumbsUp size={14} />;
            case "negative":
                return <FiThumbsDown size={14} />;
            default:
                return null;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                        key={star}
                        size={14}
                        fill={star <= rating ? "#F59E0B" : "transparent"}
                        color={star <= rating ? "#F59E0B" : "var(--color-border)"}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className="glass-card"
            style={{
                padding: "1rem",
                borderLeft: `4px solid ${getSentimentColor(review.sentiment)}`,
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "4px" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{review.guestName}</span>
                        {review.sentiment && (
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    background: `${getSentimentColor(review.sentiment)}15`,
                                    color: getSentimentColor(review.sentiment),
                                    fontSize: "0.6875rem",
                                    fontWeight: 500,
                                }}
                            >
                                {getSentimentIcon(review.sentiment)}
                                {review.sentiment}
                            </span>
                        )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Room {review.roomNumber} • {review.checkOutDate}
                    </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {renderStars(review.rating)}
                    <span style={{ fontWeight: 700, color: "#F59E0B" }}>{review.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Comment */}
            <p
                style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: "0.75rem",
                    display: expanded ? "block" : "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: expanded ? "visible" : "hidden",
                }}
            >
                {review.comment}
            </p>

            {review.comment.length > 150 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--color-primary)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "0.75rem",
                    }}
                >
                    {expanded ? "Show less" : "Read more"}
                </button>
            )}

            {/* Category Ratings */}
            {review.categories && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "0.5rem",
                        padding: "0.75rem",
                        background: "var(--color-bg-secondary)",
                        borderRadius: "8px",
                        marginBottom: "0.75rem",
                    }}
                >
                    {Object.entries(review.categories).map(([category, rating]) => (
                        <div key={category} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "0.625rem", color: "var(--color-text-muted)", textTransform: "capitalize", marginBottom: "2px" }}>
                                {category}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{rating}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                    onClick={() => onReply?.(review)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: review.replied ? "var(--color-bg-secondary)" : "transparent",
                        color: review.replied ? "var(--color-text-muted)" : "var(--color-text-primary)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                    }}
                >
                    <FiMessageSquare size={14} />
                    {review.replied ? "Replied" : "Reply"}
                </button>
                <button
                    onClick={() => onFlag?.(review)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        background: "transparent",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                    }}
                >
                    <FiFlag size={14} />
                    Flag
                </button>
            </div>
        </div>
    );
}

interface FeedbackDashboardProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    onReply?: (review: Review) => void;
}

export function FeedbackDashboard({
    reviews,
    averageRating,
    totalReviews,
    onReply,
}: FeedbackDashboardProps) {
    const [filter, setFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");

    const filteredReviews = reviews.filter((r) => filter === "all" || r.sentiment === filter);

    const sentimentCounts = {
        positive: reviews.filter((r) => r.sentiment === "positive").length,
        neutral: reviews.filter((r) => r.sentiment === "neutral").length,
        negative: reviews.filter((r) => r.sentiment === "negative").length,
    };

    return (
        <div className="animate-fade-in">
            {/* Summary Card */}
            <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                            Overall Rating
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "2rem", fontWeight: 700 }}>{averageRating.toFixed(1)}</span>
                            <div>
                                <div style={{ display: "flex", gap: "2px" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FiStar
                                            key={star}
                                            size={16}
                                            fill={star <= Math.round(averageRating) ? "#F59E0B" : "transparent"}
                                            color={star <= Math.round(averageRating) ? "#F59E0B" : "var(--color-border)"}
                                        />
                                    ))}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                    {totalReviews} reviews
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10B981" }}>
                                {sentimentCounts.positive}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Positive</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#F59E0B" }}>
                                {sentimentCounts.neutral}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Neutral</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#EF4444" }}>
                                {sentimentCounts.negative}
                            </div>
                            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>Negative</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {(["all", "positive", "neutral", "negative"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid var(--color-border)",
                            background: filter === f ? "var(--color-primary)" : "transparent",
                            color: filter === f ? "white" : "var(--color-text-secondary)",
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                            textTransform: "capitalize",
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {filteredReviews.length === 0 ? (
                    <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                        No {filter === "all" ? "" : filter} reviews
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <FeedbackCard key={review.id} review={review} onReply={onReply} />
                    ))
                )}
            </div>
        </div>
    );
}
