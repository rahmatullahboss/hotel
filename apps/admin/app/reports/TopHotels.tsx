"use client";

import { MdHotel } from "react-icons/md";

interface HotelRevenue {
    hotelId: string;
    hotelName: string;
    city: string;
    bookingCount: number;
    revenue: number;
    commission: number;
    netRevenue: number;
}

interface TopHotelsProps {
    hotels: HotelRevenue[];
}

export function TopHotels({ hotels }: TopHotelsProps) {
    if (hotels.length === 0) {
        return (
            <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem 0" }}>
                No revenue data available
            </div>
        );
    }

    const maxRevenue = Math.max(...hotels.map((h) => h.revenue), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {hotels.map((hotel, index) => (
                <div key={hotel.hotelId} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: index < 3 ? ["#f59e0b", "#6b7280", "#cd7c2f"][index] : "var(--color-bg-secondary)",
                        color: index < 3 ? "white" : "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                    }}>
                        {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}>
                            {hotel.hotelName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {hotel.city} • {hotel.bookingCount} bookings
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#22c55e" }}>
                            ৳{hotel.revenue.toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TopHotels;
