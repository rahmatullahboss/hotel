"use client";

import { Suspense, useState, useEffect, useCallback, useMemo, lazy } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BottomNav, HotelCard } from "../components";
import { searchHotels, type HotelWithPrice } from "../actions/hotels";
import { FiMapPin, FiX } from "react-icons/fi";

// Lazy load the map component to avoid SSR issues
const HotelMapLazy = lazy(() =>
    import("../components/Map/HotelMap").then((mod) => ({ default: mod.HotelMap }))
);

function HotelsContent() {
    const searchParams = useSearchParams();
    const city = searchParams.get("city") || "";
    const t = useTranslations("hotels");
    const tCommon = useTranslations("common");

    const [view, setView] = useState<"list" | "map">("list");
    const [sortBy, setSortBy] = useState<"price" | "rating" | "distance">("rating");
    const [filterPayAtHotel, setFilterPayAtHotel] = useState(false);
    const [selectedHotelId, setSelectedHotelId] = useState<string | undefined>();
    const [hotels, setHotels] = useState<HotelWithPrice[]>([]);
    const [loading, setLoading] = useState(true);

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
                latitude: userLocation?.lat,
                longitude: userLocation?.lng,
                radiusKm: 15,
            });
            setHotels(results);
            setLoading(false);
        }
        fetchHotels();
    }, [city, sortBy, filterPayAtHotel, userLocation]);

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

    const handleHotelHover = useCallback((hotelId: string | undefined) => {
        setSelectedHotelId(hotelId);
    }, []);

    return (
        <>
            {/* Header */}
            <header
                style={{
                    padding: "1rem",
                    background: "white",
                    borderBottom: "1px solid var(--color-border)",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                            {city ? `${city} এ হোটেল` : t("allHotels")}
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            {loading ? tCommon("searching") : `${hotels.length} টি হোটেল পাওয়া গেছে`}
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${view === "list" ? "active" : ""}`}
                            onClick={() => setView("list")}
                        >
                            {t("listView")}
                        </button>
                        <button
                            className={`view-toggle-btn ${view === "map" ? "active" : ""}`}
                            onClick={() => setView("map")}
                        >
                            {t("mapView")}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", flexWrap: "wrap" }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "price" | "rating" | "distance")}
                        className="form-input"
                        style={{ padding: "0.5rem", width: "auto", fontSize: "0.875rem" }}
                    >
                        <option value="rating">{t("topRated")}</option>
                        <option value="price">{t("lowestPrice")}</option>
                        {userLocation && <option value="distance">{t("nearest")}</option>}
                    </select>

                    {/* Nearby / Location Button */}
                    {userLocation ? (
                        <button
                            className="btn btn-primary"
                            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "auto" }}
                            onClick={handleClearLocation}
                        >
                            <FiMapPin size={16} style={{ marginRight: "0.25rem" }} /> {t("nearby")} <FiX size={14} style={{ marginLeft: "0.25rem" }} />
                        </button>
                    ) : (
                        <button
                            className="btn btn-outline"
                            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "auto" }}
                            onClick={handleGetLocation}
                            disabled={locationLoading}
                        >
                            {locationLoading ? <><FiMapPin size={16} /> {t("gettingLocation")}</> : <><FiMapPin size={16} /> {t("nearby")}</>}
                        </button>
                    )}
                    {locationError && (
                        <span style={{ color: "var(--color-error)", fontSize: "0.75rem", alignSelf: "center" }}>
                            {locationError}
                        </span>
                    )}

                    <button
                        className={`btn ${filterPayAtHotel ? "btn-primary" : "btn-outline"}`}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "auto" }}
                        onClick={() => setFilterPayAtHotel(!filterPayAtHotel)}
                    >
                        {t("payAtHotel")}
                    </button>
                </div>
            </header>

            <main className="container page-content">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <div className="skeleton" style={{ width: 100, height: 24, margin: "0 auto" }} />
                    </div>
                ) : hotels.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-secondary)" }}>
                        {t("noHotelsFound")}
                    </div>
                ) : view === "list" ? (
                    <div className="hotel-grid">
                        {hotels.map((hotel) => (
                            <div
                                key={hotel.id}
                                onMouseEnter={() => handleHotelHover(hotel.id)}
                                onMouseLeave={() => handleHotelHover(undefined)}
                            >
                                <HotelCard
                                    id={hotel.id}
                                    name={hotel.name}
                                    location={hotel.location}
                                    price={hotel.lowestPrice}
                                    rating={hotel.rating}
                                    reviewCount={hotel.reviewCount}
                                    imageUrl={hotel.imageUrl}
                                    amenities={hotel.amenities}
                                    payAtHotel={hotel.payAtHotel}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Map View */
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: "1rem",
                            height: "calc(100vh - 200px)",
                        }}
                        className="map-view-container"
                    >
                        {/* Map */}
                        <div style={{ borderRadius: "0.75rem", overflow: "hidden", minHeight: 400 }}>
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
                                <HotelMapLazy
                                    hotels={mapMarkers}
                                    selectedHotelId={selectedHotelId}
                                    onMarkerClick={handleMarkerClick}
                                />
                            </Suspense>
                        </div>

                        {/* Selected Hotel Card (Mobile) */}
                        {selectedHotelId && (
                            <div className="selected-hotel-card" style={{ marginTop: "-3rem", zIndex: 10, position: "relative" }}>
                                {hotels
                                    .filter((h) => h.id === selectedHotelId)
                                    .map((hotel) => (
                                        <HotelCard
                                            key={hotel.id}
                                            id={hotel.id}
                                            name={hotel.name}
                                            location={hotel.location}
                                            price={hotel.lowestPrice}
                                            rating={hotel.rating}
                                            reviewCount={hotel.reviewCount}
                                            imageUrl={hotel.imageUrl}
                                            amenities={hotel.amenities}
                                            payAtHotel={hotel.payAtHotel}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

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
