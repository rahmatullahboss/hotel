"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
    const { city: detectedCity, loading: passiveLoading, detectLocation: detectPassive } = useLocationDetection();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const handleRedirectToNearby = () => {
        if (!navigator.geolocation) return;

        setIsRedirecting(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                router.push(`/hotels?lat=${latitude}&lng=${longitude}&sort=distance`);
            },
            (error) => {
                console.error("Location detection failed:", error);
                setIsRedirecting(false);
            }
        );
    };

    // Popular cities first, then others
    const popularCities = cities.filter((c) => c.isPopular);
    const otherCities = cities.filter((c) => !c.isPopular);
    const displayCities = showAll ? cities : popularCities;

    // Combined loading state
    const isLoading = isRedirecting || passiveLoading;

    return (
        <div className="city-selector">
            <h2 className="city-selector-title">{t("title")}</h2>

            {/* Detect Location Button */}
            {showDetect && (
                <button
                    className="detect-location-btn"
                    onClick={handleRedirectToNearby}
                    disabled={isLoading}
                >
                    <FiNavigation className={isLoading ? "spin" : ""} />
                    {isLoading
                        ? t("detecting")
                        : t("useMyLocation")}
                </button>
            )}

            {detectedCity && (
                <Link href={`/hotels?city=${encodeURIComponent(cities.find((c) => c.slug === detectedCity)?.name || "")}`} className="detected-city-card">
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
                        href={`/hotels?city=${encodeURIComponent(city.name)}`}
                        className={`city-tile ${detectedCity === city.slug ? "detected" : ""} ${city.slug === "coxs-bazar" || city.slug === "sylhet" ? "bento-large" : ""}`}
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${cityImages[city.slug] || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=600&auto=format&fit=crop"})`
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
