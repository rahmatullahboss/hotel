"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { type PartnerHotelWithStats, switchHotel } from "../actions/dashboard";
import { FiChevronDown, FiCheck, FiSearch, FiMapPin, FiHome } from "react-icons/fi";

// Base type for what HotelSwitcher actually uses from currentHotel
type BaseHotel = {
    id: string;
    name: string;
    city: string | null;
    status: string;
    occupancyRate?: number;
};

interface HotelSwitcherProps {
    currentHotel: BaseHotel;
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

    const getOccupancyColor = (rate: number) => {
        if (rate >= 80) return "#10b981";
        if (rate >= 50) return "#f59e0b";
        return "#6b7280";
    };

    const getStatusColor = (status: string) => {
        if (status === "ACTIVE") return "#10b981";
        if (status === "PENDING") return "#f59e0b";
        return "#ef4444";
    };

    const buttonStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: isOpen ? '#f8fafc' : 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s'
    };

    if (hotels.length <= 1) {
        return (
            <div style={buttonStyle}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <FiHome size={16} />
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{currentHotel.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMapPin size={12} /> {currentHotel.city}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                style={buttonStyle}
            >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                    <FiHome size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {currentHotel.name}
                        <FiChevronDown size={14} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {currentHotel.city}
                    </div>
                </div>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '320px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb',
                    zIndex: 100,
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', marginBottom: '12px' }}>
                            Switch Property ({hotels.length})
                        </div>
                        {hotels.length > 3 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}>
                                <FiSearch size={14} color="#9ca3af" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search hotels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', flex: 1 }}
                                />
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                        {Object.keys(hotelsByCity).length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No hotels found</div>
                        ) : (
                            Object.entries(hotelsByCity).map(([city, cityHotels]) => (
                                <div key={city} style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <FiMapPin size={12} /> {city} ({cityHotels.length})
                                    </div>

                                    {cityHotels.map((hotel) => {
                                        const isActive = hotel.id === currentHotel.id;
                                        return (
                                            <button
                                                key={hotel.id}
                                                onClick={() => handleSwitch(hotel.id)}
                                                disabled={isPending}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    background: isActive ? '#eef2ff' : 'transparent',
                                                    cursor: isPending ? 'wait' : 'pointer',
                                                    textAlign: 'left',
                                                    marginBottom: '4px',
                                                    transition: 'background 0.15s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: isActive ? '#4f46e5' : '#f3f4f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: isActive ? 'white' : '#6b7280',
                                                    flexShrink: 0
                                                }}>
                                                    {isActive ? <FiCheck size={14} /> : <FiHome size={14} />}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b', marginBottom: '2px' }}>
                                                        {hotel.name}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                                        <span style={{ color: getStatusColor(hotel.status) }}>{hotel.status}</span>
                                                        <span style={{ color: '#d1d5db' }}>•</span>
                                                        <span style={{ color: '#64748b' }}>{hotel.totalRooms} rooms</span>
                                                        <span style={{ color: '#d1d5db' }}>•</span>
                                                        <span style={{ color: getOccupancyColor(hotel.occupancyRate) }}>{hotel.occupancyRate}% Occ</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                        <a
                            href="/register-hotel"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '10px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                color: '#4f46e5',
                                fontWeight: '600',
                                fontSize: '14px',
                                textDecoration: 'none',
                                border: '1px dashed #c7d2fe'
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
