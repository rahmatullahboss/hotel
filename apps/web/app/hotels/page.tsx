"use client";

import { Suspense, useState, useEffect, useCallback, useMemo, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BottomNav, Footer, SearchForm, OYOFiltersPanel, OYOHotelCard } from "../components";

import { searchHotels, type HotelWithPrice } from "../actions/hotels";
import { FiMapPin, FiX, FiMap } from "react-icons/fi";
import Link from "next/link";

// Lazy load the map component to avoid SSR issues
const HotelMapLazy = lazy(() =>
    import("../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

function HotelsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const city = searchParams.get("city") || "";
    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const t = useTranslations("hotels");
    const tListing = useTranslations("listing");
    const tCommon = useTranslations("common");

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const sortParam = searchParams.get("sort");

    const [view, setView] = useState<"list" | "map">("list");
    const [sortBy, setSortBy] = useState<"price" | "rating" | "distance">(
        (sortParam === "distance" || sortParam === "price" || sortParam === "rating") ? sortParam : "rating"
    );
    const [filterPayAtHotel, setFilterPayAtHotel] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState<string | undefined>();
    const [hotels, setHotels] = useState<HotelWithPrice[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [minRating, setMinRating] = useState<number | undefined>(undefined);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([500, 10000]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const HOTELS_PER_PAGE = 10;

    // Geolocation state
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
        latParam && lngParam ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) } : null
    );
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

    // Reset location when city changes to avoid conflict
    useEffect(() => {
        if (city) {
            setUserLocation(null);
        }
    }, [city]);

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
                radiusKm: 5000,
            });
            setHotels(results);
            setCurrentPage(1); // Reset to first page on filter change
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

    // Popular locations (Cities + Areas) as requested by user
    const popularLocations = [
        { label: tListing("popularCities.dhaka"), value: "Dhaka" },
        { label: tListing("popularCities.chittagong"), value: "Chittagong" },
        { label: tListing("popularCities.coxsBazar"), value: "Cox's Bazar" },
        { label: tListing("popularCities.sylhet"), value: "Sylhet" },
        { label: tListing("popularCities.kolkata"), value: "Kolkata" },
        { label: tListing("popularLocationsDefault.downtown"), value: "Downtown" },
        { label: tListing("popularLocationsDefault.airportArea"), value: "Airport" },
        { label: tListing("popularLocationsDefault.beachSide"), value: "Beach" },
        { label: tListing("popularLocationsDefault.cityCenter"), value: "City Center" }
    ];

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
                    minRating={minRating}
                    selectedAmenities={selectedAmenities}
                    onPriceChange={setPriceRange}
                    onRatingChange={setMinRating}
                    onAmenityToggle={(amenity) => {
                        setSelectedAmenities((prev) =>
                            prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
                        );
                    }}
                    onLocationClick={(location) => {
                        router.push(`/hotels?city=${encodeURIComponent(location)}`);
                    }}
                    onDetectLocation={handleGetLocation}
                />

                {/* Main Content Area */}
                <div className="oyo-listing-content" style={{ minHeight: "80vh" }}>
                    {/* Breadcrumb */}
                    <div className="oyo-breadcrumb">
                        <Link href="/">{tListing("breadcrumbHome")}</Link> › {city ? tListing("hotelsIn", { city }) : tListing("allHotels")}
                    </div>

                    {/* Header Row */}
                    <div className="oyo-listing-header">
                        <h1 className="oyo-listing-title">
                            {city ? tListing("hotelsIn", { city }) : tListing("allHotels")}
                        </h1>

                        <div className="oyo-listing-controls">
                            {/* Map View Toggle */}
                            <div className="oyo-map-toggle">
                                <span>{tListing("mapView")}</span>
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
                                <span>{tListing("sortBy")}</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "price" | "rating" | "distance")}
                                >
                                    <option value="rating">{tListing("sortPopularity")}</option>
                                    <option value="price">{tListing("sortPrice")}</option>
                                    {userLocation && <option value="distance">{tListing("sortDistance")}</option>}
                                </select>
                            </div>
                        </div>
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
                            {hotels
                                .slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE)
                                .map((hotel) => (
                                    <OYOHotelCard
                                        key={hotel.id}
                                        id={hotel.id}
                                        name={hotel.name}
                                        address={hotel.location}
                                        city={city || "Bangladesh"}
                                        rating={hotel.rating || 0}
                                        reviewCount={hotel.reviewCount || 0}
                                        images={[hotel.imageUrl]}
                                        amenities={hotel.amenities || []}
                                        basePrice={Math.round(hotel.lowestPrice * 1.3)}
                                        dynamicPrice={hotel.lowestPrice}
                                        badge={hotel.category === "PREMIUM" ? "Premium" : hotel.category === "BUSINESS" ? "Business" : undefined}
                                        zinuCode={hotel.zinuCode ?? undefined}
                                        distance={hotel.distance}
                                    />
                                ))}

                            {/* Pagination */}
                            {hotels.length > HOTELS_PER_PAGE && (
                                <div className="pagination-container">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        {tListing("previousPage")}
                                    </button>
                                    <div className="pagination-info">
                                        {tListing("pageInfo", { current: currentPage, total: Math.ceil(hotels.length / HOTELS_PER_PAGE) })}
                                        <span className="pagination-count">{tListing("hotelCount", { count: hotels.length })}</span>
                                    </div>
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(hotels.length / HOTELS_PER_PAGE), p + 1))}
                                        disabled={currentPage >= Math.ceil(hotels.length / HOTELS_PER_PAGE)}
                                    >
                                        {tListing("nextPage")}
                                    </button>
                                </div>
                            )}
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
