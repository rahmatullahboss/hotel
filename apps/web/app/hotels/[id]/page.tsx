"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav, RoomCard, RoomDetailModal } from "../../components";
import { getHotelById, getAvailableRooms, RoomWithDetails } from "../../actions/hotels";

interface Room extends RoomWithDetails { }

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
    const [detailRoom, setDetailRoom] = useState<Room | null>(null);

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
                });
                // Don't set rooms here - let the availability effect handle it
            }
            setLoading(false);
        }
        fetchHotel();
    }, [hotelId]);

    // Fetch available rooms when dates change
    useEffect(() => {
        async function fetchAvailability() {
            if (!hotelId || !checkIn || !checkOut) return;

            const availableRooms = await getAvailableRooms(hotelId, checkIn, checkOut);
            setRooms(availableRooms);

            // Auto-select first available room
            const firstAvailable = availableRooms.find((r) => r.isAvailable !== false);
            if (firstAvailable) {
                setSelectedRoom(firstAvailable);
            } else {
                setSelectedRoom(null);
            }
        }
        fetchAvailability();
    }, [hotelId, checkIn, checkOut]);

    const handleBookNow = () => {
        if (!hotel || !selectedRoom || !checkIn || !checkOut) return;
        // Include room photo in URL params for booking page preview
        const roomPhoto = selectedRoom.photos && selectedRoom.photos.length > 0 ? selectedRoom.photos[0] : "";
        const roomPhotoParam = roomPhoto ? `&roomPhoto=${encodeURIComponent(roomPhoto)}` : "";
        router.push(
            `/booking?hotelId=${hotel.id}&roomId=${selectedRoom.id}&hotel=${encodeURIComponent(hotel.name)}&room=${encodeURIComponent(selectedRoom.name)}&price=${selectedRoom.basePrice}&checkIn=${checkIn}&checkOut=${checkOut}${roomPhotoParam}`
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

            <main className="page-with-book-bar">
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

                {/* Room Selection with Photos */}
                <div style={{ marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Available Rooms
                    </h2>
                    {rooms.length > 0 ? (
                        <div className="room-cards-grid">
                            {rooms.map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    isSelected={selectedRoom?.id === room.id}
                                    onSelect={() => setSelectedRoom(room)}
                                    onViewDetails={() => setDetailRoom(room)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: "var(--color-text-secondary)" }}>No rooms available at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Room Detail Modal */}
                {detailRoom && (
                    <RoomDetailModal
                        room={detailRoom}
                        isOpen={!!detailRoom}
                        onClose={() => setDetailRoom(null)}
                        onSelectRoom={() => setSelectedRoom(detailRoom)}
                    />
                )}

                {/* Policies */}
                <div className="card" style={{ padding: "1rem" }}>
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
                    className="book-now-bar"
                    style={{
                        position: "fixed",
                        left: 0,
                        right: 0,
                        background: "white",
                        padding: "1rem",
                        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
                        borderTop: "1px solid var(--color-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 90,
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

            <BottomNav />
        </>
    );
}
