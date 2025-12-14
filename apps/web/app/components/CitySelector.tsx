"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMapPin, FiNavigation, FiChevronRight } from "react-icons/fi";
import { useLocationDetection } from "./LocationDetector";

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

    useEffect(() => {
        // Auto-redirect if city detected
        if (detectedCity) {
            // Don't auto-redirect, just highlight the detected city
            // User can click to go there
        }
    }, [detectedCity]);

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

            <style jsx>{`
                .city-selector {
                    padding: 1rem;
                }

                .city-selector-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .detect-location-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1rem;
                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .detect-location-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .detect-location-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .detect-location-btn :global(.spin) {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .detected-city-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 0.75rem;
                    color: var(--color-text-primary);
                    text-decoration: none;
                    margin-bottom: 1rem;
                    font-weight: 500;
                }

                .detected-city-card:hover {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.1));
                }

                .detected-city-card span {
                    flex: 1;
                }

                .city-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                }

                .city-card {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.875rem;
                    background: white;
                    border: 1px solid var(--color-border);
                    border-radius: 0.75rem;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s;
                }

                .city-card:hover {
                    border-color: var(--color-primary);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .city-card.detected {
                    border-color: var(--color-success);
                    background: rgba(16, 185, 129, 0.05);
                }

                .city-icon {
                    color: var(--color-primary);
                    flex-shrink: 0;
                }

                .city-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .city-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .city-name-bn {
                    font-size: 0.75rem;
                    color: var(--color-text-secondary);
                }

                .popular-badge {
                    font-size: 0.625rem;
                    padding: 0.125rem 0.375rem;
                    background: var(--color-warning);
                    color: white;
                    border-radius: 0.25rem;
                    font-weight: 600;
                }

                .show-more-btn {
                    width: 100%;
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: transparent;
                    border: 1px dashed var(--color-border);
                    border-radius: 0.5rem;
                    color: var(--color-primary);
                    font-weight: 500;
                    cursor: pointer;
                }

                .show-more-btn:hover {
                    background: var(--color-bg-secondary);
                }

                @media (min-width: 640px) {
                    .city-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}
