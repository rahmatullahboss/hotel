"use client";

import { useTranslations } from "next-intl";
import { FiCalendar, FiUsers } from "react-icons/fi";

interface DateGuestBarProps {
    checkIn: string;
    checkOut: string;
    guests?: number;
    onCheckInChange: (date: string) => void;
    onCheckOutChange: (date: string) => void;
    onGuestsChange?: (guests: number) => void;
}

export function DateGuestBar({
    checkIn,
    checkOut,
    guests = 2,
    onCheckInChange,
    onCheckOutChange,
    onGuestsChange,
}: DateGuestBarProps) {
    const t = useTranslations("search");
    const today = new Date().toISOString().split("T")[0];

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="date-guest-bar">
            <div className="date-guest-bar-inner">
                {/* Check-in */}
                <div className="date-guest-item">
                    <FiCalendar size={16} className="date-guest-icon" />
                    <div className="date-guest-content">
                        <span className="date-guest-label">{t("checkIn")}</span>
                        <input
                            type="date"
                            className="date-guest-input"
                            value={checkIn}
                            min={today}
                            onChange={(e) => {
                                onCheckInChange(e.target.value);
                                // Auto-adjust checkout if needed
                                if (e.target.value >= checkOut) {
                                    const nextDay = new Date(e.target.value);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    const nextDayStr = nextDay.toISOString().split("T")[0];
                                    if (nextDayStr) {
                                        onCheckOutChange(nextDayStr);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="date-guest-divider" />

                {/* Nights */}
                <div className="date-guest-nights">
                    <span className="nights-count">{nights}</span>
                    <span className="nights-label">{nights === 1 ? "Night" : "Nights"}</span>
                </div>

                <div className="date-guest-divider" />

                {/* Check-out */}
                <div className="date-guest-item">
                    <FiCalendar size={16} className="date-guest-icon" />
                    <div className="date-guest-content">
                        <span className="date-guest-label">{t("checkOut")}</span>
                        <input
                            type="date"
                            className="date-guest-input"
                            value={checkOut}
                            min={checkIn || today}
                            onChange={(e) => onCheckOutChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="date-guest-divider" />

                {/* Guests */}
                <div className="date-guest-item">
                    <FiUsers size={16} className="date-guest-icon" />
                    <div className="date-guest-content">
                        <span className="date-guest-label">Guests</span>
                        <select
                            className="date-guest-select"
                            value={guests}
                            onChange={(e) => onGuestsChange?.(Number(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
