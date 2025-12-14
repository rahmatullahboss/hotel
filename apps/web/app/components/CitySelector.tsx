"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMapPin, FiNavigation, FiChevronRight } from "react-icons/fi";
import { useLocationDetection } from "./LocationDetector";

import "./CitySelector.css";

interface City {
    name: string;
    nameBn: string;
    slug: string;
    isPopular: boolean;
}

interface CitySelectorProps {
    cities: City[];
    title?: string;
    showDetect?: boolean;
}

export function CitySelector({ cities, title = "Select Your City", showDetect = true }: CitySelectorProps) {
    const router = useRouter();
    const { city: detectedCity, loading, error, detectLocation } = useLocationDetection();
    const [showAll, setShowAll] = useState(false);

    // Popular cities first, then others
    const popularCities = cities.filter((c) => c.isPopular);
    const otherCities = cities.filter((c) => !c.isPopular);
    const displayCities = showAll ? cities : popularCities;

    return (
        <div className="city-selector">
            <h2 className="city-selector-title">{title}</h2>

            {/* Detect Location Button */}
            {showDetect && (
                <button
                    className="detect-location-btn"
                    onClick={detectLocation}
                    disabled={loading}
                >
                    <FiNavigation className={loading ? "spin" : ""} />
                    {loading
                        ? "Detecting..."
                        : detectedCity
                            ? `📍 Near ${cities.find((c) => c.slug === detectedCity)?.name || "your location"}`
                            : "Use My Location"}
                </button>
            )}

            {/* Detected City Card */}
            {detectedCity && (
                <Link href={`/city/${detectedCity}`} className="detected-city-card">
                    <FiMapPin />
                    <span>Hotels near you in {cities.find((c) => c.slug === detectedCity)?.name}</span>
                    <FiChevronRight />
                </Link>
            )}

            {/* City Grid */}
            <div className="city-grid">
                {displayCities.map((city) => (
                    <Link
                        key={city.slug}
                        href={`/city/${city.slug}`}
                        className={`city-card ${detectedCity === city.slug ? "detected" : ""}`}
                    >
                        <FiMapPin className="city-icon" />
                        <div className="city-info">
                            <span className="city-name">{city.name}</span>
                            <span className="city-name-bn">{city.nameBn}</span>
                        </div>
                        {city.isPopular && <span className="popular-badge">Popular</span>}
                    </Link>
                ))}
            </div>

            {/* Show More/Less */}
            {otherCities.length > 0 && (
                <button
                    className="show-more-btn"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? "Show Less" : `Show All ${cities.length} Cities`}
                </button>
            )}
        </div>
    );
}
