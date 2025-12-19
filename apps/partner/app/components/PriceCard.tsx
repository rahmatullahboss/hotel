import Link from "next/link";

interface RoomPricing {
    type: string;
    singleOccupancy: number;
    doubleOccupancy: number;
    tripleOccupancy: number;
}

interface PriceCardProps {
    pricing: RoomPricing;
    hotelId: string;
    promotionPercent?: number; // Added promotion support
}

export function PriceCard({ pricing, hotelId, promotionPercent = 0 }: PriceCardProps) {
    // Calculate discounted prices if promotion is active
    const hasPromotion = promotionPercent > 0;
    const applyDiscount = (price: number) => {
        if (!hasPromotion) return price;
        return Math.round(price * (1 - promotionPercent / 100));
    };

    return (
        <div className="oyo-card">
            <div className="oyo-card-header">
                <h2 className="oyo-card-title">
                    Price
                    {hasPromotion && (
                        <span style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            background: "#dcfce7",
                            color: "#166534",
                            borderRadius: "4px",
                            fontWeight: 500
                        }}>
                            -{promotionPercent}% Active
                        </span>
                    )}
                </h2>
                <Link href={`/settings/pricing`} className="oyo-card-link">
                    Modify
                </Link>
            </div>
            <div className="oyo-card-body">
                {/* Room Type Selector */}
                <div style={{ marginBottom: "1rem" }}>
                    <select
                        style={{
                            width: "100%",
                            padding: "0.625rem 1rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            background: "white",
                            cursor: "pointer",
                        }}
                        defaultValue={pricing.type}
                    >
                        <option value="standard">Standard Room</option>
                        <option value="deluxe">Deluxe Room</option>
                        <option value="suite">Suite</option>
                    </select>
                </div>

                {/* Pricing rows with promotion */}
                <div className="oyo-price-row">
                    <span className="oyo-price-label">Single occupancy</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasPromotion && (
                            <span style={{
                                fontSize: "0.8125rem",
                                color: "#9ca3af",
                                textDecoration: "line-through"
                            }}>
                                ৳{pricing.singleOccupancy}
                            </span>
                        )}
                        <span className="oyo-price-value" style={hasPromotion ? { color: "#10b981", fontWeight: 700 } : {}}>
                            ৳{applyDiscount(pricing.singleOccupancy)}
                        </span>
                    </div>
                </div>
                <div className="oyo-price-row">
                    <span className="oyo-price-label">Double occupancy</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasPromotion && (
                            <span style={{
                                fontSize: "0.8125rem",
                                color: "#9ca3af",
                                textDecoration: "line-through"
                            }}>
                                ৳{pricing.doubleOccupancy}
                            </span>
                        )}
                        <span className="oyo-price-value" style={hasPromotion ? { color: "#10b981", fontWeight: 700 } : {}}>
                            ৳{applyDiscount(pricing.doubleOccupancy)}
                        </span>
                    </div>
                </div>
                <div className="oyo-price-row">
                    <span className="oyo-price-label">Triple occupancy</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {hasPromotion && (
                            <span style={{
                                fontSize: "0.8125rem",
                                color: "#9ca3af",
                                textDecoration: "line-through"
                            }}>
                                ৳{pricing.tripleOccupancy}
                            </span>
                        )}
                        <span className="oyo-price-value" style={hasPromotion ? { color: "#10b981", fontWeight: 700 } : {}}>
                            ৳{applyDiscount(pricing.tripleOccupancy)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
