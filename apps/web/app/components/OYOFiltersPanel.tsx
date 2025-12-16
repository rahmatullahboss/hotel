"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSearch, FiChevronDown, FiChevronUp, FiStar } from "react-icons/fi";

interface OYOFiltersPanelProps {
    city: string;
    popularLocations?: string[];
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    minRating?: number;
    selectedAmenities?: string[];
    onPriceChange: (range: [number, number]) => void;
    onRatingChange?: (rating: number | undefined) => void;
    onAmenityToggle?: (amenity: string) => void;
    onLocationClick?: (location: string) => void;
}

// Common amenities that exist in the database
const AVAILABLE_AMENITIES = [
    "WiFi",
    "AC",
    "TV",
    "Parking",
    "Pool",
    "Restaurant",
    "Gym",
    "Room Service",
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
    popularLocations = ["Dhaka", "Chittagong", "Cox's Bazar", "Sylhet"],
    minPrice,
    maxPrice,
    priceRange,
    minRating,
    selectedAmenities = [],
    onPriceChange,
    onRatingChange,
    onAmenityToggle,
    onLocationClick,
}: OYOFiltersPanelProps) {
    const t = useTranslations("filters");
    const [showMoreLocations, setShowMoreLocations] = useState(false);
    const [locationSearch, setLocationSearch] = useState("");

    const displayedLocations = showMoreLocations ? popularLocations : popularLocations.slice(0, 5);
    const filteredLocations = locationSearch
        ? popularLocations.filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase()))
        : displayedLocations;

    return (
        <div className="oyo-filters-panel">
            <h2 className="oyo-filters-title">Filters</h2>

            {/* Popular Locations */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">Popular locations in {city}</h3>
                <div className="oyo-location-search">
                    <FiSearch size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                    />
                </div>
                <div className="oyo-location-tags">
                    {filteredLocations.map((location) => (
                        <button
                            key={location}
                            className="oyo-location-tag"
                            onClick={() => onLocationClick?.(location)}
                        >
                            {location}
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
                                <FiChevronUp size={14} /> View Less
                            </>
                        ) : (
                            <>
                                + View More
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Price Range Slider */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">Price</h3>
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
                <h3 className="oyo-filter-label">Rating</h3>
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
                <h3 className="oyo-filter-label">Amenities</h3>
                <div className="oyo-amenities-list">
                    {AVAILABLE_AMENITIES.map((amenity) => (
                        <label key={amenity} className="oyo-amenity-item">
                            <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity)}
                                onChange={() => onAmenityToggle?.(amenity)}
                            />
                            <span>{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
