"use client";

import { useTranslations } from "next-intl";
import { FiStar, FiX } from "react-icons/fi";

// Common amenities list
const AMENITIES = [
    { key: "wifi", icon: "📶" },
    { key: "ac", icon: "❄️" },
    { key: "tv", icon: "📺" },
    { key: "parking", icon: "🅿️" },
    { key: "pool", icon: "🏊" },
    { key: "restaurant", icon: "🍽️" },
];

interface SearchFiltersPanelProps {
    minRating: number;
    onMinRatingChange: (rating: number) => void;
    selectedAmenities: string[];
    onAmenitiesChange: (amenities: string[]) => void;
    onClearAll: () => void;
}

export function SearchFiltersPanel({
    minRating,
    onMinRatingChange,
    selectedAmenities,
    onAmenitiesChange,
    onClearAll,
}: SearchFiltersPanelProps) {
    const t = useTranslations("filters");

    const toggleAmenity = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            onAmenitiesChange(selectedAmenities.filter((a) => a !== amenity));
        } else {
            onAmenitiesChange([...selectedAmenities, amenity]);
        }
    };

    const hasActiveFilters = minRating > 0 || selectedAmenities.length > 0;

    return (
        <div className="search-filters-panel">
            {/* Rating Filter */}
            <div className="filter-section">
                <span className="filter-label">{t("rating")}:</span>
                <div className="rating-filter-buttons">
                    {[3, 4, 5].map((rating) => (
                        <button
                            key={rating}
                            type="button"
                            className={`rating-filter-btn ${minRating === rating ? "active" : ""}`}
                            onClick={() => onMinRatingChange(minRating === rating ? 0 : rating)}
                        >
                            <FiStar size={14} />
                            {rating}+
                        </button>
                    ))}
                </div>
            </div>

            {/* Amenities Filter */}
            <div className="filter-section">
                <span className="filter-label">{t("amenities")}:</span>
                <div className="amenity-filter-chips">
                    {AMENITIES.map(({ key, icon }) => (
                        <button
                            key={key}
                            type="button"
                            className={`amenity-filter-chip ${selectedAmenities.includes(key) ? "active" : ""}`}
                            onClick={() => toggleAmenity(key)}
                        >
                            <span>{icon}</span>
                            {t(`amenity.${key}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear All */}
            {hasActiveFilters && (
                <button
                    type="button"
                    className="clear-filters-btn"
                    onClick={onClearAll}
                >
                    <FiX size={14} />
                    {t("clearAll")}
                </button>
            )}
        </div>
    );
}
