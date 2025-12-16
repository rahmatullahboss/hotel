"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiCalendar, FiUsers, FiTag, FiZap, FiShield, FiChevronDown } from "react-icons/fi";
import { MdVerified } from "react-icons/md";

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
    bookingsCount?: number;
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
    bookingsCount = 2000,
    onCheckInChange,
    onCheckOutChange,
    onGuestsChange,
    onBookNow,
}: OYOBookingSidebarProps) {
    const t = useTranslations("hotelDetail");
    const tCommon = useTranslations("common");
    const [showRoomDropdown, setShowRoomDropdown] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const discount = basePrice > dynamicPrice ? Math.round(((basePrice - dynamicPrice) / basePrice) * 100) : 0;
    const savings = basePrice - dynamicPrice;
    const taxesAndFees = Math.round(totalPrice * 0.12); // 12% tax estimate

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
    };

    return (
        <div className="oyo-booking-sidebar">
            {/* Login Promo Banner */}
            <div className="oyo-promo-banner">
                <span className="promo-text">{t("sidebar.loginPromo")}</span>
                <button className="promo-btn">{t("sidebar.login")}</button>
            </div>

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
                <div className="oyo-room-name">{roomName || "Deluxe"}</div>
                <FiChevronDown size={16} className={showRoomDropdown ? "rotated" : ""} />
            </div>

            {/* Coupon Section */}
            <div className="oyo-coupon-section">
                <div className="oyo-coupon-applied">
                    <FiTag size={16} className="coupon-icon" />
                    <span className="coupon-text">WELCOME20 {t("sidebar.couponApplied")}</span>
                    <span className="coupon-discount">-৳{Math.round(savings * 0.1)}</span>
                    <MdVerified size={16} className="coupon-check" />
                </div>
                <button className="oyo-more-offers-btn">{t("sidebar.moreOffers")}</button>
            </div>

            {/* Savings & Total */}
            <div className="oyo-summary">
                <div className="oyo-summary-row">
                    <span>{t("sidebar.yourSavings")}</span>
                    <span className="oyo-savings">৳{savings.toLocaleString()}</span>
                </div>
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

            {/* Social Proof */}
            <div className="oyo-social-proof">
                <FiZap size={14} className="proof-icon" />
                <span>{t("sidebar.bookedCount", { count: bookingsCount.toLocaleString() })}</span>
            </div>

            {/* Policy Links */}
            <div className="oyo-policy-links">
                <a href="#" className="oyo-policy-link">
                    {t("sidebar.cancellationPolicy")} ⓘ
                </a>
                <div className="oyo-safety-note">
                    <FiShield size={14} />
                    <span>{t("sidebar.safetyMeasures")}</span>
                </div>
                <div className="oyo-terms">
                    {t("sidebar.agreeToTerms")} <a href="/terms">{t("sidebar.guestPolicies")}</a>.
                </div>
            </div>
        </div>
    );
}

