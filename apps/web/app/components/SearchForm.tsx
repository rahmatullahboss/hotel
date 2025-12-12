"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams({
            city: city || "Dhaka",
            checkIn: checkIn || new Date().toISOString().split("T")[0]!,
            checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0]!,
            guests: guests.toString(),
        });
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
        <form onSubmit={handleSubmit} className="search-form">
            <div className="form-group">
                <label htmlFor="city" className="form-label">
                    {t("city")}
                </label>
                <input
                    id="city"
                    type="text"
                    className="form-input"
                    placeholder={t("location")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                    <label htmlFor="checkIn" className="form-label">
                        {t("checkIn")}
                    </label>
                    <input
                        id="checkIn"
                        type="date"
                        className="form-input"
                        value={checkIn}
                        min={today}
                        onChange={(e) => setCheckIn(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="checkOut" className="form-label">
                        {t("checkOut")}
                    </label>
                    <input
                        id="checkOut"
                        type="date"
                        className="form-input"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => setCheckOut(e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="guests" className="form-label">
                    {t("guests")}
                </label>
                <select
                    id="guests"
                    className="form-input"
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

            <button type="submit" className="btn btn-primary btn-block btn-lg">
                {t("searchButton")}
            </button>
        </form>
    );
}
