import { BottomNav, SearchForm, HotelCard } from "./components";
import { getFeaturedHotels } from "./actions/hotels";

export default async function HomePage() {
  // Fetch real hotels from database
  const featuredHotels = await getFeaturedHotels(4);

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
      <main className="container page-content" style={{ marginTop: "-2rem" }}>
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
            {featuredHotels.length > 0 ? (
              featuredHotels.map((hotel) => (
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
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
                No hotels available at the moment. Check back soon!
              </div>
            )}
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
