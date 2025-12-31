"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    BottomNav,
    RoomDetailModal,
    ImageGalleryModal,
} from "../../components";
import { Footer } from "../../components/Footer";
import { getHotelById, getAvailableRooms, RoomWithDetails } from "../../actions/hotels";
import { getHotelReviews, getHotelRatingBreakdown } from "../../actions/review";
import { 
    FiMapPin, 
    FiArrowLeft, 
    FiChevronRight, 
    FiUsers,
    FiMaximize,
    FiCalendar,
    FiChevronDown,
    FiPlus,
    FiMinus,
    FiTrendingUp,
    FiCheckCircle,
    FiAlertCircle,
    FiMap,
    FiGrid,
} from "react-icons/fi";
import { 
    FaWifi, 
    FaSnowflake, 
    FaTv, 
    FaParking, 
    FaSwimmingPool, 
    FaUtensils, 
    FaDumbbell, 
    FaSpa, 
    FaCoffee, 
    FaConciergeBell,
    FaStar,
} from "react-icons/fa";
import { MdLocationOn, MdFlight } from "react-icons/md";
import Link from "next/link";

// Lazy load map to avoid SSR issues
const HotelMap = lazy(() =>
    import("../../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

type Room = RoomWithDetails;

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
    zinuCode?: string | null;
}

// Amenity icon mapping with colors
const getAmenityWithColor = (amenity: string): { icon: React.ReactNode; color: string; description: string } => {
    const mapping: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
        "WiFi": { icon: <FaWifi size={20} />, color: "blue", description: "Fiber optic connection in all areas" },
        "wifi": { icon: <FaWifi size={20} />, color: "blue", description: "High-speed internet access" },
        "Free Wifi": { icon: <FaWifi size={20} />, color: "blue", description: "Complimentary high-speed WiFi" },
        "AC": { icon: <FaSnowflake size={20} />, color: "cyan", description: "Climate controlled rooms" },
        "ac": { icon: <FaSnowflake size={20} />, color: "cyan", description: "Air conditioning available" },
        "TV": { icon: <FaTv size={20} />, color: "purple", description: "Flat screen TV with cable" },
        "tv": { icon: <FaTv size={20} />, color: "purple", description: "Smart TV in all rooms" },
        "Parking": { icon: <FaParking size={20} />, color: "orange", description: "Secure underground parking" },
        "Pool": { icon: <FaSwimmingPool size={20} />, color: "blue", description: "Outdoor swimming pool" },
        "Restaurant": { icon: <FaUtensils size={20} />, color: "rose", description: "On-site fine dining" },
        "Gym": { icon: <FaDumbbell size={20} />, color: "purple", description: "24/7 fitness center" },
        "Spa": { icon: <FaSpa size={20} />, color: "green", description: "Full-service spa & wellness" },
        "Coffee": { icon: <FaCoffee size={20} />, color: "orange", description: "In-room coffee maker" },
        "Room Service": { icon: <FaConciergeBell size={20} />, color: "rose", description: "24h room service" },
    };
    return mapping[amenity] || { icon: <FaWifi size={20} />, color: "blue", description: amenity };
};

