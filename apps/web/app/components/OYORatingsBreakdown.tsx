"use client";

import { useTranslations } from "next-intl";
import { FiStar } from "react-icons/fi";

interface RatingBreakdown {
    stars: number;
    percentage: number;
}

interface OYORatingsBreakdownProps {
    averageRating: number;
    totalReviews: number;
    ratingLabel?: string;
    breakdown?: RatingBreakdown[];
}

export function OYORatingsBreakdown({
    averageRating,
    totalReviews,
    ratingLabel,
    breakdown,
}: OYORatingsBreakdownProps) {
    const t = useTranslations("hotelDetail");

    const getRatingLabel = (rating: number): string => {
        if (rating >= 4.5) return t("ratings.excellent");
        if (rating >= 4.0) return t("ratings.veryGood");
        if (rating >= 3.5) return t("ratings.good");
        if (rating >= 3.0) return t("ratings.average");
        return t("ratings.belowAverage");
    };

    return (
        <div className="oyo-ratings-section">
            <h2 className="oyo-section-title">{t("ratings.title")}</h2>

            <div className="oyo-ratings-content">
                {/* Overall Rating */}
                <div className="oyo-rating-overall">
                    <div className="oyo-rating-badge-large">
                        {averageRating.toFixed(1)}
                        <FiStar size={12} />
                    </div>
                    <div className="oyo-rating-label">{ratingLabel || getRatingLabel(averageRating)}</div>
                    <div className="oyo-rating-count">{t("ratings.ratingsCount", { count: totalReviews })}</div>
                </div>

                {/* Breakdown Bars - only show if we have real data */}
                {breakdown && breakdown.length > 0 && (
                    <div className="oyo-rating-breakdown">
                        {breakdown.map(({ stars, percentage }) => (
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
                )}
            </div>
        </div>
    );
}
