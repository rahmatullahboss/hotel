import { BottomNav, SearchForm, HotelCard } from "./components";
import { getFeaturedHotels } from "./actions/hotels";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  // Fetch real hotels from database
  const featuredHotels = await getFeaturedHotels(4);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const whyBookItems = [
    { icon: "✓", titleKey: "verifiedProperties", descKey: "verifiedDesc" },
    { icon: "💰", titleKey: "bestPrices", descKey: "bestPricesDesc" },
    { icon: "🏨", titleKey: "payAtHotel", descKey: "payAtHotelDesc" },
    { icon: "⚡", titleKey: "instantBooking", descKey: "instantBookingDesc" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">{t("heroTitle")}</h1>
        <p className="hero-subtitle">
          {t("heroSubtitle")}
        </p>
      </section>

      {/* Main Content */}
      <main className="container page-content" style={{ marginTop: "-2rem" }}>
        {/* Search Form */}
        <SearchForm />

        {/* Featured Hotels */}
        <section style={{ marginTop: "3rem" }}>
          <div className="section-header">
            <h2 className="section-title">{t("featuredHotels")}</h2>
            <a href="/hotels" className="section-link">
              {tCommon("viewAll")}
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
                {t("noHotels")}
              </div>
            )}
          </div>
        </section>

        {/* Why Vibe */}
        <section style={{ marginTop: "3rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            {t("whyBook")}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {whyBookItems.map((item) => (
              <div
                key={item.titleKey}
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
                  {t(item.titleKey)}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                  }}
                >
                  {t(item.descKey)}
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
