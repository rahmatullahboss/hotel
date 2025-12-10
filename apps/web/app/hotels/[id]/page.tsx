"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "../../components";
import { getHotelById, getAvailableRooms } from "../../actions/hotels";

interface Room {
    id: string;
    name: string;
    type: string;
    basePrice: string;
    maxGuests: number;
}

interface HotelDetail {
    id: string;
    name: string;
    address: string;
    city: string;
    description: string | null;
    rating: string | null;
    reviewCount: number;
    images: string[];
    amenities: string[];
    rooms: Room[];
    payAtHotelEnabled: boolean;
}

export default function HotelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hotelId = params.id as string;

    const [hotel, setHotel] = useState<HotelDetail | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [currentImage, setCurrentImage] = useState(0);

    // Default dates: today and tomorrow
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);

    // Fetch hotel data
    useEffect(() => {
        async function fetchHotel() {
            setLoading(true);
            const data = await getHotelById(hotelId);
            if (data) {
                setHotel({
                    ...data,
                    images: data.images || [data.coverImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
                    rooms: data.rooms || [],
                });
                setRooms(data.rooms || []);
                const firstRoom = data.rooms?.[0];
                if (firstRoom) {
                    setSelectedRoom(firstRoom);
                }
            }
            setLoading(false);
        }
        fetchHotel();
    }, [hotelId]);

    const handleBookNow = () => {
        if (!hotel || !selectedRoom || !checkIn || !checkOut) return;
        router.push(
            `/booking?hotelId=${hotel.id}&roomId=${selectedRoom.id}&hotel=${encodeURIComponent(hotel.name)}&room=${encodeURIComponent(selectedRoom.name)}&price=${selectedRoom.basePrice}&checkIn=${checkIn}&checkOut=${checkOut}`
        );
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="skeleton" style={{ width: "100%", height: 280 }} />
                <div className="skeleton" style={{ width: 200, height: 24, marginTop: "1rem" }} />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>Hotel not found</h2>
                <p style={{ color: "var(--color-text-secondary)" }}>This hotel may have been removed or is unavailable.</p>
                <button className="btn btn-primary" onClick={() => router.push("/hotels")} style={{ marginTop: "1rem" }}>
                    Browse Hotels
                </button>
            </div>
        );
    }

    const images = hotel.images.length > 0 ? hotel.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];

    return (
        <>
            {/* Hero Image Gallery */}
            <div style={{ position: "relative" }}>
                <img
                    src={images[currentImage]}
                    alt={hotel.name}
                    style={{
                        width: "100%",
                        height: "280px",
                        objectFit: "cover",
                    }}
                />

                {/* Image Dots */}
                {images.length > 1 && (
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
                        {images.map((_, i) => (
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
                )}

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
                {hotel.payAtHotelEnabled && (
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
                        {hotel.name}
                    </h1>

                    <div className="hotel-location" style={{ marginBottom: "0.75rem" }}>
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
                        {hotel.address}, {hotel.city}
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
                        <span className="rating-value">{parseFloat(hotel.rating || "0").toFixed(1)}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                            ({hotel.reviewCount} reviews)
                        </span>
                    </div>
                </div>

                {/* Description */}
                {hotel.description && (
                    <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                            About
                        </h2>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                            {hotel.description}
                        </p>
                    </div>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                            Amenities
                        </h2>
                        <div className="amenity-tags">
                            {hotel.amenities.map((amenity) => (
                                <span key={amenity} className="amenity-tag">
                                    ✓ {amenity}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Date Selection */}
                <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Select Dates
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: "0.875rem" }}>Check-in</label>
                            <input
                                type="date"
                                className="form-input"
                                value={checkIn}
                                min={today}
                                onChange={(e) => {
                                    setCheckIn(e.target.value);
                                    if (checkOut && e.target.value >= checkOut) {
                                        const nextDay = new Date(e.target.value);
                                        nextDay.setDate(nextDay.getDate() + 1);
                                        setCheckOut(nextDay.toISOString().split("T")[0]);
                                    }
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: "0.875rem" }}>Check-out</label>
                            <input
                                type="date"
                                className="form-input"
                                value={checkOut}
                                min={checkIn || today}
                                onChange={(e) => setCheckOut(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Room Selection */}
                <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Select Room
                    </h2>
                    {rooms.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {rooms.map((room) => (
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
                                        ৳{Number(room.basePrice).toLocaleString()}
                                        <span className="hotel-price-label">/night</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "var(--color-text-secondary)" }}>No rooms available at the moment.</p>
                    )}
                </div>

                {/* Policies */}
                <div className="card" style={{ padding: "1rem", marginBottom: "6rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Hotel Policies
                    </h2>
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Check-in:</strong> 2:00 PM
                        </div>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <strong>Check-out:</strong> 12:00 PM
                        </div>
                        <div>
                            <strong>Cancellation:</strong> Free cancellation up to 24 hours before check-in
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Book Now Footer */}
            {selectedRoom && (
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
                            ৳{Number(selectedRoom.basePrice).toLocaleString()}
                            <span className="hotel-price-label">/night</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            {selectedRoom.name}
                        </div>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                        Book Now
                    </button>
                </div>
            )}
        </>
    );
}
