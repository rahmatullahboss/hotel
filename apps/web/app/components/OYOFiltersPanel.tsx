"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSearch, FiChevronDown, FiChevronUp, FiStar, FiNavigation } from "react-icons/fi";

interface OYOFiltersPanelProps {
    city: string;
    popularLocations?: { label: string; value: string }[];
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    minRating?: number;
    selectedAmenities?: string[];
    onPriceChange: (range: [number, number]) => void;
    onRatingChange?: (rating: number | undefined) => void;
    onAmenityToggle?: (amenity: string) => void;
    onLocationClick?: (location: string) => void;
    onDetectLocation?: () => void;
}

// Common amenities that exist in the database
const AVAILABLE_AMENITIES = [
    { key: "wifi", label: "WiFi" },
    { key: "ac", label: "AC" },
    { key: "tv", label: "TV" },
    { key: "parking", label: "Parking" },
    { key: "pool", label: "Pool" },
    { key: "restaurant", label: "Restaurant" },
    { key: "gym", label: "Gym" },
    { key: "roomService", label: "Room Service" },
];

// Rating options
const RATING_OPTIONS = [
    { value: 4.5, label: "4.5+" },
    { value: 4.0, label: "4.0+" },
    { value: 3.5, label: "3.5+" },
    { value: 3.0, label: "3.0+" },
];

export function OYOFiltersPanel({
    city,
    popularLocations = [
        { label: "Dhaka", value: "Dhaka" },
        { label: "Chittagong", value: "Chittagong" },
        { label: "Cox's Bazar", value: "Cox's Bazar" },
        { label: "Sylhet", value: "Sylhet" }
    ],
    minPrice,
    maxPrice,
    priceRange,
    minRating,
    selectedAmenities = [],
    onPriceChange,
    onRatingChange,
    onAmenityToggle,
    onLocationClick,
    onDetectLocation,
}: OYOFiltersPanelProps) {
    const t = useTranslations("filters");
    const [showMoreLocations, setShowMoreLocations] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");

    const displayedLocations = showMoreLocations ? popularLocations : popularLocations.slice(0, 5);
    const filteredLocations = locationSearch
        ? popularLocations.filter((loc) => loc.label.toLowerCase().includes(locationSearch.toLowerCase()))
        : displayedLocations;

    return (
        <div className="oyo-filters-panel">
            <h2 className="oyo-filters-title">{t("title")}</h2>

            {/* Popular Locations */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">{t("popularLocations", { city })}</h3>

                {/* Near Me Button */}
                <button
                    className="oyo-location-tag nearby-btn property-type-btn"
                    style={{
                        width: "100%",
                        marginBottom: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        backgroundColor: "#E63946",
                        color: "white",
                        border: "none"
                    }}
                    onClick={onDetectLocation}
                >
                    <FiNavigation /> Use Current Location
                </button>

                <div className="oyo-location-search">
                    <FiSearch size={14} />
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                    />
                </div>
                <div className="oyo-location-tags">
                    {filteredLocations.map((location) => (
                        <button
                            key={location.value}
                            className="oyo-location-tag"
                            onClick={() => onLocationClick?.(location.value)}
                        >
                            {location.label}
                        </button>
                    ))}
                </div>
                {popularLocations.length > 5 && !locationSearch && (
                    <button
                        className="oyo-view-more"
                        onClick={() => setShowMoreLocations(!showMoreLocations)}
                    >
                        {showMoreLocations ? (
                            <>
                                <FiChevronUp size={14} /> {t("viewLess")}
                            </>
                        ) : (
                            <>
                                {t("viewMore")}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Price Range Slider */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">{t("price")}</h3>
                <div className="oyo-price-slider">
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                        className="oyo-range-input"
                    />
                    <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                        className="oyo-range-input"
                    />
                </div>
                <div className="oyo-price-labels">
                    <span>৳{priceRange[0].toLocaleString()}</span>
                    <span>৳{priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            {/* Rating Filter */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">{t("rating")}</h3>
                <div className="oyo-rating-options">
                    {RATING_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            className={`oyo-rating-btn ${minRating === option.value ? "active" : ""}`}
                            onClick={() => onRatingChange?.(minRating === option.value ? undefined : option.value)}
                        >
                            <FiStar size={12} />
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Amenities Filter */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">{t("amenities")}</h3>
                <div className="oyo-amenities-list">
                    {AVAILABLE_AMENITIES.map((amenity) => (
                        <label key={amenity.key} className="oyo-amenity-item">
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.label)}
                                onChange={() => onAmenityToggle?.(amenity.label)}
                            />
                            <span>{t(`amenity.${amenity.key}`)}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
