"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiUsers, FiChevronDown, FiPlus, FiMinus, FiCalendar } from "react-icons/fi";

interface Room {
    id: string;
    name: string;
    dynamicPrice?: number;
    basePrice: number | string;
}

interface OYOBookingSidebarProps {
    hotelName?: string;
    roomName: string;
    basePrice: number;
    dynamicPrice: number;
    totalPrice: number;
    nights?: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms?: number;
    isSelected: boolean;
    availableRooms?: Room[];
    onCheckInChange: (date: string) => void;
    onCheckOutChange: (date: string) => void;
    onGuestsChange: (guests: number) => void;
    onRoomsChange?: (rooms: number) => void;
    onRoomSelect?: (roomId: string) => void;
    onBookNow: () => void;
}

export function OYOBookingSidebar({
    roomName,
    basePrice,
    dynamicPrice,
    totalPrice,
    checkIn,
    checkOut,
    guests,
    rooms = 1,
    isSelected,
    availableRooms = [],
    onCheckInChange,
    onCheckOutChange,
    onGuestsChange,
    onRoomsChange,
    onRoomSelect,
    onBookNow,
}: OYOBookingSidebarProps) {
    const t = useTranslations("hotelDetail");
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);
    const [localGuests, setLocalGuests] = useState(guests);
    const [localRooms, setLocalRooms] = useState(rooms);
    
    const guestDropdownRef = useRef<HTMLDivElement>(null);
    const roomDropdownRef = useRef<HTMLDivElement>(null);

    const today = new Date().toISOString().split("T")[0];
    const discount = basePrice > dynamicPrice ? Math.round(((basePrice - dynamicPrice) / basePrice) * 100) : 0;
    const savings = basePrice - dynamicPrice;
    const taxesAndFees = Math.round(totalPrice * 0.15);

    // Handle click outside to close dropdowns
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
                setShowGuestDropdown(false);
            }
            if (roomDropdownRef.current && !roomDropdownRef.current.contains(event.target as Node)) {
                setShowRoomDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    };

    // Guest counter handlers
    const incrementGuests = () => {
        if (localGuests < 10) {
            setLocalGuests(localGuests + 1);
            onGuestsChange(localGuests + 1);
        }
    };

    const decrementGuests = () => {
        if (localGuests > 1) {
            setLocalGuests(localGuests - 1);
            onGuestsChange(localGuests - 1);
        }
    };

    // Room counter handlers
    const incrementRooms = () => {
        if (localRooms < 5) {
            setLocalRooms(localRooms + 1);
            onRoomsChange?.(localRooms + 1);
        }
    };

    const decrementRooms = () => {
        if (localRooms > 1) {
            setLocalRooms(localRooms - 1);
            onRoomsChange?.(localRooms - 1);
        }
    };

    return (
        <div className="oyo-booking-sidebar">
            {/* Price Section */}
            <div className="oyo-price-section">
                <div className="oyo-price-main">
                    <span className="oyo-price">৳{dynamicPrice.toLocaleString()}</span>
                    {discount > 0 && (
                        <>
                            <span className="oyo-price-original">৳{basePrice.toLocaleString()}</span>
                            <span className="oyo-discount-badge">{discount}% {t("sidebar.off")}</span>
                        </>
                    )}
                </div>
                <div className="oyo-taxes">+ {t("sidebar.taxesAndFees")}: ৳{taxesAndFees}</div>
            </div>

            {/* Date Picker Section */}
            <div className="oyo-date-picker">
                <div className="oyo-date-row">
                    <div className="oyo-date-item">
                        <label className="oyo-date-box">
                            <FiCalendar size={14} className="oyo-date-icon" />
                            <input
                                type="date"
                                value={checkIn}
                                min={today}
                                onChange={(e) => onCheckInChange(e.target.value)}
                                className="oyo-date-input-native"
                            />
                            <span className="oyo-date-label">{formatDate(checkIn)}</span>
                        </label>
                    </div>
                    <span className="oyo-date-separator">–</span>
                    <div className="oyo-date-item">
                        <label className="oyo-date-box">
                            <FiCalendar size={14} className="oyo-date-icon" />
                            <input
                                type="date"
                                value={checkOut}
                                min={checkIn || today}
                                onChange={(e) => onCheckOutChange(e.target.value)}
                                className="oyo-date-input-native"
                            />
                            <span className="oyo-date-label">{formatDate(checkOut)}</span>
                        </label>
                    </div>
                    
                    {/* Guest Selector Dropdown */}
                    <div className="oyo-guests-wrapper" ref={guestDropdownRef}>
                        <button 
                            className="oyo-guests-trigger"
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                        >
                            <FiUsers size={14} />
                            <span>{localRooms} রুম, {localGuests} অতিথি</span>
                            <FiChevronDown size={12} className={showGuestDropdown ? "rotated" : ""} />
                        </button>
                        
                        {showGuestDropdown && (
                            <div className="oyo-guests-dropdown">
                                <div className="oyo-guests-dropdown-header">
                                    রুম ও অতিথি নির্বাচন করুন
                                </div>
                                
                                {/* Rooms Counter */}
                                <div className="oyo-counter-row">
                                    <div className="oyo-counter-label">
                                        <span className="oyo-counter-title">রুম</span>
                                        <span className="oyo-counter-subtitle">সংখ্যা</span>
                                    </div>
                                    <div className="oyo-counter-controls">
                                        <button 
                                            className="oyo-counter-btn"
                                            onClick={decrementRooms}
                                            disabled={localRooms <= 1}
                                        >
                                            <FiMinus size={14} />
                                        </button>
                                        <span className="oyo-counter-value">{localRooms}</span>
                                        <button 
                                            className="oyo-counter-btn"
                                            onClick={incrementRooms}
                                            disabled={localRooms >= 5}
                                        >
                                            <FiPlus size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Guests Counter */}
                                <div className="oyo-counter-row">
                                    <div className="oyo-counter-label">
                                        <span className="oyo-counter-title">অতিথি</span>
                                        <span className="oyo-counter-subtitle">প্রাপ্তবয়স্ক ও শিশু</span>
                                    </div>
                                    <div className="oyo-counter-controls">
                                        <button 
                                            className="oyo-counter-btn"
                                            onClick={decrementGuests}
                                            disabled={localGuests <= 1}
                                        >
                                            <FiMinus size={14} />
                                        </button>
                                        <span className="oyo-counter-value">{localGuests}</span>
                                        <button 
                                            className="oyo-counter-btn"
                                            onClick={incrementGuests}
                                            disabled={localGuests >= 10}
                                        >
                                            <FiPlus size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <button 
                                    className="oyo-apply-btn"
                                    onClick={() => setShowGuestDropdown(false)}
                                >
                                    প্রয়োগ করুন
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Room Selector */}
            <div className="oyo-room-selector-wrapper" ref={roomDropdownRef}>
                <button 
                    className="oyo-room-selector"
                    onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                >
                    <div className="oyo-room-icon">🛏️</div>
                    <div className="oyo-room-name">{roomName || "রুম নির্বাচন করুন"}</div>
                    <FiChevronDown size={16} className={showRoomDropdown ? "rotated" : ""} />
                </button>
                
                {showRoomDropdown && availableRooms.length > 0 && (
                    <div className="oyo-room-dropdown">
                        {availableRooms.map((room) => (
                            <button
                                key={room.id}
                                className={`oyo-room-option ${roomName === room.name ? 'selected' : ''}`}
                                onClick={() => {
                                    onRoomSelect?.(room.id);
                                    setShowRoomDropdown(false);
                                }}
                            >
                                <span className="oyo-room-option-name">{room.name}</span>
                                <span className="oyo-room-option-price">
                                    ৳{(room.dynamicPrice ?? Number(room.basePrice)).toLocaleString()}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Savings & Total */}
            {savings > 0 && (
                <div className="oyo-summary">
                    <div className="oyo-summary-row">
                        <span>{t("sidebar.yourSavings")}</span>
                        <span className="oyo-savings">৳{savings.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <div className="oyo-summary">
                <div className="oyo-summary-row oyo-total-row">
                    <span>{t("sidebar.totalPrice")}</span>
                    <span className="oyo-total">৳{totalPrice.toLocaleString()}</span>
                </div>
                <div className="oyo-taxes-note">{t("sidebar.includingTaxes")} ⓘ</div>
            </div>

            {/* Book Now Button */}
            <button className="oyo-book-btn" onClick={onBookNow} disabled={!isSelected}>
                {t("sidebar.continueToBook")}
            </button>

            {/* Policy Links */}
            <div className="oyo-policy-links">
                <div className="oyo-terms">
                    {t("sidebar.agreeToTerms")} <a href="/terms">{t("sidebar.guestPolicies")}</a>.
                </div>
            </div>
        </div>
    );
}
