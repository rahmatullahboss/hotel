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
        if (rate >= 80) return "text-green-600";
        if (rate >= 50) return "text-yellow-600";
        return "text-gray-500";
    };

    const getStatusClass = (status: string) => {
        if (status === "ACTIVE") return "text-green-600";
        if (status === "PENDING") return "text-yellow-600";
        return "text-red-600";
    };

    if (hotels.length <= 1) {
        return (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white">
                    <FiHome size={18} />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-none">{currentHotel.name}</h1>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiMapPin size={10} />
                        {currentHotel.city} • <span className={getOccupancyClass(currentHotel.occupancyRate)}>{currentHotel.occupancyRate}% Occ</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors min-w-[220px] text-left ${isOpen ? "bg-gray-50 border-gray-300" : "bg-transparent border-gray-200 hover:bg-gray-50"
                    }`}
            >
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white flex-shrink-0">
                    <FiHome size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate max-w-[140px]">
                            {currentHotel.name}
                        </span>
                        <FiChevronDown
                            className={`ml-2 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            size={14}
                        />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        {currentHotel.city} • <span className={getOccupancyClass(currentHotel.occupancyRate)}>{currentHotel.occupancyRate}% Occ</span>
                    </p>
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Switch Property ({hotels.length})
                        </p>
                        {hotels.length > 3 && (
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* Hotels list */}
                    <div className="max-h-[350px] overflow-y-auto">
                        {Object.keys(hotelsByCity).length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                No hotels found
                            </div>
                        ) : (
                            Object.entries(hotelsByCity).map(([city, cityHotels]) => (
                                <div key={city}>
                                    {/* City header */}
                                    <div className="px-4 py-2 bg-gray-50 border-y border-gray-100 sticky top-0">
                                        <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                            <FiMapPin size={10} /> {city} ({cityHotels.length})
                                        </span>
                                    </div>

                                    {/* Hotels */}
                                    {cityHotels.map((hotel) => (
                                        <button
                                            key={hotel.id}
                                            onClick={() => handleSwitch(hotel.id)}
                                            disabled={isPending}
                                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${hotel.id === currentHotel.id ? "bg-blue-50/50" : ""
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${hotel.id === currentHotel.id
                                                    ? "bg-[var(--color-primary)] text-white"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {hotel.id === currentHotel.id ? <FiCheck size={14} /> : <FiHome size={14} />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm truncate ${hotel.id === currentHotel.id ? "text-[var(--color-primary)]" : "text-gray-900"
                                                    }`}>
                                                    {hotel.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] mt-0.5">
                                                    <span className={`font-medium ${getStatusClass(hotel.status)}`}>
                                                        {hotel.status}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span className="text-gray-500">
                                                        {hotel.totalRooms} rooms
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
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

                    {/* Add new property */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <a
                            href="/register-hotel"
                            className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-[var(--color-primary)] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            + Add New Property
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
