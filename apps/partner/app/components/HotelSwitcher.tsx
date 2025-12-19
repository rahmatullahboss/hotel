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

    useEffect(() => {
        if (isOpen && searchInputRef.current && hotels.length > 3) {
            searchInputRef.current.focus();
        }
    }, [isOpen, hotels.length]);

    const { hotelsByCity } = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = hotels.filter(
            (h) =>
                h.name.toLowerCase().includes(query) ||
                h.city.toLowerCase().includes(query)
        );

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

    const getOccupancyClass = (rate: number) => {
        if (rate >= 80) return "text-success";
        if (rate >= 50) return "text-warning";
        return "text-muted";
    };

    const getStatusClass = (status: string) => {
        if (status === "ACTIVE") return "text-success";
        if (status === "PENDING") return "text-warning";
        return "text-error";
    };

    if (hotels.length <= 1) {
        return (
            <div className="hotel-switcher-btn">
                <div className="hotel-switcher-icon">
                    <FiHome />
                </div>
                <div className="hotel-switcher-info">
                    <div className="hotel-switcher-name">
                        <span>{currentHotel.name}</span>
                    </div>
                    <div className="hotel-switcher-meta">
                        <FiMapPin /> {currentHotel.city} • <span className={getOccupancyClass(currentHotel.occupancyRate)}>{currentHotel.occupancyRate}% Occ</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hotel-switcher" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`hotel-switcher-btn ${isOpen ? "open" : ""}`}
            >
                <div className="hotel-switcher-icon">
                    <FiHome />
                </div>
                <div className="hotel-switcher-info">
                    <div className="hotel-switcher-name">
                        <span>{currentHotel.name}</span>
                        <FiChevronDown className={`hotel-switcher-chevron ${isOpen ? "open" : ""}`} />
                    </div>
                    <div className="hotel-switcher-meta">
                        {currentHotel.city} • <span className={getOccupancyClass(currentHotel.occupancyRate)}>{currentHotel.occupancyRate}% Occ</span>
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="hotel-switcher-dropdown">
                    <div className="hotel-switcher-header">
                        <div className="hotel-switcher-title">
                            Switch Property ({hotels.length})
                        </div>
                        {hotels.length > 3 && (
                            <div className="hotel-switcher-search">
                                <FiSearch />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="hotel-switcher-list">
                        {Object.keys(hotelsByCity).length === 0 ? (
                            <div className="hotel-switcher-city">No hotels found</div>
                        ) : (
                            Object.entries(hotelsByCity).map(([city, cityHotels]) => (
                                <div key={city}>
                                    <div className="hotel-switcher-city">
                                        <FiMapPin /> {city} ({cityHotels.length})
                                    </div>

                                    {cityHotels.map((hotel) => (
                                        <button
                                            key={hotel.id}
                                            onClick={() => handleSwitch(hotel.id)}
                                            disabled={isPending}
                                            className={`hotel-switcher-item ${hotel.id === currentHotel.id ? "active" : ""}`}
                                        >
                                            <div className="hotel-switcher-item-icon">
                                                {hotel.id === currentHotel.id ? <FiCheck /> : <FiHome />}
                                            </div>
                                            <div className="hotel-switcher-item-info">
                                                <div className="hotel-switcher-item-name">
                                                    {hotel.name}
                                                </div>
                                                <div className="hotel-switcher-item-details">
                                                    <span className={getStatusClass(hotel.status)}>
                                                        {hotel.status}
                                                    </span>
                                                    <span className="dot" />
                                                    <span>{hotel.totalRooms} rooms</span>
                                                    <span className="dot" />
                                                    <span className={getOccupancyClass(hotel.occupancyRate)}>
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

                    <div className="hotel-switcher-footer">
                        <a href="/register-hotel" className="hotel-switcher-add">
                            + Add New Property
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
