"use client";

import { useTranslations } from "next-intl";
import { FiShield, FiPhone, FiWifi, FiCheckCircle } from "react-icons/fi";
import { MdCleanHands, MdVerified } from "react-icons/md";

interface HotelHighlightsProps {
    payAtHotelEnabled?: boolean;
    isVerified?: boolean;
}

const HIGHLIGHTS = [
    { key: "sanitized", icon: <MdCleanHands size={20} />, color: "#22c55e" },
    { key: "support24x7", icon: <FiPhone size={20} />, color: "#3b82f6" },
    { key: "freeWifi", icon: <FiWifi size={20} />, color: "#8b5cf6" },
    { key: "secureBooking", icon: <FiShield size={20} />, color: "#f59e0b" },
];

export function HotelHighlights({ payAtHotelEnabled, isVerified }: HotelHighlightsProps) {
    const t = useTranslations("hotelDetail");

    return (
        <div className="hotel-highlights">
            {/* Verified Badge */}
            {isVerified && (
                <div className="highlight-badge verified">
                    <MdVerified size={18} />
                    <span>Zinu Verified</span>
                </div>
            )}

            {/* Pay at Hotel Badge */}
            {payAtHotelEnabled && (
                <div className="highlight-badge pay-hotel">
                    <FiCheckCircle size={18} />
                    <span>{t("payAtHotel")}</span>
                </div>
            )}

            {/* Trust Highlights */}
            {HIGHLIGHTS.map(({ key, icon, color }) => (
                <div
                    key={key}
                    className="highlight-item"
                    style={{ "--highlight-color": color } as React.CSSProperties}
                >
                    <span className="highlight-icon">{icon}</span>
                    <span className="highlight-text">{t(`highlights.${key}`)}</span>
                </div>
            ))}
        </div>
    );
}
