"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiMapPin, FiCalendar, FiUser } from "react-icons/fi";

interface SearchFormProps {
    compact?: boolean;
}

export function SearchForm({ compact = false }: SearchFormProps) {
    const router = useRouter();
    const t = useTranslations("search");
    const [city, setCity] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");

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

    const today = new Date().toISOString().split("T")[0];

    if (compact) {
        return (
            <button
                onClick={() => router.push("/hotels")}
                className="search-form"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                    border: "none",
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ width: "24px", height: "24px", color: "var(--color-primary)" }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
                <div>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {t("whereTo")}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        {t("searchHotels")}
                    </div>
                </div>
            </button>
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

            {/* Styles are handled in global CSS or scoped here if preferred, but for now we follow existing patterns */}
            <style jsx>{`
               .search-form-wrapper {
                   position: relative;
                   z-index: 20;
                   max-width: 1000px;
                   margin: 0 auto;
               }

               .search-form {
                   background: white;
                   padding: 0.5rem;
                   border-radius: 8px; /* Slightly squarer for professional look */
                   box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                   border: 1px solid #e0e0e0;
               }

               .search-row {
                   display: flex;
                   align-items: center;
               }

               .search-field {
                   flex: 1;
                   padding: 0.75rem 1rem;
                   display: flex;
                   align-items: center;
                   gap: 1rem;
                   position: relative;
               }
               
               .search-field:hover {
                   background-color: #f8f9fa;
                   border-radius: 4px;
               }

               .search-field-icon {
                   color: #666;
               }

               .search-field-content {
                   display: flex;
                   flex-direction: column;
                   width: 100%;
               }

               .search-field-label {
                   font-size: 0.75rem;
                   font-weight: 700;
                   text-transform: uppercase;
                   color: #333;
                   margin-bottom: 2px;
               }

               .search-field-input {
                   border: none;
                   outline: none;
                   width: 100%;
                   font-size: 0.95rem;
                   color: #333;
                   font-weight: 500;
                   background: transparent;
                   padding: 0;
               }

               .search-divider {
                   width: 1px;
                   height: 32px;
                   background-color: #ddd;
               }
               
               .search-field-guests {
                   flex: 0.8;
               }

               .search-btn {
                   background: #1ab64f; /* OYO-like Green or Primary Red */
                   color: white;
                   border: none;
                   padding: 0 2rem;
                   height: 60px;
                   font-weight: 700;
                   font-size: 1.1rem;
                   cursor: pointer;
                   border-radius: 0 4px 4px 0;
                   margin: -0.5rem -0.5rem -0.5rem 0;
                   transition: background 0.2s;
               }
               
               /* Override for specific branding color if needed, else stick to green/red */
               .search-btn {
                   background: var(--color-primary, #E63946);
                   border-radius: 4px;
                   margin-left: 0.5rem; /* Separate button style */
                   height: 56px;
                   margin-right: 0;
                   border-top-left-radius: 4px;
                   border-bottom-left-radius: 4px;
               }

               .search-btn:hover {
                   filter: brightness(1.1);
               }

               @media (max-width: 768px) {
                   .search-row {
                       flex-direction: column;
                       align-items: stretch;
                   }
                   
                   .search-divider {
                       display: none;
                   }

                   .search-field {
                       border-bottom: 1px solid #f0f0f0;
                   }

                   .search-btn {
                       width: 100%;
                       margin: 0.5rem 0 0 0;
                       border-radius: 4px;
                   }
               }
            `}</style>
        </form>
    );
}
