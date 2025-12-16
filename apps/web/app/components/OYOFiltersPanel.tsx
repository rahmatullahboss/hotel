"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

interface OYOFiltersPanelProps {
    city: string;
    popularLocations?: string[];
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    selectedRating?: number;
    selectedAmenities?: string[];
    collections?: { id: string; label: string }[];
    selectedCollections?: string[];
    onPriceChange: (range: [number, number]) => void;
    onRatingChange?: (rating: number | undefined) => void;
    onAmenityToggle?: (amenity: string) => void;
    onLocationClick?: (location: string) => void;
    onCollectionToggle?: (collectionId: string) => void;
}

export function OYOFiltersPanel({
    city,
    popularLocations = ["Downtown", "Airport Area", "Beach Side", "City Center", "Business District"],
    minPrice,
    maxPrice,
    priceRange,
    selectedRating,
    selectedAmenities = [],
    collections = [
        { id: "family", label: "Family OYOs" },
        { id: "friendly", label: "Your friendly neighbourhood stay" },
        { id: "group", label: "For Group Travellers" },
    ],
    selectedCollections = [],
    onPriceChange,
    onRatingChange,
    onAmenityToggle,
    onLocationClick,
    onCollectionToggle,
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

            {/* Collections */}
            <div className="oyo-filter-section">
                <h3 className="oyo-filter-label">Collections</h3>
                <div className="oyo-collections-list">
                    {collections.map((collection) => (
                        <label key={collection.id} className="oyo-collection-item">
                            <input
                                type="checkbox"
                                checked={selectedCollections.includes(collection.id)}
                                onChange={() => onCollectionToggle?.(collection.id)}
                            />
                            <span>{collection.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
