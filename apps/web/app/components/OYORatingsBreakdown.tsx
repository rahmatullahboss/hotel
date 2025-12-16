"use client";

import { useTranslations } from "next-intl";
import { FiStar } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

interface RatingBreakdown {
    stars: number;
    percentage: number;
}

interface OYORatingsBreakdownProps {
    averageRating: number;
    totalReviews: number;
    ratingLabel?: string;
    breakdown?: RatingBreakdown[];
    isISOCertified?: boolean;
}

export function OYORatingsBreakdown({
    averageRating,
    totalReviews,
    ratingLabel = "EXCELLENT",
    breakdown,
    isISOCertified = true,
}: OYORatingsBreakdownProps) {
    const t = useTranslations("hotelDetail");

    // Default breakdown if not provided
    const defaultBreakdown: RatingBreakdown[] = [
        { stars: 5, percentage: 58 },
        { stars: 4, percentage: 15 },
        { stars: 3, percentage: 9 },
        { stars: 2, percentage: 6 },
        { stars: 1, percentage: 9 },
    ];

    const ratings = breakdown || defaultBreakdown;

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return "EXCELLENT";
        if (rating >= 4.0) return "VERY GOOD";
        if (rating >= 3.5) return "GOOD";
        if (rating >= 3.0) return "AVERAGE";
        return "BELOW AVERAGE";
    };

    return (
        <div className="oyo-ratings-section">
            <h2 className="oyo-section-title">Ratings and reviews</h2>

            {/* ISO Certified Badge */}
            {isISOCertified && (
                <div className="oyo-iso-badge">
                    <MdVerified size={14} />
                    <span>ISO CERTIFIED</span>
                </div>
            )}

            <div className="oyo-ratings-content">
                {/* Overall Rating */}
                <div className="oyo-rating-overall">
                    <div className="oyo-rating-badge-large">
                        {averageRating.toFixed(1)}
                        <FiStar size={12} />
                    </div>
                    <div className="oyo-rating-label">{getRatingLabel(averageRating)}</div>
                    <div className="oyo-rating-count">{totalReviews} ratings</div>
                </div>

                {/* Breakdown Bars */}
                <div className="oyo-rating-breakdown">
                    {ratings.map(({ stars, percentage }) => (
                        <div key={stars} className="oyo-rating-bar-row">
                            <span className="oyo-rating-star">{stars}★</span>
                            <div className="oyo-rating-bar">
                                <div
                                    className="oyo-rating-bar-fill"
                                    style={{ width: `${percentage}%` }}
                                    data-stars={stars}
                                />
                            </div>
                            <span className="oyo-rating-percent">{percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
