"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { type PartnerHotelWithStats, switchHotel } from "../actions/dashboard";
import { FaChevronDown, FaHotel, FaBuilding, FaCheck, FaSearch } from "react-icons/fa";

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
    const { filteredHotels, hotelsByCity } = useMemo(() => {
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
        if (rate >= 80) return "text-emerald-600";
        if (rate >= 50) return "text-yellow-600";
        return "text-gray-500";
    };

    if (hotels.length <= 1) {
        // If only one hotel, just show the name with occupancy
        return (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                    <FaHotel />
                </div>
                <div>
                    <h1 className="text-lg font-bold leading-none text-gray-900">{currentHotel.name}</h1>
                    <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                            <FaBuilding className="text-[10px]" /> {currentHotel.city}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className={getOccupancyColor(currentHotel.occupancyRate)}>
                            {currentHotel.occupancyRate}% занято
                        </span>
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
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 text-left min-w-[240px] group"
            >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                    <FaHotel />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-gray-900 leading-tight flex items-center justify-between">
                        <span className="truncate max-w-[160px]">{currentHotel.name}</span>
                        <FaChevronDown className={`text-xs ml-2 text-gray-400 transition-transform group-hover:text-gray-600 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1.5">
                        {currentHotel.city} •
                        <span className={getOccupancyColor(currentHotel.occupancyRate)}>
                            {currentHotel.occupancyRate}% Occ
                        </span>
                    </p>
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header with search */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Switch Property ({hotels.length})
                        </p>
                        {hotels.length > 3 && (
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        )}
                    </div>

                    {/* Hotels list grouped by city */}
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
                                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            📍 {city} ({cityHotels.length})
                                        </span>
                                    </div>

                                    {/* Hotels in this city */}
                                    {cityHotels.map((hotel) => (
                                        <button
                                            key={hotel.id}
                                            onClick={() => handleSwitch(hotel.id)}
                                            disabled={isPending}
                                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${hotel.id === currentHotel.id ? "bg-blue-50/60" : ""
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${hotel.id === currentHotel.id
                                                    ? "bg-primary text-white shadow-md"
                                                    : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {hotel.id === currentHotel.id ? <FaCheck /> : <FaBuilding />}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm truncate ${hotel.id === currentHotel.id ? "text-primary" : "text-gray-900"
                                                    }`}>
                                                    {hotel.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                                    <span className={`font-medium ${hotel.status === 'ACTIVE' ? "text-emerald-600" :
                                                            hotel.status === 'PENDING' ? "text-yellow-600" : "text-red-600"
                                                        }`}>
                                                        {hotel.status}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className="text-gray-500">
                                                        {hotel.totalRooms} rooms
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className={getOccupancyColor(hotel.occupancyRate)}>
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
                    <div className="p-2 border-t border-gray-100 bg-gray-50">
                        <a
                            href="/register-hotel"
                            className="flex items-center justify-center px-4 py-2 text-xs font-semibold text-primary hover:text-white bg-white hover:bg-primary border border-gray-200 hover:border-primary rounded-lg transition-all duration-200 shadow-sm"
                        >
                            + Add New Property
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
