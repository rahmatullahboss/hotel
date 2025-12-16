"use client";

import { FiStar } from "react-icons/fi";

interface OYOReviewCardProps {
    reviewerName: string;
    reviewDate: string;
    rating: number;
    reviewText: string;
    avatarUrl?: string;
}

export function OYOReviewCard({
    reviewerName,
    reviewDate,
    rating,
    reviewText,
    avatarUrl,
}: OYOReviewCardProps) {
    // Generate avatar initials from name
    const initials = reviewerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="oyo-review-card">
            {/* Reviewer Info */}
            <div className="oyo-review-header">
                <div className="oyo-review-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={reviewerName} />
                    ) : (
                        <span className="avatar-initials">{initials}</span>
                    )}
                </div>
                <div className="oyo-review-meta">
                    <span className="oyo-reviewer-name">{reviewerName}</span>
                    <span className="oyo-review-dot">•</span>
                    <span className="oyo-review-date">{formatDate(reviewDate)}</span>
                </div>
                <div className={`oyo-review-rating ${rating >= 4 ? "high" : rating >= 3 ? "medium" : "low"}`}>
                    {rating}
                    <FiStar size={12} />
                </div>
            </div>

            {/* Review Text */}
            <div className="oyo-review-text">{reviewText}</div>
        </div>
    );
}
