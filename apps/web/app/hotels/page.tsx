"use client";

import { Suspense, useState, useEffect, useCallback, useMemo, lazy } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BottomNav, Footer, SearchForm, OYOFiltersPanel, OYOHotelCard } from "../components";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { searchHotels, type HotelWithPrice } from "../actions/hotels";
import { FiMapPin, FiX, FiMap } from "react-icons/fi";
import Link from "next/link";

// Lazy load the map component to avoid SSR issues
const HotelMapLazy = lazy(() =>
    import("../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

function HotelsContent() {
    const searchParams = useSearchParams();
    const city = searchParams.get("city") || "";
    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const t = useTranslations("hotels");
    const tCommon = useTranslations("common");

    const [view, setView] = useState<"list" | "map">("list");
    const [sortBy, setSortBy] = useState<"price" | "rating" | "distance">("rating");
    const [filterPayAtHotel, setFilterPayAtHotel] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState<string | undefined>();
    const [hotels, setHotels] = useState<HotelWithPrice[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [minRating, setMinRating] = useState(0);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([500, 10000]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

    // Geolocation state
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Get user location
    const handleGetLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError(t("locationFailed"));
            return;
        }

        setLocationLoading(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setSortBy("distance");
                setLocationLoading(false);
            },
            (error) => {
                setLocationError(error.code === 1 ? t("locationDenied") : t("locationFailed"));
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [t]);

    // Clear location filter
    const handleClearLocation = useCallback(() => {
        setUserLocation(null);
        setSortBy("rating");
    }, []);

    // Fetch hotels from database
    useEffect(() => {
        async function fetchHotels() {
            setLoading(true);
            const results = await searchHotels({
                city: city || undefined,
                sortBy,
                payAtHotel: filterPayAtHotel || undefined,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                minRating: minRating || undefined,
                amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
                latitude: userLocation?.lat,
                longitude: userLocation?.lng,
                radiusKm: 15,
            });
            setHotels(results);
            setLoading(false);
        }
        fetchHotels();
    }, [city, sortBy, filterPayAtHotel, userLocation, priceRange, minRating, selectedAmenities]);

    // Map markers data
    const mapMarkers = useMemo(
        () =>
            hotels.map((h) => ({
                id: h.id,
                name: h.name,
                lat: h.latitude ?? 23.8103,
                lng: h.longitude ?? 90.4125,
                price: h.lowestPrice,
                rating: h.rating,
            })),
        [hotels]
    );

    const handleMarkerClick = useCallback((hotelId: string) => {
        setSelectedHotelId(hotelId);
    }, []);

    // Popular locations for the current city
    const popularLocations = city
        ? ["Downtown", "Airport Area", "Beach Side", "City Center", "Business District"]
        : ["Dhaka", "Chittagong", "Cox's Bazar", "Sylhet", "Kolkata"];

    return (
        <>
            {/* OYO-Style Sticky Header */}
            <header className="oyo-header" style={{
                padding: "0.75rem 1rem",
                background: "white",
                borderBottom: "1px solid var(--color-border)",
                position: "sticky",
                top: 0,
                zIndex: 50,
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <SearchForm />
                </div>
            </header>

            {/* Main Content with OYO Layout */}
            <div className="oyo-listing-layout">
                {/* Left Sidebar Filters - OYO Style */}
                <OYOFiltersPanel
                    city={city || "Bangladesh"}
                    popularLocations={popularLocations}
                    minPrice={500}
                    maxPrice={15000}
                    priceRange={priceRange}
                    selectedAmenities={selectedAmenities}
                    selectedCollections={selectedCollections}
                    onPriceChange={setPriceRange}
                    onAmenityToggle={(amenity) => {
                        setSelectedAmenities((prev) =>
                            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
                        );
                    }}
                    onCollectionToggle={(id) => {
                        setSelectedCollections((prev) =>
                            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
                        );
                    }}
                    onLocationClick={(location) => {
                        window.location.href = `/hotels?city=${encodeURIComponent(location)}`;
                    }}
                />

                {/* Main Content Area */}
                <div className="oyo-listing-content">
                    {/* Breadcrumb */}
                    <div className="oyo-breadcrumb">
                        <Link href="/">Bangladesh</Link> › {city ? `${city} Hotels` : "All Hotels"}
                    </div>

                    {/* Header Row */}
                    <div className="oyo-listing-header">
                        <h1 className="oyo-listing-title">
                            {city ? `Hotels in ${city}` : t("allHotels")}
                        </h1>

                        <div className="oyo-listing-controls">
                            {/* Map View Toggle */}
                            <div className="oyo-map-toggle">
                                <span>Map View</span>
                                <label style={{ position: "relative", width: 48, height: 24, display: "inline-block" }}>
                                    <input
                                        type="checkbox"
                                        checked={view === "map"}
                                        onChange={() => setView(view === "list" ? "map" : "list")}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                    />
                                    <span style={{
                                        position: "absolute",
                                        cursor: "pointer",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: view === "map" ? "#22c55e" : "#ccc",
                                        borderRadius: 24,
                                        transition: "0.3s",
                                    }}>
                                        <span style={{
                                            position: "absolute",
                                            height: 18,
                                            width: 18,
                                            left: view === "map" ? 26 : 3,
                                            bottom: 3,
                                            backgroundColor: "white",
                                            borderRadius: "50%",
                                            transition: "0.3s",
                                        }} />
                                    </span>
                                </label>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="oyo-sort-dropdown">
                                <span>Sort By</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "price" | "rating" | "distance")}
                                >
                                    <option value="rating">Popularity</option>
                                    <option value="price">Price: Low to High</option>
                                    {userLocation && <option value="distance">Distance</option>}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Promo Banner */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1rem",
                        background: "#fff9e6",
                        borderRadius: "0.5rem",
                        marginBottom: "1rem",
                        fontSize: "0.875rem",
                    }}>
                        <span style={{ fontSize: "1.25rem" }}>🎉</span>
                        <span>upto 80% off. Valid until 31st Dec 2026.</span>
                    </div>

                    {/* Hotels Grid */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "3rem" }}>
                            <div className="skeleton" style={{ width: 100, height: 24, margin: "0 auto" }} />
                        </div>
                    ) : hotels.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
                            {t("noHotelsFound")}
                        </div>
                    ) : view === "list" ? (
                        <div>
                            {hotels.map((hotel) => (
                                <OYOHotelCard
                                    key={hotel.id}
                                    id={hotel.id}
                                    name={hotel.name}
                                    address={hotel.location}
                                    city={city || "Bangladesh"}
                                    rating={hotel.rating || 4.5}
                                    reviewCount={hotel.reviewCount || 100}
                                    images={hotel.images || [hotel.imageUrl]}
                                    amenities={hotel.amenities || ["WiFi", "AC", "TV"]}
                                    basePrice={Math.round(hotel.lowestPrice * 1.3)}
                                    dynamicPrice={hotel.lowestPrice}
                                    badge={hotel.category === "premium" ? "Company-Serviced" : undefined}
                                    vibeCode={hotel.vibeCode}
                                    bookingsCount={Math.floor(Math.random() * 3000) + 500}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Map View */
                        <div style={{ borderRadius: "0.75rem", overflow: "hidden", height: "calc(100vh - 200px)" }}>
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
                                <HotelMapLazy
                                    hotels={mapMarkers}
                                    selectedHotelId={selectedHotelId}
                                    onMarkerClick={handleMarkerClick}
                                />
                            </Suspense>
                        </div>
                    )}
                </div>
            </div>

            {/* Why Choose Us Section */}
            <WhyChooseUs />

            {/* Footer */}
            <Footer />

            <BottomNav />
        </>
    );
}

export default function HotelsPage() {
    const tCommon = useTranslations("common");

    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>{tCommon("loadingHotels")}</div>}>
            <HotelsContent />
        </Suspense>
    );
}
