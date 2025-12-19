"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { type PartnerHotelWithStats, switchHotel } from "../actions/dashboard";
import { FiChevronDown, FiCheck, FiSearch, FiMapPin, FiHome } from "react-icons/fi";

interface HotelSwitcherProps {
    currentHotel: PartnerHotelWithStats;
    hotels: PartnerHotelWithStats[];
}

export function HotelSwitcher({ currentHotel, hotels }: HotelSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search when opening
    useEffect(() => {
        if (isOpen && searchInputRef.current && hotels.length > 3) {
            searchInputRef.current.focus();
        }
    }, [isOpen, hotels.length]);

    // Filter and group hotels by city
    const { hotelsByCity } = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = hotels.filter(
            (h) =>
                h.name.toLowerCase().includes(query) ||
                h.city.toLowerCase().includes(query)
        );

        // Group by city
        const grouped: Record<string, PartnerHotelWithStats[]> = {};
        for (const hotel of filtered) {
            if (!grouped[hotel.city]) {
                grouped[hotel.city] = [];
            }
            grouped[hotel.city]!.push(hotel);
        }

        return { filteredHotels: filtered, hotelsByCity: grouped };
    }, [hotels, searchQuery]);

    const handleSwitch = async (hotelId: string) => {
        if (hotelId === currentHotel.id) {
            setIsOpen(false);
            return;
        }

        try {
            setIsPending(true);
            await switchHotel(hotelId);
            setIsOpen(false);
            setSearchQuery("");
        } catch (error) {
            console.error("Failed to switch hotel:", error);
            alert("Failed to switch hotel. Please try again.");
        } finally {
            setIsPending(false);
        }
    };

    // Helper to get occupancy color
    const getOccupancyColor = (rate: number) => {
        if (rate >= 80) return "#22c55e";
        if (rate >= 50) return "#f59e0b";
        return "#9ca3af";
    };

    const getStatusColor = (status: string) => {
        if (status === "ACTIVE") return "#22c55e";
        if (status === "PENDING") return "#f59e0b";
        return "#ef4444";
    };

    if (hotels.length <= 1) {
        // If only one hotel, just show the name with occupancy
        return (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                    }}
                >
                    <FiHome />
                </div>
                <div>
                    <h1 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>
                        {currentHotel.name}
                    </h1>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: 0 }}>
                        <FiMapPin style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                        {currentHotel.city} • {currentHotel.occupancyRate}% Occupied
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: isOpen ? "var(--color-bg-secondary)" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    minWidth: "220px",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        flexShrink: 0,
                    }}
                >
                    <FiHome size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "140px",
                            }}
                        >
                            {currentHotel.name}
                        </span>
                        <FiChevronDown
                            style={{
                                marginLeft: "0.5rem",
                                color: "var(--color-text-secondary)",
                                transition: "transform 0.2s",
                                transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                            }}
                        />
                    </div>
                    <p
                        style={{
                            fontSize: "0.7rem",
                            color: "var(--color-text-secondary)",
                            margin: 0,
                        }}
                    >
                        {currentHotel.city} •{" "}
                        <span style={{ color: getOccupancyColor(currentHotel.occupancyRate) }}>
                            {currentHotel.occupancyRate}% Occ
                        </span>
                    </p>
                </div>
            </button>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "0.5rem",
                        width: "320px",
                        backgroundColor: "white",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                        zIndex: 50,
                        overflow: "hidden",
                    }}
                >
                    {/* Header with search */}
                    <div
                        style={{
                            padding: "0.75rem 1rem",
                            borderBottom: "1px solid var(--color-border)",
                            backgroundColor: "var(--color-bg-secondary)",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                color: "var(--color-text-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: hotels.length > 3 ? "0.5rem" : 0,
                            }}
                        >
                            Switch Property ({hotels.length})
                        </p>
                        {hotels.length > 3 && (
                            <div style={{ position: "relative" }}>
                                <FiSearch
                                    style={{
                                        position: "absolute",
                                        left: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "var(--color-text-secondary)",
                                        fontSize: "0.875rem",
                                    }}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.5rem 0.75rem 0.5rem 2rem",
                                        fontSize: "0.875rem",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "0.5rem",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Hotels list grouped by city */}
                    <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {Object.keys(hotelsByCity).length === 0 ? (
                            <div
                                style={{
                                    padding: "1.5rem 1rem",
                                    textAlign: "center",
                                    fontSize: "0.875rem",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                No hotels found
                            </div>
                        ) : (
                            Object.entries(hotelsByCity).map(([city, cityHotels]) => (
                                <div key={city}>
                                    {/* City header */}
                                    <div
                                        style={{
                                            padding: "0.5rem 1rem",
                                            backgroundColor: "var(--color-bg-secondary)",
                                            borderBottom: "1px solid var(--color-border)",
                                            position: "sticky",
                                            top: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                                color: "var(--color-text-secondary)",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <FiMapPin style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
                                            {city} ({cityHotels.length})
                                        </span>
                                    </div>

                                    {/* Hotels in this city */}
                                    {cityHotels.map((hotel) => (
                                        <button
                                            key={hotel.id}
                                            onClick={() => handleSwitch(hotel.id)}
                                            disabled={isPending}
                                            style={{
                                                width: "100%",
                                                padding: "0.75rem 1rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.75rem",
                                                textAlign: "left",
                                                border: "none",
                                                borderBottom: "1px solid var(--color-border)",
                                                backgroundColor:
                                                    hotel.id === currentHotel.id
                                                        ? "rgba(230, 57, 70, 0.05)"
                                                        : "transparent",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "0.875rem",
                                                    backgroundColor:
                                                        hotel.id === currentHotel.id
                                                            ? "var(--color-primary)"
                                                            : "var(--color-bg-secondary)",
                                                    color:
                                                        hotel.id === currentHotel.id
                                                            ? "white"
                                                            : "var(--color-text-secondary)",
                                                }}
                                            >
                                                {hotel.id === currentHotel.id ? (
                                                    <FiCheck />
                                                ) : (
                                                    <FiHome />
                                                )}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: "0.875rem",
                                                        color:
                                                            hotel.id === currentHotel.id
                                                                ? "var(--color-primary)"
                                                                : "inherit",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {hotel.name}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                        fontSize: "0.7rem",
                                                        marginTop: "0.125rem",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: 500,
                                                            color: getStatusColor(hotel.status),
                                                        }}
                                                    >
                                                        {hotel.status}
                                                    </span>
                                                    <span
                                                        style={{
                                                            width: "3px",
                                                            height: "3px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "var(--color-border)",
                                                        }}
                                                    />
                                                    <span style={{ color: "var(--color-text-secondary)" }}>
                                                        {hotel.totalRooms} rooms
                                                    </span>
                                                    <span
                                                        style={{
                                                            width: "3px",
                                                            height: "3px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "var(--color-border)",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            color: getOccupancyColor(hotel.occupancyRate),
                                                        }}
                                                    >
                                                        {hotel.occupancyRate}% Occ
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add new hotel link */}
                    <div
                        style={{
                            padding: "0.5rem",
                            borderTop: "1px solid var(--color-border)",
                            backgroundColor: "var(--color-bg-secondary)",
                        }}
                    >
                        <a
                            href="/register-hotel"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "0.5rem 1rem",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--color-primary)",
                                backgroundColor: "white",
                                border: "1px solid var(--color-border)",
                                borderRadius: "0.5rem",
                                textDecoration: "none",
                            }}
                        >
                            + Add New Property
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
