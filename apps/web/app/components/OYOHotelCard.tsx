"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { FiStar, FiImage } from "react-icons/fi";
import { FaWifi, FaSnowflake, FaTv, FaParking, FaSwimmingPool, FaUtensils, FaConciergeBell } from "react-icons/fa";

interface OYOHotelCardProps {
    id: string;
    name: string;
    address: string;
    city: string;
    rating: number;
    reviewCount: number;
    ratingLabel?: string;
    images: string[];
    amenities: string[];
    basePrice: number;
    dynamicPrice: number;
    badge?: string;
    vibeCode?: string;
}

const amenityIcons: Record<string, React.ReactNode> = {
    "WiFi": <FaWifi size={12} />,
    "wifi": <FaWifi size={12} />,
    "Free Wifi": <FaWifi size={12} />,
    "AC": <FaSnowflake size={12} />,
    "ac": <FaSnowflake size={12} />,
    "TV": <FaTv size={12} />,
    "tv": <FaTv size={12} />,
    "Parking": <FaParking size={12} />,
    "Pool": <FaSwimmingPool size={12} />,
    "Restaurant": <FaUtensils size={12} />,
    "Reception": <FaConciergeBell size={12} />,
};

export function OYOHotelCard({
    id,
    name,
    address,
    city,
    rating,
    reviewCount,
    ratingLabel,
    images,
    amenities,
    basePrice,
    dynamicPrice,
    badge,
    vibeCode,
}: OYOHotelCardProps) {
    const t = useTranslations("hotelCard");

    const discount = basePrice > dynamicPrice ? Math.round(((basePrice - dynamicPrice) / basePrice) * 100) : 0;
    const displayName = vibeCode ? `Vibe ${name}` : name;
    const mainImage = images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
    const thumbnails = images.slice(1, 4);

    const getRatingLabel = (r: number) => {
        if (r >= 4.5) return t("excellent");
        if (r >= 4.0) return t("veryGood");
        if (r >= 3.5) return t("good");
        return t("average");
    };

    return (
        <div className="oyo-hotel-card">
            {/* Image Gallery Grid */}
            <div className="oyo-card-gallery">
                {/* Badge */}
                {badge && (
                    <div className="oyo-card-badge">
                        <span>🏢</span> {badge}
                    </div>
                )}

                {/* Main Image */}
                <Link href={`/hotels/${id}`} className="oyo-card-main-image">
                    <img src={mainImage} alt={displayName} />
                </Link>

                {/* Thumbnails */}
                <div className="oyo-card-thumbnails">
                    {thumbnails.map((img, i) => (
                        <div key={i} className="oyo-card-thumb">
                            <img src={img} alt={`${displayName} ${i + 2}`} />
                        </div>
                    ))}
                    {thumbnails.length < 3 && (
                        <div className="oyo-card-thumb placeholder">
                            <FiImage size={16} />
                        </div>
                    )}
                </div>
            </div>

            {/* Card Content */}
            <div className="oyo-card-content">
                {/* Header Row */}
                <div className="oyo-card-header">
                    <div className="oyo-card-info">
                        <h3 className="oyo-card-name">{displayName}</h3>
                        <p className="oyo-card-address">{address}</p>
                    </div>
                </div>

                {/* Rating */}
                <div className="oyo-card-rating-row">
                    <div className="oyo-card-rating-badge">
                        {rating.toFixed(1)}
                        <FiStar size={10} />
                    </div>
                    <span className="oyo-card-rating-count">({t("ratings", { count: reviewCount })})</span>
                    <span className="oyo-card-rating-label">• {getRatingLabel(rating)}</span>
                </div>

                {/* Amenities */}
                <div className="oyo-card-amenities">
                    {amenities.slice(0, 4).map((amenity) => (
                        <span key={amenity} className="oyo-card-amenity">
                            {amenityIcons[amenity] || "✓"} {amenity}
                        </span>
                    ))}
                    {amenities.length > 4 && (
                        <span className="oyo-card-amenity more">{t("more", { count: amenities.length - 4 })}</span>
                    )}
                </div>

                {/* Price & Actions */}
                <div className="oyo-card-footer">
                    <div className="oyo-card-price-section">
                        <div className="oyo-card-price">
                            <span className="price-main">৳{dynamicPrice.toLocaleString()}</span>
                            {discount > 0 && (
                                <>
                                    <span className="price-original">৳{basePrice.toLocaleString()}</span>
                                    <span className="price-discount">{discount}% {t("off")}</span>
                                </>
                            )}
                        </div>
                        <div className="oyo-card-taxes">
                            + {t("taxesAndFees")}
                        </div>
                    </div>
                    <div className="oyo-card-actions">
                        <Link href={`/hotels/${id}`} className="oyo-btn-outline">
                            {t("viewDetails")}
                        </Link>
                        <Link href={`/hotels/${id}`} className="oyo-btn-primary">
                            {t("bookNow")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
