"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    BottomNav,
    RoomDetailModal,
    HotelImageGallery,
    OYOBookingSidebar,
    OYORoomCard,
    OYORatingsBreakdown,
    OYOReviewCard,
    OYOSectionTabs,
} from "../../components";
import { getHotelById, getAvailableRooms, RoomWithDetails } from "../../actions/hotels";
import { getHotelReviews, getHotelRatingBreakdown } from "../../actions/review";
import { FiMapPin, FiStar, FiClock, FiXCircle, FiCreditCard, FiArrowLeft } from "react-icons/fi";
import { FaWifi, FaSnowflake, FaTv, FaParking, FaSwimmingPool, FaUtensils, FaDumbbell, FaSpa, FaCoffee, FaConciergeBell } from "react-icons/fa";

// Lazy load map to avoid SSR issues
const HotelMap = lazy(() =>
    import("../../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

interface Room extends RoomWithDetails { }

// Review interface
interface Review {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    createdAt: Date;
    userName: string | null;
}

// Rating breakdown interface
interface RatingBreakdown {
    stars: number;
    percentage: number;
    count: number;
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
    payAtHotelEnabled: boolean;
    latitude: string | null;
    longitude: string | null;
    zinoCode?: string | null;
}

// Amenity icon mapping
const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
        "WiFi": <FaWifi size={16} />,
        "wifi": <FaWifi size={16} />,
        "Free Wifi": <FaWifi size={16} />,
        "AC": <FaSnowflake size={16} />,
        "ac": <FaSnowflake size={16} />,
        "TV": <FaTv size={16} />,
        "tv": <FaTv size={16} />,
        "Parking": <FaParking size={16} />,
        "Pool": <FaSwimmingPool size={16} />,
        "Restaurant": <FaUtensils size={16} />,
        "Gym": <FaDumbbell size={16} />,
        "Spa": <FaSpa size={16} />,
        "Coffee": <FaCoffee size={16} />,
        "Room Service": <FaConciergeBell size={16} />,
    };
    return icons[amenity] || <FaWifi size={16} />;
};