// Quick amenity icons for overview
const getQuickAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
        "Pool": <FaSwimmingPool size={24} />,
        "Spa": <FaSpa size={24} />,
        "Restaurant": <FaUtensils size={24} />,
        "WiFi": <FaWifi size={24} />,
        "Gym": <FaDumbbell size={24} />,
    };
    return icons[amenity] || <FaWifi size={24} />;
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

    // Reviews state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);

    // Gallery modal
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

    // Active section for navigation
    const [activeSection, setActiveSection] = useState<string>("overview");

    // Date & guests
    const today = new Date().toISOString().split("T")[0]!;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]!;
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(tomorrow);
    const [guests, setGuests] = useState(2);
    const [rooms_count, setRoomsCount] = useState(1);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);

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

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Calculate nights and pricing
    const calculateNights = () => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();
    const selectedPrice = selectedRoom?.dynamicPrice ?? Number(selectedRoom?.basePrice || 0);
    const selectedBasePrice = Number(selectedRoom?.basePrice || 0);
    const totalPrice = selectedRoom?.totalDynamicPrice ?? selectedPrice * nights;
    const discount = selectedBasePrice > selectedPrice ? Math.round(((selectedBasePrice - selectedPrice) / selectedBasePrice) * 100) : 0;
    const taxesAndFees = Math.round(totalPrice * 0.15);

    // Open gallery
    const openGallery = (index: number) => {
        setGalleryInitialIndex(index);
        setShowGalleryModal(true);
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="skeleton" style={{ width: "100%", height: 400, borderRadius: "1.5rem" }} />
                <div className="skeleton" style={{ width: 300, height: 32, marginTop: "1.5rem" }} />
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

    const displayName = hotel.zinuCode ? `Zinu ${hotel.name}` : hotel.name;
    const displayImages = hotel.images.length > 0 ? hotel.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];
    const rating = parseFloat(hotel.rating || "4.5");
    const ratingLabel = rating >= 9 ? "Exceptional" : rating >= 8 ? "Wonderful" : rating >= 7 ? "Very Good" : "Good";

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
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
            >
                <FiArrowLeft size={20} />
            </button>

            {/* Breadcrumb Navigation */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1rem" }}>
                <nav className="premium-breadcrumb">
                    <Link href="/">Home</Link>
                    <FiChevronRight className="breadcrumb-separator" size={10} />
                    <Link href="/hotels">Hotels</Link>
                    <FiChevronRight className="breadcrumb-separator" size={10} />
                    <Link href={`/hotels?city=${hotel.city}`}>{hotel.city}</Link>
                    <FiChevronRight className="breadcrumb-separator" size={10} />
                    <span className="breadcrumb-current">{hotel.name}</span>
                </nav>
            </div>

            {/* Premium Image Gallery */}
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1rem" }}>
                <div className="premium-gallery">
                    {/* Main Large Image */}
                    <div className="premium-gallery-main" onClick={() => openGallery(0)}>
                        <img src={displayImages[0]} alt={displayName} />
                        <button className="premium-gallery-mobile-btn">
                            <FiGrid size={16} />
                            View Gallery
                        </button>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="premium-gallery-grid">
                        <div className="premium-gallery-row">
                            {displayImages.slice(1, 3).map((img, index) => (
                                <div 
                                    key={index} 
                                    className="premium-gallery-thumb"
                                    onClick={() => openGallery(index + 1)}
                                >
                                    <img src={img} alt={`${displayName} - ${index + 2}`} />
                                </div>
                            ))}
                        </div>
                        <div className="premium-gallery-row">
                            {displayImages.slice(3, 4).map((img, index) => (
                                <div 
                                    key={index} 
                                    className="premium-gallery-thumb"
                                    onClick={() => openGallery(index + 3)}
                                >
                                    <img src={img} alt={`${displayName} - ${index + 4}`} />
                                </div>
                            ))}
                            <div 
                                className="premium-gallery-thumb"
                                onClick={() => openGallery(0)}
                            >
                                <img 
                                    src={displayImages[4] || displayImages[0]} 
                                    alt={`${displayName} - More`} 
                                />
                                {displayImages.length > 5 && (
                                    <div className="premium-gallery-more">
                                        <span className="premium-gallery-more-count">+{displayImages.length - 5}</span>
                                        <span className="premium-gallery-more-text">View All</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Modal */}
            <ImageGalleryModal
                images={displayImages}
                initialIndex={galleryInitialIndex}
                isOpen={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                hotelName={displayName}
            />

            {/* Main Content Layout */}
            <div className="premium-hotel-layout">
                {/* Left Content */}
                <div className="premium-hotel-content">
                    {/* Sticky Navigation Tabs */}
                    <nav className="premium-nav-tabs">
                        {[
                            { id: "overview", label: t("sections.amenities").replace("Amenities", "Overview") || "Overview" },
                            { id: "rooms", label: t("sections.chooseRoom") || "Rooms" },
                            { id: "amenities", label: t("sections.amenities") || "Amenities" },
                            { id: "reviews", label: t("sections.ratingsReviews") || "Reviews" },
                            { id: "location", label: t("sections.whatsNearby") || "Location" },
                        ].map((tab) => (
                            <a
                                key={tab.id}
                                href={`#${tab.id}`}
                                className={`premium-nav-tab ${activeSection === tab.id ? "active" : ""}`}
                                onClick={() => setActiveSection(tab.id)}
                            >
                                {tab.label}
                            </a>
                        ))}
                    </nav>

                    {/* Hotel Header */}
                    <section id="overview" className="premium-hotel-header">
                        <div className="premium-hotel-badges">
                            {hotel.zinuCode && (
                                <span className="premium-luxury-badge">Zinu Collection</span>
                            )}
                            <div className="premium-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} size={12} />
                                ))}
                            </div>
                        </div>

                        <h1 className="premium-hotel-title">{displayName}</h1>

                        <div className="premium-hotel-meta">
                            <div className="premium-location">
                                <FiMapPin size={16} />
                                <span className="premium-location-text">{hotel.address}, {hotel.city}</span>
                            </div>
                            <div className="premium-rating-block">
                                <span className="premium-rating-score">{rating.toFixed(1)}</span>
                                <span className="premium-rating-label">{ratingLabel}</span>
                                <span className="premium-rating-count">({hotel.reviewCount.toLocaleString()} reviews)</span>
                            </div>
                        </div>
                    </section>

                    {/* Overview/Description Section */}
                    {hotel.description && (
                        <section style={{ marginBottom: "3rem" }}>
                            <div className="premium-overview-content">
                                <p>{hotel.description}</p>
                            </div>
                            
                            {/* Quick Amenities Grid */}
                            <div className="premium-quick-amenities">
                                {["Pool", "Spa", "Restaurant", "WiFi"].filter(a => 
                                    hotel.amenities.some(h => h.toLowerCase().includes(a.toLowerCase()))
                                ).slice(0, 4).map((amenity) => (
                                    <div key={amenity} className="premium-quick-amenity">
                                        <span className="premium-quick-amenity-icon">
                                            {getQuickAmenityIcon(amenity)}
                                        </span>
                                        <span className="premium-quick-amenity-name">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Amenities Section */}
                    <section id="amenities" style={{ marginBottom: "3rem", scrollMarginTop: "8rem" }}>
                        <div className="premium-section-header">
                            <div>
                                <h2 className="premium-section-title">{t("sections.amenities") || "Curated Amenities"}</h2>
                                <p className="premium-section-subtitle">Everything you need for a perfect stay</p>
                            </div>
                            {hotel.amenities.length > 6 && (
                                <button className="premium-view-all">
                                    View All {hotel.amenities.length} Amenities
                                    <FiChevronRight size={16} />
                                </button>
                            )}
                        </div>

                        <div className="premium-amenities-grid">
                            {hotel.amenities.slice(0, 6).map((amenity, index) => {
                                const { icon, color, description } = getAmenityWithColor(amenity);
                                return (
                                    <div key={amenity} className="premium-amenity-card">
                                        <div className={`premium-amenity-icon-wrapper ${color}`}>
                                            {icon}
                                        </div>
                                        <div className="premium-amenity-info">
                                            <h4>{amenity}</h4>
                                            <p>{description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Rooms Section */}
                    <section id="rooms" style={{ marginBottom: "3rem", scrollMarginTop: "8rem" }}>
                        <div className="premium-section-header">
                            <div>
                                <h2 className="premium-section-title">{t("sections.chooseRoom") || "Accommodations"}</h2>
                            </div>
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "0.5rem", 
                                fontSize: "0.875rem",
                                background: "white",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "9999px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                border: "1px solid #e2e8f0",
                            }}>
                                <FiCalendar size={16} style={{ color: "#22c55e" }} />
                                <span style={{ color: "#64748b" }}>Availability:</span>
                                <span style={{ fontWeight: 700, color: "#0f172a" }}>
                                    {formatDate(checkIn)} - {formatDate(checkOut)}
                                </span>
                            </div>
                        </div>

                        <div className="premium-rooms-container">
                            {rooms.length > 0 ? (
                                rooms.map((room, index) => {
                                    const roomPrice = room.dynamicPrice ?? Number(room.basePrice);
                                    const roomBasePrice = Number(room.basePrice);
                                    const isSelected = selectedRoom?.id === room.id;
                                    const isLowAvailability = (room.availableCount ?? 5) <= 3;

                                    return (
                                        <div key={room.id} className="premium-room-card">
                                            <div className="premium-room-image">
                                                <img 
                                                    src={room.photos?.[0] || displayImages[0]} 
                                                    alt={room.name} 
                                                />
                                                {index === 0 && (
                                                    <span className="premium-room-badge">Top Choice</span>
                                                )}
                                            </div>
                                            <div className="premium-room-content">
                                                <div>
                                                    <h3 className="premium-room-title">{room.name}</h3>
                                                    <div className="premium-room-specs">
                                                        <span className="premium-room-spec">
                                                            <FiMaximize size={14} />
                                                            {room.size || "35"} m²
                                                        </span>
                                                        <span className="premium-room-spec">
                                                            <FiUsers size={14} />
                                                            {room.maxGuests || 2} Guests
                                                        </span>
                                                    </div>
                                                    <div className="premium-room-tags">
                                                        {room.type && <span className="premium-room-tag">{room.type}</span>}
                                                        <span className="premium-room-tag">Breakfast Included</span>
                                                        <span className="premium-room-tag">Free Cancellation</span>
                                                    </div>
                                                </div>
                                                <div className="premium-room-footer">
                                                    <div className="premium-room-availability">
                                                        {isLowAvailability ? (
                                                            <span className="premium-room-availability-status low">
                                                                <FiAlertCircle size={14} />
                                                                Low availability
                                                            </span>
                                                        ) : (
                                                            <span className="premium-room-availability-status available">
                                                                <FiCheckCircle size={14} />
                                                                Free Cancellation
                                                            </span>
                                                        )}
                                                        <span className="premium-room-availability-note">
                                                            {room.availableCount || 5} rooms left
                                                        </span>
                                                    </div>
                                                    <div className="premium-room-pricing">
                                                        <div className="premium-room-price">
                                                            <span className="premium-room-price-amount">৳{roomPrice.toLocaleString()}</span>
                                                            <span className="premium-room-price-label">per night</span>
                                                        </div>
                                                        <button 
                                                            className={`premium-room-select-btn ${isSelected ? "" : "outline"}`}
                                                            onClick={() => setSelectedRoom(room)}
                                                        >
                                                            {isSelected ? "Selected" : "Select"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                                    <p style={{ color: "var(--color-text-secondary)" }}>{t("noRoomsAvailable")}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Room Detail Modal */}
                    {detailRoom && (
                        <RoomDetailModal
                            room={detailRoom}
                            isOpen={!!detailRoom}
                            onClose={() => setDetailRoom(null)}
                            onSelectRoom={() => setSelectedRoom(detailRoom)}
                        />
                    )}

                    {/* Reviews Section */}
                    <section id="reviews" style={{ marginBottom: "3rem", scrollMarginTop: "8rem" }}>
                        <div className="premium-section-header">
                            <h2 className="premium-section-title">Guest Experiences</h2>
                        </div>

                        <div className="premium-reviews-grid">
                            {/* Stats Panel */}
                            <div className="premium-reviews-stats">
                                <div className="premium-reviews-stats-content">
                                    <div className="premium-reviews-score">{rating.toFixed(1)}</div>
                                    <div className="premium-reviews-label">{ratingLabel}</div>

                                    <div className="premium-reviews-breakdown">
                                        {[
                                            { label: "Cleanliness", score: 9.6 },
                                            { label: "Comfort", score: 9.2 },
                                            { label: "Location", score: 9.8 },
                                            { label: "Staff", score: 8.8 },
                                        ].map((item) => (
                                            <div key={item.label} className="premium-reviews-breakdown-item">
                                                <span className="premium-reviews-breakdown-label">{item.label}</span>
                                                <div className="premium-reviews-breakdown-bar">
                                                    <div 
                                                        className="premium-reviews-breakdown-fill" 
                                                        style={{ width: `${item.score * 10}%` }}
                                                    />
                                                </div>
                                                <span className="premium-reviews-breakdown-score">{item.score}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="premium-reviews-list">
                                {reviews.length > 0 ? (
                                    <>
                                        {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => {
                                            const initials = (review.userName || "Guest").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                                            const scoreClass = review.rating >= 9 ? "excellent" : "good";
                                            
                                            return (
                                                <div key={review.id} className="premium-review-card">
                                                    <div className="premium-review-header">
                                                        <div className="premium-review-author">
                                                            <div className="premium-review-avatar">{initials}</div>
                                                            <div>
                                                                <div className="premium-review-author-name">
                                                                    {review.userName || "Guest"}
                                                                </div>
                                                                <div className="premium-review-author-meta">
                                                                    Stayed {review.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className={`premium-review-score ${scoreClass}`}>
                                                            {review.rating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    {review.title && (
                                                        <h4 className="premium-review-title">&quot;{review.title}&quot;</h4>
                                                    )}
                                                    <p className="premium-review-text">
                                                        {review.content || "Great stay!"}
                                                    </p>
                                                </div>
                                            );
                                        })}

                                        <button 
                                            className="premium-read-all-reviews"
                                            onClick={() => setShowAllReviews(!showAllReviews)}
                                        >
                                            {showAllReviews ? "Show Less" : `Read all ${hotel.reviewCount.toLocaleString()} reviews`}
                                        </button>
                                    </>
                                ) : (
                                    <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                                        {t("reviews.noReviews")}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Location Section */}
                    <section id="location" style={{ marginBottom: "6rem", scrollMarginTop: "8rem" }}>
                        <h2 className="premium-section-title">Explore the Area</h2>

                        {/* Map Container */}
                        {hotel.latitude && hotel.longitude ? (
                            <div className="premium-map-container">
                                <div style={{ borderRadius: "1.25rem", overflow: "hidden", height: 300 }}>
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
                            </div>
                        ) : (
                            <div className="premium-map-container">
                                <div className="premium-map-wrapper">
                                    <img 
                                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800" 
                                        alt="Map" 
                                    />
                                    <div className="premium-map-overlay">
                                        <button className="premium-map-btn">
                                            <FiMap size={18} />
                                            Interactive Map
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Nearby Places */}
                        <div className="premium-nearby-grid">
                            <div className="premium-nearby-section">
                                <h3>
                                    <span><MdLocationOn size={16} /></span>
                                    Top Attractions
                                </h3>
                                <div className="premium-nearby-list">
                                    <div className="premium-nearby-item">
                                        <span className="premium-nearby-item-name">City Center</span>
                                        <span className="premium-nearby-item-distance">0.5 km</span>
                                    </div>
                                    <div className="premium-nearby-item">
                                        <span className="premium-nearby-item-name">Main Market</span>
                                        <span className="premium-nearby-item-distance">1.2 km</span>
                                    </div>
                                    <div className="premium-nearby-item">
                                        <span className="premium-nearby-item-name">Shopping Mall</span>
                                        <span className="premium-nearby-item-distance">2.0 km</span>
                                    </div>
                                </div>
                            </div>
                            <div className="premium-nearby-section">
                                <h3>
                                    <span><MdFlight size={16} /></span>
                                    Transportation
                                </h3>
                                <div className="premium-nearby-list">
                                    <div className="premium-nearby-item">
                                        <span className="premium-nearby-item-name">Airport</span>
                                        <span className="premium-nearby-item-distance">15 km</span>
                                    </div>
                                    <div className="premium-nearby-item">
                                        <span className="premium-nearby-item-name">Train Station</span>
                                        <span className="premium-nearby-item-distance">3.5 km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Desktop Only */}
                <div className="premium-hotel-sidebar">
                    <div className="premium-sidebar-sticky">
                        <div className="premium-booking-sidebar">
                            {/* Price Header */}
                            <div className="premium-sidebar-header">
                                <div>
                                    {discount > 0 && (
                                        <div className="premium-sidebar-price-old">৳{selectedBasePrice.toLocaleString()}</div>
                                    )}
                                    <div className="premium-sidebar-price-current">
                                        <span className="premium-sidebar-price-amount">৳{selectedPrice.toLocaleString()}</span>
                                        <span className="premium-sidebar-price-period">/ night</span>
                                    </div>
                                </div>
                                {discount > 0 && (
                                    <span className="premium-sidebar-discount">{discount}% OFF</span>
                                )}
                            </div>

                            {/* Date Selection */}
                            <div className="premium-sidebar-dates">
                                <div className="premium-sidebar-dates-grid">
                                    <label className="premium-sidebar-date-item" style={{ position: "relative" }}>
                                        <div className="premium-sidebar-date-label">{t("sidebar.checkIn") || "Check-in"}</div>
                                        <div className="premium-sidebar-date-value">{formatDate(checkIn)}</div>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            min={today}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                                        />
                                    </label>
                                    <label className="premium-sidebar-date-item" style={{ position: "relative" }}>
                                        <div className="premium-sidebar-date-label">{t("sidebar.checkOut") || "Check-out"}</div>
                                        <div className="premium-sidebar-date-value">{formatDate(checkOut)}</div>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            min={checkIn || today}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Guests Selection */}
                            <div 
                                className="premium-sidebar-guests"
                                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            >
                                <div>
                                    <div className="premium-sidebar-guests-label">{t("sidebar.guests") || "Guests"}</div>
                                    <div className="premium-sidebar-guests-value">{guests} {t("sidebar.adults") || "Adults"}, {rooms_count} {t("sidebar.room") || "Room"}</div>
                                </div>
                                <FiChevronDown size={18} style={{ color: "#64748b" }} />
                            </div>

                            {showGuestDropdown && (
                                <div style={{ 
                                    background: "#f8fafc", 
                                    border: "1px solid #e2e8f0", 
                                    borderRadius: "0.75rem", 
                                    padding: "1rem",
                                    marginBottom: "1rem",
                                    marginTop: "-1rem"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                        <span style={{ fontWeight: 500 }}>Adults</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setGuests(Math.max(1, guests - 1)); }}
                                                style={{ 
                                                    width: 32, height: 32, borderRadius: "50%", 
                                                    border: "1px solid #e2e8f0", background: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{guests}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setGuests(Math.min(10, guests + 1)); }}
                                                style={{ 
                                                    width: 32, height: 32, borderRadius: "50%", 
                                                    border: "1px solid #e2e8f0", background: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: 500 }}>Rooms</span>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setRoomsCount(Math.max(1, rooms_count - 1)); }}
                                                style={{ 
                                                    width: 32, height: 32, borderRadius: "50%", 
                                                    border: "1px solid #e2e8f0", background: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiMinus size={14} />
                                            </button>
                                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: "center" }}>{rooms_count}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setRoomsCount(Math.min(5, rooms_count + 1)); }}
                                                style={{ 
                                                    width: 32, height: 32, borderRadius: "50%", 
                                                    border: "1px solid #e2e8f0", background: "white",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <FiPlus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Price Summary */}
                            <div className="premium-sidebar-summary">
                                <div className="premium-sidebar-summary-row">
                                    <span>৳{selectedPrice.toLocaleString()} x {nights} {t("sidebar.nights") || "nights"}</span>
                                    <span>৳{(selectedPrice * nights).toLocaleString()}</span>
                                </div>
                                <div className="premium-sidebar-summary-row">
                                    <span>{t("sidebar.taxesAndFees") || "Taxes & Fees"}</span>
                                    <span>৳{taxesAndFees.toLocaleString()}</span>
                                </div>
                                <div className="premium-sidebar-summary-row premium-sidebar-summary-total">
                                    <span>{t("sidebar.totalPrice") || "Total"}</span>
                                    <span>৳{(totalPrice + taxesAndFees).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Book Button */}
                            <button 
                                className="premium-sidebar-book-btn"
                                onClick={handleBookNow}
                                disabled={!selectedRoom}
                            >
                                {t("sidebar.continueToBook") || "Instant Book"}
                            </button>

                            <div className="premium-sidebar-note">
                                {t("sidebar.noPaymentRequired") || "No payment required today"}
                            </div>
                        </div>

                        {/* Demand Badge */}
                        <div className="premium-demand-badge">
                            <div className="premium-demand-icon">
                                <FiTrendingUp size={18} />
                            </div>
                            <div className="premium-demand-text">
                                <h4>High Demand</h4>
                                <p>Booked 3 times in the last hour</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Booking Bar */}
            {selectedRoom && (
                <div className="premium-mobile-booking-bar">
                    <div className="premium-mobile-bar-content">
                        <div className="premium-mobile-price-section">
                            <div>
                                <span className="premium-mobile-price">৳{selectedPrice.toLocaleString()}</span>
                                {discount > 0 && (
                                    <span className="premium-mobile-price-original">৳{selectedBasePrice.toLocaleString()}</span>
                                )}
                            </div>
                            <div className="premium-mobile-taxes">+ taxes & fees</div>
                        </div>
                        <button 
                            className="premium-mobile-book-btn"
                            onClick={handleBookNow}
                            disabled={!selectedRoom}
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            )}

            <BottomNav />
            <Footer />
        </>
    );
}
