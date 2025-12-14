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
