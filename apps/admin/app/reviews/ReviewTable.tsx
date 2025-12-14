"use client";

import { useState } from "react";
import { MdVisibility, MdVisibilityOff, MdDelete, MdReply, MdStar } from "react-icons/md";
import { hideReview, showReview, deleteReview, addHotelResponse } from "../actions/reviews";

interface Review {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    hotelName: string;
    hotelId: string;
    guestName: string | null;
    guestEmail: string | null;
    hotelResponse: string | null;
    isVisible: boolean;
    createdAt: Date;
}

interface ReviewTableProps {
    reviews: Review[];
}

export function ReviewTable({ reviews }: ReviewTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [responseModal, setResponseModal] = useState<string | null>(null);
    const [response, setResponse] = useState("");

    const handleVisibility = async (id: string, visible: boolean) => {
        setLoadingId(id);
        try {
            if (visible) {
                await showReview(id);
            } else {
                await hideReview(id);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this review?")) return;
        setLoadingId(id);
        try {
            await deleteReview(id);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const handleResponse = async (id: string) => {
        if (!response.trim()) return;
        setLoadingId(id);
        try {
            await addHotelResponse(id, response);
            setResponseModal(null);
            setResponse("");
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoadingId(null);
        }
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <MdStar
                key={i}
                style={{
                    color: i < rating ? "#f59e0b" : "#e5e7eb",
                    fontSize: "1rem",
                }}
            />
        ));
    };

    if (reviews.length === 0) {
        return (
            <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                No reviews found
            </div>
        );
    }

    return (
        <>
            <div className="card" style={{ overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-bg-secondary)" }}>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Hotel</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Guest</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Rating</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Review</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Status</th>
                            <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{review.hotelName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ fontSize: "0.875rem" }}>{review.guestName || "Anonymous"}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                        {review.guestEmail || "N/A"}
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "1px" }}>
                                        {getRatingStars(review.rating)}
                                    </div>
                                </td>
                                <td style={{ padding: "0.75rem 1rem", maxWidth: "300px" }}>
                                    {review.title && (
                                        <div style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                                            {review.title}
                                        </div>
                                    )}
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--color-text-muted)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                    }}>
                                        {review.content || "No content"}
                                    </div>
                                    {review.hotelResponse && (
                                        <div style={{
                                            marginTop: "0.5rem",
                                            padding: "0.375rem 0.5rem",
                                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                        }}>
                                            <strong>Response:</strong> {review.hotelResponse.substring(0, 50)}...
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                                    <span style={{
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "4px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        backgroundColor: review.isVisible ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                        color: review.isVisible ? "#22c55e" : "#ef4444",
                                    }}>
                                        {review.isVisible ? "Visible" : "Hidden"}
                                    </span>
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                                        <button
                                            type="button"
                                            onClick={() => handleVisibility(review.id, !review.isVisible)}
                                            disabled={loadingId === review.id}
                                            title={review.isVisible ? "Hide" : "Show"}
                                            style={{
                                                padding: "0.375rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: review.isVisible ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                                                color: review.isVisible ? "#ef4444" : "#22c55e",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {review.isVisible ? <MdVisibilityOff /> : <MdVisibility />}
                                        </button>
                                        {!review.hotelResponse && (
                                            <button
                                                type="button"
                                                onClick={() => setResponseModal(review.id)}
                                                disabled={loadingId === review.id}
                                                title="Add Response"
                                                style={{
                                                    padding: "0.375rem",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                    color: "#3b82f6",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <MdReply />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(review.id)}
                                            disabled={loadingId === review.id}
                                            title="Delete"
                                            style={{
                                                padding: "0.375rem",
                                                border: "none",
                                                borderRadius: "6px",
                                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                                color: "#ef4444",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Response Modal */}
            {responseModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "var(--color-bg-primary)",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        width: "100%",
                        maxWidth: "450px",
                    }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>Add Hotel Response</h3>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Write a response on behalf of the hotel..."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid var(--color-border)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                resize: "vertical",
                            }}
                        />
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                type="button"
                                onClick={() => { setResponseModal(null); setResponse(""); }}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "8px",
                                    background: "var(--color-bg-secondary)",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleResponse(responseModal)}
                                disabled={loadingId === responseModal || !response.trim()}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    border: "none",
                                    borderRadius: "8px",
                                    background: "var(--color-primary)",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Submit Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReviewTable;
