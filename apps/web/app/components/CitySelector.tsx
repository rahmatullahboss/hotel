"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMapPin, FiNavigation, FiChevronRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
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
    showDetect?: boolean;
}

const cityImages: Record<string, string> = {
    dhaka: "https://images.unsplash.com/photo-1610476485078-43d528b49ce5?q=80&w=600&auto=format&fit=crop",
    chittagong: "https://images.unsplash.com/photo-1594955745819-06337890f507?q=80&w=600&auto=format&fit=crop",
    "coxs-bazar": "https://images.unsplash.com/photo-1620242270034-7bc6aa2b4c8d?q=80&w=600&auto=format&fit=crop",
    sylhet: "https://images.unsplash.com/photo-1593368225575-d143329f27a6?q=80&w=600&auto=format&fit=crop",
    kolkata: "https://images.unsplash.com/photo-1558431382-27e30314225d?q=80&w=600&auto=format&fit=crop",
};

export function CitySelector({ cities, showDetect = true }: CitySelectorProps) {
    const t = useTranslations("citySelector");
    const { city: detectedCity, loading, detectLocation } = useLocationDetection();
    const [showAll, setShowAll] = useState(false);

    // Popular cities first, then others
    const popularCities = cities.filter((c) => c.isPopular);
    const otherCities = cities.filter((c) => !c.isPopular);
    const displayCities = showAll ? cities : popularCities;

    return (
        <div className="city-selector">
            <h2 className="city-selector-title">{t("title")}</h2>

            {/* Detect Location Button */}
            {showDetect && (
                <button
                    className="detect-location-btn"
                    onClick={detectLocation}
                    disabled={loading}
                >
                    <FiNavigation className={loading ? "spin" : ""} />
                    {loading
                        ? t("detecting")
                        : detectedCity
                            ? `📍 ${t("near")} ${cities.find((c) => c.slug === detectedCity)?.name || t("yourLocation")}`
                            : t("useMyLocation")}
                </button>
            )}

            {detectedCity && (
                <Link href={`/city/${detectedCity}`} className="detected-city-card">
                    <FiMapPin />
                    <span>{t("hotelsNearYou", { city: cities.find((c) => c.slug === detectedCity)?.name || "" })}</span>
                    <FiChevronRight />
                </Link>
            )}

            {/* City Grid - Now with Image Tiles */}
            <div className="city-grid">
                {displayCities.map((city) => (
                    <Link
                        key={city.slug}
                        href={`/city/${city.slug}`}
                        className={`city-tile ${detectedCity === city.slug ? "detected" : ""}`}
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${cityImages[city.slug] || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600&auto=format&fit=crop"})`
                        }}
                    >
                        <div className="city-info-overlay">
                            <span className="city-name">{city.name}</span>
                            <span className="city-name-bn">{city.nameBn}</span>
                        </div>
                        {city.isPopular && <span className="popular-badge">{t("popular")}</span>}
                    </Link>
                ))}
            </div>

            {/* Show More/Less */}
            {otherCities.length > 0 && (
                <button
                    className="show-more-btn"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? t("showLess") : t("showAll", { count: cities.length })}
                </button>
            )}


        </div>
    );
}
