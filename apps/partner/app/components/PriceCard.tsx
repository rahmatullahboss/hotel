import Link from "next/link";

interface Room {
    id: string;
    name: string;
    type: string;
    basePrice: number;
    currentPrice: number;
}

interface PriceCardProps {
    rooms: Room[];
    hotelId: string;
    promotionPercent?: number;
}

export function PriceCard({ rooms, hotelId, promotionPercent = 0 }: PriceCardProps) {
    // Calculate discounted price if promotion is active
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
                {rooms.length === 0 ? (
                    <div style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}>
                        No rooms configured. Add rooms in inventory.
                    </div>
                ) : (
                    rooms.map((room) => (
                        <div key={room.id} className="oyo-price-row">
                            <span className="oyo-price-label">
                                {room.name} • {room.type}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {hasPromotion && (
                                    <span style={{
                                        fontSize: "0.8125rem",
                                        color: "#9ca3af",
                                        textDecoration: "line-through"
                                    }}>
                                        ৳{room.basePrice.toLocaleString()}
                                    </span>
                                )}
                                <span
                                    className="oyo-price-value"
                                    style={hasPromotion ? { color: "#10b981", fontWeight: 700 } : {}}
                                >
                                    ৳{applyDiscount(room.basePrice).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
