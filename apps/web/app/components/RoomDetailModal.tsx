"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiWifi, FiTv, FiCoffee, FiCheck, FiSlash } from "react-icons/fi";
import { FaSnowflake, FaWineBottle, FaConciergeBell, FaSun, FaWater, FaCity, FaLock, FaBath, FaShower, FaWind, FaParking, FaSwimmingPool, FaDumbbell, FaSpa, FaBed, FaCrown } from "react-icons/fa";
import { MdIron, MdOutlineFreeBreakfast } from "react-icons/md";

interface RoomDetailModalProps {
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
    isOpen: boolean;
    onClose: () => void;
    onSelectRoom: () => void;
}

// Amenity icons mapping - using React Icons
const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
        "WiFi": <FiWifi size={14} />,
        "wifi": <FiWifi size={14} />,
        "AC": <FaSnowflake size={14} />,
        "ac": <FaSnowflake size={14} />,
        "Air Conditioning": <FaSnowflake size={14} />,
        "TV": <FiTv size={14} />,
        "tv": <FiTv size={14} />,
        "Television": <FiTv size={14} />,
        "Mini Bar": <FaWineBottle size={14} />,
        "Minibar": <FaWineBottle size={14} />,
        "Room Service": <FaConciergeBell size={14} />,
        "Balcony": <FaSun size={14} />,
        "Sea View": <FaWater size={14} />,
        "City View": <FaCity size={14} />,
        "Safe": <FaLock size={14} />,
        "Bathtub": <FaBath size={14} />,
        "Shower": <FaShower size={14} />,
        "Hair Dryer": <FaWind size={14} />,
        "Iron": <MdIron size={14} />,
        "Coffee Maker": <FiCoffee size={14} />,
        "Breakfast": <MdOutlineFreeBreakfast size={14} />,
        "Parking": <FaParking size={14} />,
        "Pool Access": <FaSwimmingPool size={14} />,
        "Gym Access": <FaDumbbell size={14} />,
        "Spa Access": <FaSpa size={14} />,
    };
    return icons[amenity] || <FiCheck size={14} />;
};

// Room type info
const roomTypeInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    "SINGLE": { label: "Single Room", color: "#6366f1", icon: <FaBed size={14} /> },
    "DOUBLE": { label: "Double Room", color: "#22c55e", icon: <><FaBed size={14} /><FaBed size={14} /></> },
    "SUITE": { label: "Suite", color: "#f59e0b", icon: <FaCrown size={14} /> },
    "DORMITORY": { label: "Dormitory", color: "#8b5cf6", icon: <><FaBed size={14} /><FaBed size={14} /><FaBed size={14} /></> },
};

export default function RoomDetailModal({ room, isOpen, onClose, onSelectRoom }: RoomDetailModalProps) {
    const t = useTranslations("roomDetailModal");
    const [currentPhoto, setCurrentPhoto] = useState(0);

    // Handle escape key to close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const photos = room.photos.length > 0
        ? room.photos
        : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"];

    const isUnavailable = room.isAvailable === false;
    const typeInfo = roomTypeInfo[room.type] || { label: room.type, color: "#6b7280", icon: "🛏️" };

    // Calculate display price - use dynamic price if available
    const basePrice = Number(room.basePrice);
    const displayPrice = room.dynamicPrice ?? basePrice;
    // Only show strikethrough when customer gets a DISCOUNT (not when price is higher)
    const showOriginalPrice = room.dynamicPrice && room.dynamicPrice < basePrice;

    const handlePrevPhoto = () => {
        setCurrentPhoto((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const handleNextPhoto = () => {
        setCurrentPhoto((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="room-modal-overlay" onClick={onClose}>
            <div className="room-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="room-modal-close" onClick={onClose}>
                    ✕
                </button>

                {/* Photo Gallery */}
                <div className="room-modal-gallery">
                    <img
                        src={photos[currentPhoto]}
                        alt={`${room.name} - Photo ${currentPhoto + 1}`}
                        className="room-modal-image"
                    />

                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                        <>
                            <button className="room-modal-nav room-modal-nav-prev" onClick={handlePrevPhoto}>
                                ‹
                            </button>
                            <button className="room-modal-nav room-modal-nav-next" onClick={handleNextPhoto}>
                                ›
                            </button>
                        </>
                    )}

                    {/* Photo Counter */}
                    <div className="room-modal-photo-counter">
                        {currentPhoto + 1} / {photos.length}
                    </div>

                    {/* Thumbnail Strip */}
                    {photos.length > 1 && (
                        <div className="room-modal-thumbnails">
                            {photos.map((photo, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPhoto(i)}
                                    className={`room-modal-thumbnail ${i === currentPhoto ? "active" : ""}`}
                                >
                                    <img src={photo} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Room Details */}
                <div className="room-modal-content">
                    {/* Header */}
                    <div className="room-modal-header">
                        <div>
                            <span
                                className="room-modal-type-badge"
                                style={{ backgroundColor: typeInfo.color }}
                            >
                                {typeInfo.icon} {typeInfo.label}
                            </span>
                            <h2 className="room-modal-title">{room.name}</h2>
                            <div className="room-modal-guests">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                </svg>
                                Maximum {room.maxGuests} guest{room.maxGuests > 1 ? "s" : ""}
                            </div>
                        </div>
                        <div className="room-modal-price">
                            <span className="room-modal-price-amount">৳{displayPrice.toLocaleString()}</span>
                            <span className="room-modal-price-label">/night</span>
                            {showOriginalPrice && (
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                                    ৳{basePrice.toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {room.description && (
                        <div className="room-modal-section">
                            <h3>{t("aboutRoom")}</h3>
                            <p>{room.description}</p>
                        </div>
                    )}

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                        <div className="room-modal-section">
                            <h3>{t("roomAmenities")}</h3>
                            <div className="room-modal-amenities">
                                {room.amenities.map((amenity) => (
                                    <div key={amenity} className="room-modal-amenity">
                                        <span className="room-modal-amenity-icon">
                                            {getAmenityIcon(amenity)}
                                        </span>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Unavailable Notice */}
                    {isUnavailable && (
                        <div className="room-modal-unavailable">
                            <span><FiSlash size={20} /></span>
                            <div>
                                <strong>{t("notAvailable")}</strong>
                                {room.unavailableReason && <p>{room.unavailableReason}</p>}
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        className={`btn btn-primary btn-block btn-lg room-modal-cta ${isUnavailable ? "btn-disabled" : ""}`}
                        onClick={() => {
                            onSelectRoom();
                            onClose();
                        }}
                        disabled={isUnavailable}
                    >
                        {isUnavailable ? t("roomNotAvailable") : t("selectRoom")}
                    </button>
                </div>
            </div>
        </div>
    );
}
