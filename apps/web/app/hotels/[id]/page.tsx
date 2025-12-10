"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "../../components";

// Mock hotel detail data
const mockHotel = {
    id: "1",
    name: "Hotel Sunrise",
    location: "Gulshan 2, Road 45, Dhaka",
    city: "Dhaka",
    description: "Experience comfort and luxury at Hotel Sunrise. Located in the heart of Gulshan, our hotel offers modern amenities, spotless rooms, and exceptional service. Perfect for both business and leisure travelers.",
    rating: 4.5,
    reviewCount: 128,
    images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
    ],
    amenities: ["AC", "WiFi", "TV", "Hot Water", "24/7 Reception", "Room Service", "Parking", "CCTV"],
    rooms: [
        { id: "r1", name: "Standard Double", type: "DOUBLE", price: 2500, maxGuests: 2 },
        { id: "r2", name: "Deluxe Double", type: "DOUBLE", price: 3500, maxGuests: 2 },
        { id: "r3", name: "Family Suite", type: "SUITE", price: 5500, maxGuests: 4 },
    ],
    payAtHotel: true,
    policies: {
        checkIn: "2:00 PM",
        checkOut: "12:00 PM",
        cancellation: "Free cancellation up to 24 hours before check-in",
    },
};

export default function HotelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState(mockHotel.rooms[0]);
    const [currentImage, setCurrentImage] = useState(0);

    const handleBookNow = () => {
        router.push(`/booking?hotelId=${params.id}&roomId=${selectedRoom?.id}`);
    };

    return (
        <>
            {/* Hero Image Gallery */}
            <div style={{ position: "relative" }}>
                <img
                    src={mockHotel.images[currentImage]}
                    alt={mockHotel.name}
                    style={{
                        width: "100%",
                        height: "280px",
                        objectFit: "cover",
                    }}
                />

                {/* Image Dots */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "1rem",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "0.5rem",
                    }}
                >
                    {mockHotel.images.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentImage(i)}
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: i === currentImage ? "white" : "rgba(255,255,255,0.5)",
                                border: "none",
                                cursor: "pointer",
                            }}
                        />
                    ))}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                >
                    ←
                </button>

                {/* Pay at Hotel Badge */}
                {mockHotel.payAtHotel && (
                    <span
                        className="badge-pay-hotel"
                        style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                        }}
                    >
                        Pay at Hotel
                    </span>
                )}
            </div>

            <main style={{ padding: "1rem" }}>
                {/* Hotel Info */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        {mockHotel.name}
                    </h1>

                    <div
                        className="hotel-location"
                        style={{ marginBottom: "0.75rem" }}
                    >
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
                        {mockHotel.location}
                    </div>

                    {/* Rating */}
                    <div className="rating">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            style={{ width: "16px", height: "16px" }}
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="rating-value">{mockHotel.rating.toFixed(1)}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                            ({mockHotel.reviewCount} reviews)
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        About
                    </h2>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                        {mockHotel.description}
                    </p>
                </div>

                {/* Amenities */}
                <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Amenities
                    </h2>
                    <div className="amenity-tags">
                        {mockHotel.amenities.map((amenity) => (
                            <span key={amenity} className="amenity-tag">
                                ✓ {amenity}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Room Selection */}
                <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Select Room
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {mockHotel.rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "1rem",
                                    border: selectedRoom?.id === room.id
                                        ? "2px solid var(--color-primary)"
                                        : "2px solid var(--color-border)",
                                    borderRadius: "0.75rem",
                                    background: "white",
                                    cursor: "pointer",
                                    transition: "border-color 0.2s ease",
                                }}
                            >
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontWeight: 600 }}>{room.name}</div>
                                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                        Up to {room.maxGuests} guests
                                    </div>
                                </div>
                                <div className="hotel-price">
                                    ৳{room.price.toLocaleString()}
                                    <span className="hotel-price-label">/night</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Policies */}
                <div className="card" style={{ padding: "1rem", marginBottom: "6rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Hotel Policies
                    </h2>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Check-in:</strong> {mockHotel.policies.checkIn}
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Check-out:</strong> {mockHotel.policies.checkOut}
                        </div>
                        <div>
                            <strong>Cancellation:</strong> {mockHotel.policies.cancellation}
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Book Now Footer */}
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "white",
                    padding: "1rem",
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: 100,
                }}
            >
                <div>
                    <div className="hotel-price">
                        ৳{selectedRoom?.price.toLocaleString()}
                        <span className="hotel-price-label">/night</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {selectedRoom?.name}
                    </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                    Book Now
                </button>
            </div>
        </>
    );
}
