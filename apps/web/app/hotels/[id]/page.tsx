"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    BottomNav,
    RoomCard,
    RoomDetailModal,
    HotelImageGallery,
    DateGuestBar,
    HotelHighlights
} from "../../components";
import { getHotelById, getAvailableRooms, RoomWithDetails } from "../../actions/hotels";
import { FiMapPin, FiStar, FiClock, FiXCircle, FiCreditCard, FiArrowLeft } from "react-icons/fi";
import { FaWifi, FaSnowflake, FaTv, FaParking, FaSwimmingPool, FaUtensils, FaDumbbell, FaSpa, FaCoffee, FaConciergeBell } from "react-icons/fa";

// Lazy load map to avoid SSR issues
const HotelMap = lazy(() =>
    import("../../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

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
    latitude: string | null;
    longitude: string | null;
    vibeCode?: string | null;
}

// Amenity icon mapping
const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
        "WiFi": <FaWifi size={16} />,
        "wifi": <FaWifi size={16} />,
        "AC": <FaSnowflake size={16} />,
        "ac": <FaSnowflake size={16} />,
        "Air Conditioning": <FaSnowflake size={16} />,
        "TV": <FaTv size={16} />,
        "tv": <FaTv size={16} />,
        "Parking": <FaParking size={16} />,
        "Pool": <FaSwimmingPool size={16} />,
        "Swimming Pool": <FaSwimmingPool size={16} />,
        "Restaurant": <FaUtensils size={16} />,
        "Gym": <FaDumbbell size={16} />,
        "Spa": <FaSpa size={16} />,
        "Coffee": <FaCoffee size={16} />,
        "Room Service": <FaConciergeBell size={16} />,
    };
    return icons[amenity] || <FaWifi size={16} />;
};

