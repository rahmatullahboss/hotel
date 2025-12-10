"use client";

import { BottomNav, SearchForm, HotelCard } from "./components";

// Mock featured hotels data
const featuredHotels = [
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
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Find Your Perfect Stay</h1>
        <p className="hero-subtitle">
          Book verified hotels at the best prices
        </p>
      </section>

      {/* Search Form */}
      <main style={{ padding: "1rem", marginTop: "-2rem" }}>
        <SearchForm />

        {/* Featured Hotels */}
        <section style={{ marginTop: "2rem" }}>
          <div className="section-header">
            <h2 className="section-title">Featured Hotels</h2>
            <a href="/hotels" className="section-link">
              View all →
            </a>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </section>

        {/* Why Vibe */}
        <section style={{ marginTop: "2rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>
            Why Book with Vibe?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1rem",
            }}
          >
            {[
              { icon: "✓", title: "Verified Properties", desc: "All hotels personally inspected" },
              { icon: "💰", title: "Best Prices", desc: "Guaranteed lowest rates" },
              { icon: "🏨", title: "Pay at Hotel", desc: "No advance payment needed" },
              { icon: "⚡", title: "Instant Booking", desc: "Confirm in 3 clicks" },
            ].map((item) => (
              <div
                key={item.title}
                className="card"
                style={{
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
