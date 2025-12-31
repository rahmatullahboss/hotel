"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiMapPin, FiCalendar, FiUsers, FiSearch, FiCrosshair } from "react-icons/fi";

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
    const [nearMeLoading, setNearMeLoading] = useState(false);

    // Near Me handler
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
            checkIn: checkIn || today,
            checkOut: checkOut || tomorrow,
            guests: guests.toString(),
        });
        router.push(`/hotels?${params.toString()}`);
    };

    if (compact) {
        return (
            <form onSubmit={handleSubmit} className="luxstay-search-compact">
                <FiSearch className="luxstay-search-compact-icon" />
                <input
                    type="text"
                    placeholder={t("locationPlaceholder")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="luxstay-search-compact-input"
                />
                <button type="submit" className="luxstay-search-compact-btn">
                    {t("searchButton")}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="luxstay-search-form">
            {/* Destination */}
            <div className="luxstay-search-field">
                <label className="luxstay-search-label">{t("city") || "Destination"}</label>
                <div className="luxstay-search-input-group">
                    <div className="luxstay-search-icon">
                        <FiMapPin size={20} />
                    </div>
                    <input
                        type="text"
                        className="luxstay-search-input"
                        placeholder={t("locationPlaceholder") || "Where do you want to stay?"}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </div>
            </div>

            {/* Check In & Check Out */}
            <div className="luxstay-search-dates">
                <div className="luxstay-search-field">
                    <label className="luxstay-search-label">{t("checkIn") || "Check In"}</label>
                    <div className="luxstay-search-input-group">
                        <div className="luxstay-search-icon">
                            <FiCalendar size={20} />
                        </div>
                        <input
                            type="date"
                            className="luxstay-search-input"
                            value={checkIn}
                            min={today}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                </div>

                <div className="luxstay-search-field">
                    <label className="luxstay-search-label">{t("checkOut") || "Check Out"}</label>
                    <div className="luxstay-search-input-group">
                        <div className="luxstay-search-icon">
                            <FiCalendar size={20} />
                        </div>
                        <input
                            type="date"
                            className="luxstay-search-input"
                            value={checkOut}
                            min={checkIn || today}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Guests */}
            <div className="luxstay-search-field">
                <label className="luxstay-search-label">{t("guests") || "Guests"}</label>
                <div className="luxstay-search-input-group">
                    <div className="luxstay-search-icon">
                        <FiUsers size={20} />
                    </div>
                    <select
                        className="luxstay-search-input luxstay-search-select"
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
            <button type="submit" className="luxstay-search-btn">
                <FiSearch size={20} />
                <span>{t("searchButton") || "Search Availability"}</span>
            </button>

            {/* Near Me Button - Mobile Only */}
            <button
                type="button"
                onClick={handleNearMe}
                disabled={nearMeLoading}
                className="luxstay-nearme-btn"
            >
                <FiCrosshair size={16} />
                <span>{nearMeLoading ? t("detecting") || "Detecting..." : t("nearMe") || "Near Me"}</span>
            </button>

            <style jsx>{`
                .luxstay-search-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .luxstay-search-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                }

                .luxstay-search-label {
                    font-size: 0.6875rem;
                    font-weight: 700;
                    color: #0369a1;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-left: 0.25rem;
                }

                .luxstay-search-input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .luxstay-search-icon {
                    position: absolute;
                    left: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #0ea5e9;
                    pointer-events: none;
                    transition: color 0.2s;
                }

                .luxstay-search-input-group:focus-within .luxstay-search-icon {
                    color: #D4AF37;
                }

                .luxstay-search-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    background: #f0f9ff;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    color: #0c4a6e;
                    outline: none;
                    box-shadow: inset 0 0 0 1px #e0f2fe;
                    transition: all 0.2s;
                }

                .luxstay-search-input::placeholder {
                    color: #9ca3af;
                    font-weight: 400;
                }

                .luxstay-search-input:focus {
                    background: white;
                    box-shadow: inset 0 0 0 2px #0ea5e9;
                }

                .luxstay-search-select {
                    cursor: pointer;
                    appearance: none;
                    -webkit-appearance: none;
                }

                .luxstay-search-dates {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .luxstay-search-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 1rem;
                    background: #0ea5e9;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
                    margin-top: 0.5rem;
                }

                .luxstay-search-btn:hover {
                    background: #0284c7;
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(14, 165, 233, 0.4);
                }

                .luxstay-search-btn:active {
                    transform: scale(0.98);
                }

                .luxstay-nearme-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .luxstay-nearme-btn:hover {
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                }

                .luxstay-nearme-btn:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                }

                /* Compact Search */
                .luxstay-search-compact {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: white;
                    border-radius: 0.5rem;
                    border: 1px solid #e0f2fe;
                }

                .luxstay-search-compact-icon {
                    color: #0ea5e9;
                    flex-shrink: 0;
                }

                .luxstay-search-compact-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 0.875rem;
                    background: transparent;
                }

                .luxstay-search-compact-btn {
                    padding: 0.5rem 1rem;
                    background: #0ea5e9;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                }

                @media (min-width: 640px) {
                    .luxstay-nearme-btn {
                        display: none;
                    }
                }
            `}</style>
        </form>
    );
}
