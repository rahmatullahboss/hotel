"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type ReviewWithGuest, respondToReview } from "../actions/reviews";
import { FiStar, FiMessageSquare, FiCheck, FiX, FiEdit2 } from "react-icons/fi";

interface ReviewsListProps {
    reviews: ReviewWithGuest[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [response, setResponse] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmitResponse = (reviewId: string) => {
        if (!response.trim()) return;

        startTransition(async () => {
            const result = await respondToReview(reviewId, response.trim());
            if (result.success) {
                setRespondingTo(null);
                setResponse("");
                router.refresh();
            } else {
                alert(result.error || "Failed to submit response");
            }
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="card"
                    style={{
                        padding: "1rem",
                        borderLeft: review.hotelResponse ? "4px solid #22c55e" : "4px solid #f59e0b",
                    }}
                >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--color-bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {review.guest.name?.charAt(0).toUpperCase() || "G"}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                                    {review.guest.name || "Anonymous Guest"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Rating */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                    key={star}
                                    size={14}
                                    fill={star <= review.rating ? "#f59e0b" : "none"}
                                    color={star <= review.rating ? "#f59e0b" : "#d1d5db"}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review Content */}
                    {review.title && (
                        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>
                            {review.title}
                        </h4>
                    )}
                    {review.content && (
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                            {review.content}
                        </p>
                    )}

                    {/* Category Ratings */}
                    {(review.cleanlinessRating || review.serviceRating) && (
                        <div
                            style={{
                                display: "flex",
                                gap: "1rem",
                                marginTop: "0.75rem",
                                padding: "0.5rem 0.75rem",
                                backgroundColor: "var(--color-bg-secondary)",
                                borderRadius: "0.375rem",
                                fontSize: "0.75rem",
                            }}
                        >
                            {review.cleanlinessRating && (
                                <span>Cleanliness: <strong>{review.cleanlinessRating}</strong></span>
                            )}
                            {review.serviceRating && (
                                <span>Service: <strong>{review.serviceRating}</strong></span>
                            )}
                            {review.valueRating && (
                                <span>Value: <strong>{review.valueRating}</strong></span>
                            )}
                            {review.locationRating && (
                                <span>Location: <strong>{review.locationRating}</strong></span>
                            )}
                        </div>
                    )}

                    {/* Hotel Response */}
                    {review.hotelResponse && respondingTo !== review.id && (
                        <div
                            style={{
                                marginTop: "1rem",
                                padding: "0.75rem",
                                backgroundColor: "rgba(34, 197, 94, 0.05)",
                                borderRadius: "0.5rem",
                                borderLeft: "3px solid #22c55e",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22c55e" }}>
                                    Your Response
                                </span>
                                <button
                                    onClick={() => {
                                        setRespondingTo(review.id);
                                        setResponse(review.hotelResponse || "");
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--color-text-secondary)",
                                        padding: "0.25rem",
                                    }}
                                >
                                    <FiEdit2 size={14} />
                                </button>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
                                {review.hotelResponse}
                            </p>
                        </div>
                    )}

                    {/* Response Form */}
                    {respondingTo === review.id ? (
                        <div style={{ marginTop: "1rem" }}>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Write your response to this review..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                    resize: "vertical",
                                    marginBottom: "0.5rem",
                                }}
                            />
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => handleSubmitResponse(review.id)}
                                    disabled={isPending || !response.trim()}
                                    className="btn btn-primary"
                                    style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                >
                                    <FiCheck /> {isPending ? "Submitting..." : "Submit"}
                                </button>
                                <button
                                    onClick={() => {
                                        setRespondingTo(null);
                                        setResponse("");
                                    }}
                                    className="btn btn-outline"
                                    style={{ fontSize: "0.75rem", padding: "0.5rem 1rem" }}
                                >
                                    <FiX /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : !review.hotelResponse && (
                        <button
                            onClick={() => setRespondingTo(review.id)}
                            style={{
                                marginTop: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem",
                                padding: "0.5rem 0.75rem",
                                background: "none",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.375rem",
                                fontSize: "0.75rem",
                                color: "var(--color-primary)",
                                cursor: "pointer",
                            }}
                        >
                            <FiMessageSquare /> Respond to Review
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
