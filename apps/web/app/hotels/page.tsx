"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BottomNav, HotelCard } from "../components";

// Mock search results
const mockHotels = [
    {
        id: "1",
        name: "Hotel Sunrise",
        location: "Gulshan, Dhaka",
        price: 2500,
        rating: 4.5,
        reviewCount: 128,
        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        amenities: ["AC", "WiFi", "TV", "Hot Water"],
        payAtHotel: true,
    },
    {
        id: "2",
        name: "Grand Palace Hotel",
        location: "Banani, Dhaka",
        price: 3800,
        rating: 4.8,
        reviewCount: 256,
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
        amenities: ["AC", "WiFi", "Pool", "Restaurant"],
        payAtHotel: false,
    },
    {
        id: "3",
        name: "Budget Inn Express",
        location: "Dhanmondi, Dhaka",
        price: 1200,
        rating: 4.2,
        reviewCount: 89,
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        amenities: ["AC", "WiFi", "24/7 Reception"],
        payAtHotel: true,
    },
    {
        id: "4",
        name: "The Residency",
        location: "Uttara, Dhaka",
        price: 4500,
        rating: 4.7,
        reviewCount: 312,
        imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
        amenities: ["AC", "WiFi", "Gym", "Spa"],
        payAtHotel: true,
    },
    {
        id: "5",
        name: "City View Hotel",
        location: "Motijheel, Dhaka",
        price: 1800,
        rating: 4.0,
        reviewCount: 67,
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
        amenities: ["AC", "WiFi", "Restaurant"],
        payAtHotel: false,
    },
];

function HotelsContent() {
    const searchParams = useSearchParams();
    const city = searchParams.get("city") || "Dhaka";
    const [view, setView] = useState<"list" | "map">("list");
    const [sortBy, setSortBy] = useState<"price" | "rating">("rating");
    const [filterPayAtHotel, setFilterPayAtHotel] = useState(false);

    // Filter and sort hotels
    let hotels = [...mockHotels];

    if (filterPayAtHotel) {
        hotels = hotels.filter((h) => h.payAtHotel);
    }

    if (sortBy === "price") {
        hotels.sort((a, b) => a.price - b.price);
    } else {
        hotels.sort((a, b) => b.rating - a.rating);
    }

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
                            Hotels in {city}
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            {hotels.length} properties found
                        </p>
                    </div>

                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${view === "list" ? "active" : ""}`}
                            onClick={() => setView("list")}
                        >
                            List
                        </button>
                        <button
                            className={`view-toggle-btn ${view === "map" ? "active" : ""}`}
                            onClick={() => setView("map")}
                        >
                            Map
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "price" | "rating")}
                        className="form-input"
                        style={{ padding: "0.5rem", width: "auto", fontSize: "0.875rem" }}
                    >
                        <option value="rating">Top Rated</option>
                        <option value="price">Lowest Price</option>
                    </select>

                    <button
                        className={`btn ${filterPayAtHotel ? "btn-primary" : "btn-outline"}`}
                        style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", minHeight: "auto" }}
                        onClick={() => setFilterPayAtHotel(!filterPayAtHotel)}
                    >
                        Pay at Hotel
                    </button>
                </div>
            </header>

            <main style={{ padding: "1rem" }}>
                {view === "list" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {hotels.map((hotel) => (
                            <HotelCard key={hotel.id} {...hotel} />
                        ))}
                    </div>
                ) : (
                    /* Map View Placeholder */
                    <div
                        style={{
                            height: "calc(100vh - 200px)",
                            background: "var(--color-bg-secondary)",
                            borderRadius: "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
                            <p>Map view coming soon!</p>
                            <p style={{ fontSize: "0.875rem" }}>
                                Leaflet integration pending
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </>
    );
}

export default function HotelsPage() {
    return (
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading hotels...</div>}>
            <HotelsContent />
        </Suspense>
    );
}
