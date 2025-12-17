"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiUsers, FiShield, FiChevronDown } from "react-icons/fi";

interface OYOBookingSidebarProps {
    hotelName: string;
    roomName: string;
    basePrice: number;
    dynamicPrice: number;
    totalPrice: number;
    nights: number;
    checkIn: string;
    checkOut: string;
    guests: number;
    isSelected: boolean;
    onCheckInChange: (date: string) => void;
    onCheckOutChange: (date: string) => void;
    onGuestsChange: (guests: number) => void;
    onBookNow: () => void;
}

export function OYOBookingSidebar({
    hotelName,
    roomName,
    basePrice,
    dynamicPrice,
    totalPrice,
    nights,
    checkIn,
    checkOut,
    guests,
    isSelected,
    onCheckInChange,
    onCheckOutChange,
    onGuestsChange,
    onBookNow,
}: OYOBookingSidebarProps) {
    const t = useTranslations("hotelDetail");
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const discount = basePrice > dynamicPrice ? Math.round(((basePrice - dynamicPrice) / basePrice) * 100) : 0;
    const savings = basePrice - dynamicPrice;
    const taxesAndFees = Math.round(totalPrice * 0.15); // 15% tax

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
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

            {/* Date Picker */}
            <div className="oyo-date-picker">
                <div className="oyo-date-row">
                    <div className="oyo-date-item">
                        <input
                            type="date"
                            value={checkIn}
                            min={today}
                            onChange={(e) => onCheckInChange(e.target.value)}
                            className="oyo-date-input"
                        />
                        <span className="oyo-date-label">{formatDate(checkIn)}</span>
                    </div>
                    <span className="oyo-date-separator">–</span>
                    <div className="oyo-date-item">
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn || today}
                            onChange={(e) => onCheckOutChange(e.target.value)}
                            className="oyo-date-input"
                        />
                        <span className="oyo-date-label">{formatDate(checkOut)}</span>
                    </div>
                    <div className="oyo-guests-item">
                        <FiUsers size={14} />
                        <span>{t("sidebar.roomGuest", { rooms: 1, guests: guests })}</span>
                    </div>
                </div>
            </div>

            {/* Room Selector */}
            <div className="oyo-room-selector" onClick={() => setShowRoomDropdown(!showRoomDropdown)}>
                <div className="oyo-room-icon">🛏️</div>
                <div className="oyo-room-name">{roomName || "Room"}</div>
                <FiChevronDown size={16} className={showRoomDropdown ? "rotated" : ""} />
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