// Section tabs will use translations

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

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Default dates: today and tomorrow
    const today = new Date().toISOString().split("T")[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [guests, setGuests] = useState(2);

    // Section tabs with translations
    const SECTION_TABS = [
        { id: "amenities", label: t("sections.amenities") },
        { id: "about", label: t("sections.aboutVibe") },
        { id: "rooms", label: t("sections.chooseRoom") },
        { id: "reviews", label: t("sections.ratingsReviews") },
        { id: "location", label: t("sections.whatsNearby") },
    ];

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

    // Fetch reviews and rating breakdown
    useEffect(() => {
        async function fetchReviews() {
            if (!hotelId) return;

            const [reviewsData, breakdownData] = await Promise.all([
                getHotelReviews(hotelId),
                getHotelRatingBreakdown(hotelId),
            ]);

            setReviews(reviewsData.reviews);
            setRatingBreakdown(breakdownData.breakdown);
        }
        fetchReviews();
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

    const displayName = hotel.zinoCode ? `Zino ${hotel.name}` : hotel.name;
    const selectedPrice = selectedRoom?.dynamicPrice ?? Number(selectedRoom?.basePrice || 0);
    const selectedBasePrice = Number(selectedRoom?.basePrice || 0);
    const nights = selectedRoom?.nights ?? 1;
    const totalPrice = selectedRoom?.totalDynamicPrice ?? selectedPrice * nights;

    return (
        <>
            {/* Back Button - Fixed */}
            <button
                onClick={() => router.back()}
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

            {/* Hero Image Gallery - Full Width */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem" }}>
                <HotelImageGallery
                    images={hotel.images}
                    hotelName={displayName}
                />
            </div>

            {/* Section Tabs - Sticky Navigation */}
            <OYOSectionTabs sections={SECTION_TABS} />

            {/* Two Column Layout - OYO Style */}
            <div className="oyo-detail-layout">
                {/* Main Content */}
                <div className="oyo-main-content">
                    {/* Hotel Info Header */}
                    <div className="hotel-info-header">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h1>{displayName}</h1>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", margin: "0.25rem 0" }}>
                                    {hotel.address}, {hotel.city}
                                </p>
                                {hotel.zinoCode && (
                                    <span style={{
                                        display: "inline-block",
                                        background: "rgba(0,0,0,0.7)",
                                        color: "white",
                                        padding: "0.25rem 0.5rem",
                                        borderRadius: "4px",
                                        fontSize: "0.625rem",
                                        marginTop: "0.5rem",
                                    }}>
                                        🏢 {t("companyServiced")}
                                    </span>
                                )}
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div className="hotel-rating-badge" style={{ background: "#22c55e", padding: "0.5rem 0.75rem" }}>
                                    <FiStar size={14} />
                                    <span style={{ marginLeft: "0.25rem" }}>{parseFloat(hotel.rating || "0").toFixed(1)}</span>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
                                    {t("ratings.ratingsCount", { count: hotel.reviewCount })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amenities Section */}
                    <div id="amenities" style={{ marginTop: "1.5rem" }}>
                        <h2 className="oyo-section-title">{t("sections.amenities")}</h2>
                        <div className="amenities-grid">
                            {(showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 6)).map((amenity: string) => (
                                <div key={amenity} className="amenity-grid-item">
                                    <div className="amenity-grid-icon">
                                        {getAmenityIcon(amenity)}
                                    </div>
                                    <span className="amenity-grid-text">{amenity}</span>
                                </div>
                            ))}
                        </div>
                        {hotel.amenities.length > 6 && (
                            <button
                                onClick={() => setShowAllAmenities(!showAllAmenities)}
                                style={{ color: "#22c55e", background: "none", border: "none", marginTop: "0.75rem", cursor: "pointer", fontSize: "0.875rem" }}
                            >
                                {showAllAmenities ? t("reviews.showMore").replace("More", "Less") : t("reviews.showMore")}
                            </button>
                        )}
                    </div>

                    {/* About Section */}
                    {hotel.description && (
                        <div id="about" style={{ marginTop: "1.5rem" }}>
                            <h2 className="oyo-section-title">{t("sections.aboutVibe")}</h2>
                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                                {hotel.description}
                            </p>
                        </div>
                    )}

                    {/* Room Selection */}
                    <div id="rooms" style={{ marginTop: "1.5rem" }}>
                        <h2 className="oyo-section-title">{t("sections.chooseRoom")}</h2>
                        {rooms.length > 0 ? (
                            <div>
                                {rooms.map((room) => (
                                    <OYORoomCard
                                        key={room.id}
                                        roomId={room.id}
                                        roomName={room.name}
                                        roomSize={`${room.maxGuests || 2} guests · ${room.type || "DOUBLE"}`}
                                        basePrice={Number(room.basePrice)}
                                        dynamicPrice={room.dynamicPrice ?? Number(room.basePrice)}
                                        photo={room.photos?.[0]}
                                        isSelected={selectedRoom?.id === room.id}
                                        availableCount={room.availableCount}
                                        onSelect={() => setSelectedRoom(room)}
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

                    {/* Ratings & Reviews Section */}
                    <div id="reviews">
                        <OYORatingsBreakdown
                            averageRating={parseFloat(hotel.rating || "4.6")}
                            totalReviews={hotel.reviewCount}
                            breakdown={ratingBreakdown.length > 0 ? ratingBreakdown : undefined}
                        />

                        {/* Reviews */}
                        <div style={{ marginTop: "1rem" }}>
                            {reviews.length > 0 ? (
                                <>
                                    {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review: Review) => (
                                        <OYOReviewCard
                                            key={review.id}
                                            reviewerName={review.userName || "Guest"}
                                            reviewDate={review.createdAt.toISOString().split("T")[0] || ""}
                                            rating={review.rating}
                                            reviewText={review.content || ""}
                                        />
                                    ))}
                                    {reviews.length > 3 && (
                                        <button
                                            onClick={() => setShowAllReviews(!showAllReviews)}
                                            style={{ color: "#22c55e", background: "none", border: "none", marginTop: "1rem", cursor: "pointer", fontSize: "0.875rem" }}
                                        >
                                            {showAllReviews ? t("reviews.showMore").replace("More", "Less") : t("reviews.seeAll")}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                    {t("reviews.noReviews")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location Map */}
                    <div id="location" style={{ marginTop: "1.5rem", marginBottom: "6rem" }}>
                        <h2 className="oyo-section-title">{t("sections.whatsNearby")}</h2>
                        {hotel.latitude && hotel.longitude && (
                            <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: 200 }}>
                                <Suspense
                                    fallback={
                                        <div style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "var(--color-bg-secondary)",
                                        }}>
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
                        )}
                        <p className="hotel-location-row" style={{ marginTop: "0.5rem" }}>
                            <FiMapPin size={12} /> {hotel.address}, {hotel.city}
                        </p>
                    </div>
                </div>

                {/* Sticky Booking Sidebar - OYO Style */}
                <div className="oyo-sidebar">
                    {selectedRoom && (
                        <OYOBookingSidebar
                            hotelName={displayName}
                            roomName={selectedRoom.name}
                            basePrice={selectedBasePrice}
                            dynamicPrice={selectedPrice}
                            totalPrice={totalPrice}
                            nights={nights}
                            checkIn={checkIn}
                            checkOut={checkOut}
                            guests={guests}
                            isSelected={!!selectedRoom}
                            onCheckInChange={setCheckIn}
                            onCheckOutChange={setCheckOut}
                            onGuestsChange={setGuests}
                            onBookNow={handleBookNow}
                        />
                    )}
                </div>
            </div>

            {/* Mobile Book Now Bar (only on mobile) */}
            <div className="book-now-bar" style={{
                display: "none",
            }}>
                {/* Hidden on desktop, CSS shows on mobile */}
            </div>

            <BottomNav />
        </>
    );
}