export default function HotelDetailPage() {
    const params = useParams();
    const router = useRouter();
    const hotelId = params.id as string;
    const t = useTranslations("hotelDetail");
    const tCommon = useTranslations("common");

    const [hotel, setHotel] = useState<HotelDetail | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [detailRoom, setDetailRoom] = useState<Room | null>(null);

    // Default dates: today and tomorrow
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [guests, setGuests] = useState(2);

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
        const roomPhoto = selectedRoom.photos && selectedRoom.photos.length > 0 ? selectedRoom.photos[0] : "";
        const roomPhotoParam = roomPhoto ? `&roomPhoto=${encodeURIComponent(roomPhoto)}` : "";
        const price = selectedRoom.dynamicPrice ?? Number(selectedRoom.basePrice);
        const nights = selectedRoom.nights ?? 1;
        const total = selectedRoom.totalDynamicPrice ?? price * nights;
        const roomIdsParam = selectedRoom.roomIds && selectedRoom.roomIds.length > 0
            ? `&roomIds=${encodeURIComponent(JSON.stringify(selectedRoom.roomIds))}`
            : "";
        router.push(
            `/booking?hotelId=${hotel.id}&roomId=${selectedRoom.id}&hotel=${encodeURIComponent(hotel.name)}&room=${encodeURIComponent(selectedRoom.name)}&price=${price}&nights=${nights}&totalPrice=${total}&checkIn=${checkIn}&checkOut=${checkOut}${roomPhotoParam}${roomIdsParam}`
        );
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="skeleton" style={{ width: "100%", height: 400, borderRadius: "0.75rem" }} />
                <div className="skeleton" style={{ width: 200, height: 24, marginTop: "1rem" }} />
            </div>
        );
    }

    if (!hotel) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <h2>{t("hotelNotFound")}</h2>
                <p style={{ color: "var(--color-text-secondary)" }}>{t("hotelNotFoundDesc")}</p>
                <button className="btn btn-primary" onClick={() => router.push("/hotels")} style={{ marginTop: "1rem" }}>
                    {t("browseHotels")}
                </button>
            </div>
        );
    }

    const displayName = hotel.vibeCode ? `Vibe ${hotel.name}` : hotel.name;

    return (
        <>
            {/* Back Button - Fixed */}
            <button
                onClick={() => router.back()}
                className="btn-back-fixed"
                style={{
                    position: "fixed",
                    top: "1rem",
                    left: "1rem",
                    zIndex: 100,
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
                <FiArrowLeft size={20} />
            </button>

            <main className="page-with-book-bar" style={{ padding: "0 1rem" }}>
                {/* 1. Image Gallery Grid - OYO Style */}
                <HotelImageGallery
                    images={hotel.images}
                    hotelName={displayName}
                />

                {/* 2. Hotel Info Header */}
                <div className="hotel-info-header">
                    <h1>{displayName}</h1>

                    {/* Vibe Code Badge */}
                    {hotel.vibeCode && (
                        <span
                            style={{
                                display: "inline-block",
                                backgroundColor: "#E63946",
                                color: "white",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                marginBottom: "0.5rem",
                            }}
                        >
                            {hotel.vibeCode}
                        </span>
                    )}

                    {/* Rating Row */}
                    <div className="hotel-rating-row">
                        <div className="hotel-rating-badge">
                            <FiStar size={14} />
                            {parseFloat(hotel.rating || "0").toFixed(1)}
                        </div>
                        <span className="hotel-review-count">
                            {hotel.reviewCount} {tCommon("reviews")}
                        </span>
                    </div>

                    {/* Location Row */}
                    <div className="hotel-location-row">
                        <FiMapPin size={14} />
                        {hotel.address}, {hotel.city}
                    </div>
                </div>

                {/* 3. Highlights / Trust Badges - OYO Style */}
                <HotelHighlights
                    payAtHotelEnabled={hotel.payAtHotelEnabled}
                    isVerified={!!hotel.vibeCode}
                />

                {/* 4. Sticky Date/Guest Bar - OYO Style */}
                <DateGuestBar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                    onGuestsChange={setGuests}
                />

                {/* 5. Room Selection - OYO Style */}
                <div style={{ marginTop: "1rem" }}>
                    <div className="section-header">
                        <h2 className="section-title">{t("availableRooms")}</h2>
                    </div>
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
                            <p style={{ color: "var(--color-text-secondary)" }}>{t("noRoomsAvailable")}</p>
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

                {/* 6. About Section */}
                {hotel.description && (
                    <div style={{ marginTop: "1.5rem" }}>
                        <div className="section-header">
                            <h2 className="section-title">{t("about")}</h2>
                        </div>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                            {hotel.description}
                        </p>
                    </div>
                )}

                {/* 7. Amenities Grid - OYO Style */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                        <div className="section-header">
                            <h2 className="section-title">{t("amenities")}</h2>
                        </div>
                        <div className="amenities-grid">
                            {hotel.amenities.map((amenity) => (
                                <div key={amenity} className="amenity-grid-item">
                                    <div className="amenity-grid-icon">
                                        {getAmenityIcon(amenity)}
                                    </div>
                                    <span className="amenity-grid-text">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. Policies Section - OYO Style */}
                <div style={{ marginTop: "1.5rem" }}>
                    <div className="section-header">
                        <h2 className="section-title">{t("hotelPolicies")}</h2>
                    </div>
                    <div className="policies-grid">
                        <div className="policy-item">
                            <div className="policy-icon">
                                <FiClock size={18} />
                            </div>
                            <div className="policy-content">
                                <h4>Check-in</h4>
                                <p>From 2:00 PM onwards</p>
                            </div>
                        </div>
                        <div className="policy-item">
                            <div className="policy-icon">
                                <FiClock size={18} />
                            </div>
                            <div className="policy-content">
                                <h4>Check-out</h4>
                                <p>Before 12:00 PM</p>
                            </div>
                        </div>
                        <div className="policy-item">
                            <div className="policy-icon">
                                <FiXCircle size={18} />
                            </div>
                            <div className="policy-content">
                                <h4>Cancellation</h4>
                                <p>Free up to 24h before</p>
                            </div>
                        </div>
                        <div className="policy-item">
                            <div className="policy-icon">
                                <FiCreditCard size={18} />
                            </div>
                            <div className="policy-content">
                                <h4>ID Required</h4>
                                <p>Valid ID at check-in</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 9. Location Map */}
                {hotel.latitude && hotel.longitude && (
                    <div style={{ marginTop: "1.5rem", marginBottom: "6rem" }}>
                        <div className="section-header">
                            <h2 className="section-title">{t("location")}</h2>
                        </div>
                        <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: 200 }}>
                            <Suspense
                                fallback={
                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "var(--color-bg-secondary)",
                                        }}
                                    >
                                        {tCommon("loadingMap")}
                                    </div>
                                }
                            >
                                <HotelMap
                                    hotels={[{
                                        id: hotel.id,
                                        name: hotel.name,
                                        lat: parseFloat(hotel.latitude),
                                        lng: parseFloat(hotel.longitude),
                                        price: rooms[0] ? (rooms[0].dynamicPrice ?? Number(rooms[0].basePrice)) : 0,
                                        rating: hotel.rating ? parseFloat(hotel.rating) : undefined,
                                    }]}
                                    center={[parseFloat(hotel.latitude), parseFloat(hotel.longitude)]}
                                    zoom={15}
                                />
                            </Suspense>
                        </div>
                        <p className="hotel-location-row" style={{ marginTop: "0.5rem" }}>
                            <FiMapPin size={12} /> {hotel.address}, {hotel.city}
                        </p>
                    </div>
                )}
            </main>

            {/* 10. Sticky Book Now Footer - OYO Style */}
            {selectedRoom && (() => {
                const displayPrice = selectedRoom.dynamicPrice ?? Number(selectedRoom.basePrice);
                const basePrice = Number(selectedRoom.basePrice);
                const isDiscount = selectedRoom.dynamicPrice && selectedRoom.dynamicPrice < basePrice;
                const nights = selectedRoom.nights ?? 1;
                const total = selectedRoom.totalDynamicPrice ?? displayPrice * nights;

                return (
                    <div
                        className="book-now-bar"
                        style={{
                            position: "fixed",
                            left: 0,
                            right: 0,
                            bottom: 0,
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
                                ৳{displayPrice.toLocaleString()}
                                <span className="hotel-price-label">{tCommon("perNight")}</span>
                            </div>
                            {isDiscount && (
                                <div style={{ fontSize: "0.625rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                                    ৳{basePrice.toLocaleString()}/{tCommon("night")}
                                </div>
                            )}
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                {selectedRoom.name} • {nights} {tCommon(nights > 1 ? "nights" : "night")} = ৳{total.toLocaleString()}
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                            {t("bookNow")}
                        </button>
                    </div>
                );
            })()}

            <BottomNav />
        </>
    );
}
