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
    ratingLabel,
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

            {/* ISO Certified Badge */}
            {isISOCertified && (
                <div className="oyo-iso-badge">
                    <MdVerified size={14} />
                    <span>{t("ratings.certified")}</span>
                </div>
            )}

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
