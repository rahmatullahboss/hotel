"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface RoomCardProps {
    room: {
        id: string;
        name: string;
        type: string;
        basePrice: string;
        dynamicPrice?: number;
        totalDynamicPrice?: number;
        nights?: number;
        maxGuests: number;
        description: string | null;
        photos: string[];
        amenities: string[];
        isAvailable: boolean;
        unavailableReason?: string;
        priceBreakdown?: {
            multiplier: number;
            rules: Array<{ name: string; description: string }>;
        };
    };
    isSelected: boolean;
    onSelect: () => void;
    onViewDetails: () => void;
}

// Amenity icons mapping
const amenityIcons: Record<string, string> = {
    "WiFi": "📶",
    "wifi": "📶",
    "AC": "❄️",
    "ac": "❄️",
    "Air Conditioning": "❄️",
    "TV": "📺",
    "tv": "📺",
    "Television": "📺",
    "Mini Bar": "🍾",
    "Minibar": "🍾",
    "Room Service": "🛎️",
    "Balcony": "🌅",
    "Sea View": "🌊",
    "City View": "🏙️",
    "Safe": "🔐",
    "Bathtub": "🛁",
    "Shower": "🚿",
    "Hair Dryer": "💨",
    "Iron": "👔",
    "Coffee Maker": "☕",
    "Breakfast": "🍳",
    "Parking": "🅿️",
    "Pool Access": "🏊",
    "Gym Access": "💪",
    "Spa Access": "🧖",
};

// Room type badges
const roomTypeBadges: Record<string, { label: string; color: string }> = {
    "SINGLE": { label: "Single", color: "#6366f1" },
    "DOUBLE": { label: "Double", color: "#22c55e" },
    "SUITE": { label: "Suite", color: "#f59e0b" },
    "DORMITORY": { label: "Dormitory", color: "#8b5cf6" },
};

export default function RoomCard({ room, isSelected, onSelect, onViewDetails }: RoomCardProps) {
    const t = useTranslations("roomCard");
    const tTypes = useTranslations("roomTypes");
    const [currentPhoto, setCurrentPhoto] = useState(0);

    const photos = room.photos.length > 0
        ? room.photos
        : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"];

    const isUnavailable = room.isAvailable === false;
    const badgeColor = roomTypeBadges[room.type]?.color || "#6b7280";
    // @ts-ignore
    const badgeLabel = tTypes.has(room.type) ? tTypes(room.type) : room.type;

    // Get top 3 amenities to show
    const displayAmenities = room.amenities.slice(0, 3);
    const remainingCount = room.amenities.length - 3;

    // Calculate display price
    const displayPrice = room.dynamicPrice ?? Number(room.basePrice);
    const basePrice = Number(room.basePrice);
    // Only show strikethrough when customer gets a DISCOUNT (not when price is higher)
    const showOriginalPrice = room.dynamicPrice && room.dynamicPrice < basePrice;

    return (
        <div
            className={`room-card ${isSelected ? "room-card-selected" : ""} ${isUnavailable ? "room-card-unavailable" : ""}`}
            onClick={() => !isUnavailable && onSelect()}
        >
            {/* Photo Section */}
            <div className="room-card-image-container">
                <img
                    src={photos[currentPhoto]}
                    alt={room.name}
                    className="room-card-image"
                />

                {/* Photo Navigation Dots */}
                {photos.length > 1 && (
                    <div className="room-carousel-dots">
                        {photos.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentPhoto(i);
                                }}
                                className={`room-carousel-dot ${i === currentPhoto ? "active" : ""}`}
                            />
                        ))}
                    </div>
                )}

                {/* Room Type Badge */}
                <span
                    className="room-type-badge"
                    style={{ backgroundColor: badgeColor }}
                >
                    {badgeLabel}
                </span>

                {/* Unavailable Overlay */}
                {isUnavailable && (
                    <div className="room-unavailable-overlay">
                        <span className="room-unavailable-badge">{t("booked")}</span>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="room-card-content">
                <div className="room-card-header">
                    <div>
                        <h3 className="room-card-title">{room.name}</h3>
                        <div className="room-card-guests">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {t("upToGuests", { count: room.maxGuests })}
                        </div>
                    </div>
                    <div className="room-card-price">
                        <span className="room-price-amount">৳{displayPrice.toLocaleString()}</span>
                        <span className="room-price-label">{t("perNight")}</span>
                        {showOriginalPrice && (
                            <div style={{ fontSize: "0.625rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                                ৳{basePrice.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Amenities */}
                {room.amenities.length > 0 && (
                    <div className="room-amenities">
                        {displayAmenities.map((amenity) => (
                            <span key={amenity} className="room-amenity-tag">
                                {amenityIcons[amenity] || "✓"} {amenity}
                            </span>
                        ))}
                        {remainingCount > 0 && (
                            <span className="room-amenity-more">{t("moreAmenities", { count: remainingCount })}</span>
                        )}
                    </div>
                )}

                {/* Unavailable Reason */}
                {isUnavailable && room.unavailableReason && (
                    <div className="room-unavailable-reason">
                        {room.unavailableReason}
                    </div>
                )}

                {/* View Details Button */}
                <button
                    className="room-view-details-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails();
                    }}
                >
                    {t("viewDetails")}
                </button>
            </div>
        </div>
    );
}
