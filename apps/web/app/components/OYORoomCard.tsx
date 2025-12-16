"use client";

import { useTranslations } from "next-intl";
import { FiCheck, FiImage } from "react-icons/fi";

interface OYORoomCardProps {
    roomId: string;
    roomName: string;
    roomSize?: string;
    basePrice: number;
    dynamicPrice: number;
    taxes?: number;
    photo?: string;
    isSelected: boolean;
    availableCount?: number;
    onSelect: () => void;
}

export function OYORoomCard({
    roomId,
    roomName,
    roomSize = "9 sqm approx",
    basePrice,
    dynamicPrice,
    taxes = 192,
    photo,
    isSelected,
    availableCount,
    onSelect,
}: OYORoomCardProps) {
    const t = useTranslations("roomCard");

    return (
        <div className={`oyo-room-card ${isSelected ? "selected" : ""}`} onClick={onSelect}>
            {/* Selected Category Header */}
            {isSelected && (
                <div className="oyo-room-selected-header">
                    <span className="star-icon">★</span>
                    <span>SELECTED CATEGORY</span>
                </div>
            )}

            <div className="oyo-room-content">
                {/* Room Info */}
                <div className="oyo-room-info">
                    <div className="oyo-room-name">
                        {roomName}
                        {isSelected && <FiCheck size={18} className="check-icon" />}
                    </div>
                    <div className="oyo-room-size">{roomSize}</div>

                    {/* Price */}
                    <div className="oyo-room-price">
                        <span className="price-current">৳{dynamicPrice.toLocaleString()}</span>
                        {basePrice > dynamicPrice && (
                            <span className="price-original">৳{basePrice.toLocaleString()}</span>
                        )}
                    </div>
                    <div className="oyo-room-taxes">+ ৳{taxes} taxes & fee</div>

                    {/* Selected Badge */}
                    {isSelected && (
                        <div className="oyo-selected-badge">
                            <FiCheck size={14} />
                            SELECTED
                        </div>
                    )}
                </div>

                {/* Room Image */}
                <div className="oyo-room-image">
                    {photo ? (
                        <img src={photo} alt={roomName} />
                    ) : (
                        <div className="oyo-room-image-placeholder">
                            <FiImage size={24} />
                        </div>
                    )}
                    <button className="oyo-room-gallery-btn">
                        <FiImage size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
