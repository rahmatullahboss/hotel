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
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Find Your Perfect Stay</h1>
        <p className="hero-subtitle">
          Book verified hotels at the best prices in Bangladesh
        </p>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: "1rem", marginTop: "-2rem" }}>
        {/* Search Form */}
        <SearchForm />

        {/* Featured Hotels */}
        <section style={{ marginTop: "3rem" }}>
          <div className="section-header">
            <h2 className="section-title">Featured Hotels</h2>
            <a href="/hotels" className="section-link">
              View all →
            </a>
          </div>

          {/* Responsive Hotel Grid */}
          <div className="hotel-grid">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} {...hotel} />
            ))}
          </div>
        </section>

        {/* Why Vibe */}
        <section style={{ marginTop: "3rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            Why Book with Vibe?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              { icon: "✓", title: "Verified Properties", desc: "All hotels personally inspected for quality" },
              { icon: "💰", title: "Best Prices", desc: "Guaranteed lowest rates or money back" },
              { icon: "🏨", title: "Pay at Hotel", desc: "No advance payment needed" },
              { icon: "⚡", title: "Instant Booking", desc: "Confirm your stay in just 3 clicks" },
            ].map((item) => (
              <div
                key={item.title}
                className="card"
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </>
  );
}

