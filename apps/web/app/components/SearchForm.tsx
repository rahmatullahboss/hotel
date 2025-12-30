"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiMapPin, FiCalendar, FiUser, FiCrosshair } from "react-icons/fi";

interface SearchFormProps {
    compact?: boolean;
}

export function SearchForm({ compact = false }: SearchFormProps) {
    const router = useRouter();
    const t = useTranslations("search");

    // Set default dates
    const today = new Date().toISOString().split("T")[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;

    const [city, setCity] = useState("");
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [guests, setGuests] = useState(2);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");

    // Near Me state
    const [nearMeLoading, setNearMeLoading] = useState(false);

    // Near Me handler - gets user location and redirects to hotels page
    const handleNearMe = () => {
        if (!navigator.geolocation) {
            alert(t("locationNotSupported") || "Location not supported");
            return;
        }

        setNearMeLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const params = new URLSearchParams({
                    lat: latitude.toString(),
                    lng: longitude.toString(),
                    sort: "distance",
                    checkIn: checkIn || today,
                    checkOut: checkOut || tomorrow,
                    guests: guests.toString(),
                });
                router.push(`/hotels?${params.toString()}`);
                setNearMeLoading(false);
            },
            (error) => {
                setNearMeLoading(false);
                if (error.code === 1) {
                    alert(t("locationDenied") || "Location access denied");
                } else {
                    alert(t("locationFailed") || "Failed to get location");
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams({
            city: city || "Dhaka",
            checkIn: checkIn || new Date().toISOString().split("T")[0]!,
            checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0]!,
            guests: guests.toString(),
        });
        if (priceMin) params.set("priceMin", priceMin);
        if (priceMax) params.set("priceMax", priceMax);
        router.push(`/hotels?${params.toString()}`);
    };

    if (compact) {
        return (
            <form
                onSubmit={handleSubmit}
                className="search-form"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "20px", height: "20px", color: "var(--color-primary)", flexShrink: 0 }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
                <input
                    type="text"
                    placeholder={t("locationPlaceholder")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: "0.9rem",
                        background: "transparent",
                        minWidth: 0,
                    }}
                />
                <button
                    type="submit"
                    style={{
                        background: "var(--color-primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        padding: "0.5rem 1rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    {t("searchButton")}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="search-form-wrapper">
            <div className={`search-form ${compact ? "compact" : ""}`}>
                {/* Main Search Row */}
                <div className="search-row">
                    {/* Location */}
                    <div className="search-field search-field-location">
                        <span className="search-field-icon"><FiMapPin size={20} /></span>
                        <div className="search-field-content">
                            <label className="search-field-label">{t("city")}</label>
                            <input
                                type="text"
                                className="search-field-input"
                                placeholder={t("locationPlaceholder")}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        {/* Near Me Button */}
                        <button
                            type="button"
                            onClick={handleNearMe}
                            disabled={nearMeLoading}
                            className="near-me-btn"
                        >
                            <FiCrosshair size={14} />
                            <span>{nearMeLoading ? t("detecting") || "Detecting..." : t("nearMe") || "Near Me"}</span>
                        </button>
                    </div>

                    <div className="search-divider" />

                    {/* Check-in */}
                    <div className="search-field">
                        <span className="search-field-icon"><FiCalendar size={20} /></span>
                        <div className="search-field-content">
                            <label className="search-field-label">{t("checkIn")}</label>
                            <input
                                type="date"
                                className="search-field-input"
                                value={checkIn}
                                min={today}
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="search-divider" />

                    {/* Check-out */}
                    <div className="search-field">
                        <span className="search-field-icon"><FiCalendar size={20} /></span>
                        <div className="search-field-content">
                            <label className="search-field-label">{t("checkOut")}</label>
                            <input
                                type="date"
                                className="search-field-input"
                                value={checkOut}
                                min={checkIn || today}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="search-divider" />

                    {/* Guests */}
                    <div className="search-field search-field-guests">
                        <span className="search-field-icon"><FiUser size={20} /></span>
                        <div className="search-field-content">
                            <label className="search-field-label">{t("guests")}</label>
                            <select
                                className="search-field-input"
                                value={guests}
                                onChange={(e) => setGuests(Number(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <option key={n} value={n}>
                                        {n} {t("guest")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button type="submit" className="search-btn">
                        <span className="search-btn-text">{t("searchButton")}</span>
                    </button>
                </div>
            </div>

            {/* Styles are now handled in globals.css under .search-form classes for premium theme */}
        </form>
    );
}
