"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

// Category type matching DB schema
type HotelCategory = "CLASSIC" | "PREMIUM" | "BUSINESS";

// Category badge colors (matching vibeBranding utility)
const getCategoryColor = (category: string | null | undefined): string => {
    switch (category) {
        case "PREMIUM":
            return "#F59E0B"; // Amber/Gold
        case "BUSINESS":
            return "#3B82F6"; // Blue
        case "CLASSIC":
        default:
            return "#10B981"; // Green
    }
};

// Category display labels
const getCategoryLabel = (category: string | null | undefined): string | null => {
    switch (category) {
        case "PREMIUM":
            return "Premium";
        case "BUSINESS":
            return "Business";
        case "CLASSIC":
            return "Classic";
        default:
            return null;
    }
};

interface HotelCardProps {
    id: string;
    name: string;
    location: string;
    price: number;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    amenities: string[];
    payAtHotel?: boolean;
    vibeCode?: string | null;
    category?: string | null;
}

export function HotelCard({
    id,
    name,
    location,
    price,
    rating,
    reviewCount,
    imageUrl,
    amenities,
    payAtHotel = false,
    vibeCode,
    category,
}: HotelCardProps) {
    const t = useTranslations("hotel");
    const tCommon = useTranslations("common");

    // Format display name with Vibe branding
    const displayName = vibeCode ? `Vibe ${vibeCode} ${name}` : name;
    const categoryLabel = getCategoryLabel(category);
    const categoryColor = getCategoryColor(category);

    return (
        <Link href={`/hotels/${id}`} className="card hotel-card">
            {/* Image */}
            <div style={{ position: "relative" }}>
                <img
                    src={imageUrl}
                    alt={displayName}
                    className="card-image"
                    loading="lazy"
                />
                {/* Category Badge (top-left) */}
                {categoryLabel && (
                    <span
                        style={{
                            position: "absolute",
                            top: "0.75rem",
                            left: "0.75rem",
                            backgroundColor: categoryColor,
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                        }}
                    >
                        {categoryLabel}
                    </span>
                )}
                {/* Vibe Code Badge (top-right) */}
                {vibeCode && (
                    <span
                        style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            backgroundColor: "#E63946",
                            color: "white",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                        }}
                    >
                        {vibeCode}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="card-body">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.5rem",
                    }}
                >
                    <div>
                        <h3 className="hotel-name">{displayName}</h3>
                        <p className="hotel-location">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                style={{ width: "14px", height: "14px" }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {location}
                        </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div className="hotel-price">
                            ৳{price.toLocaleString()}
                            <span className="hotel-price-label">{tCommon("perNight")}</span>
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className="rating" style={{ marginBottom: "0.5rem" }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ width: "16px", height: "16px" }}
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="rating-value">{rating.toFixed(1)}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>
                        ({reviewCount} {tCommon("reviews")})
                    </span>
                </div>

                {/* Amenities */}
                <div className="amenity-tags">
                    {amenities.slice(0, 4).map((amenity) => (
                        <span key={amenity} className="amenity-tag">
                            {amenity}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
