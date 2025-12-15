import { BottomNav, SearchForm, HotelCard, Footer } from "./components";
import { WhyBookGrid } from "./components/WhyBook";
import { CitySelectorWrapper } from "./components/CitySelectorWrapper";
import { FirstBookingBannerWrapper } from "./components/FirstBookingBannerWrapper";
import { getFeaturedHotels } from "./actions/hotels";
import { getPopularCities } from "./actions/cities";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  // Fetch real hotels and cities from database
  const [featuredHotels, cities] = await Promise.all([
    getFeaturedHotels(4),
    getPopularCities(8),
  ]);
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const whyBookItems = [
    { iconType: "verified" as const, titleKey: "verifiedProperties", descKey: "verifiedDesc" },
    { iconType: "prices" as const, titleKey: "bestPrices", descKey: "bestPricesDesc" },
    { iconType: "hotel" as const, titleKey: "payAtHotel", descKey: "payAtHotelDesc" },
    { iconType: "instant" as const, titleKey: "instantBooking", descKey: "instantBookingDesc" },
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

        {/* First Booking Offer Banner - Only shows to eligible first-time users */}
        <FirstBookingBannerWrapper />

        {/* City Selector - Browse by location */}
        {cities.length > 0 && (
          <section style={{ marginTop: "2rem" }}>
            <CitySelectorWrapper
              cities={cities.map((c) => ({
                name: c.name,
                nameBn: c.nameBn || c.name,
                slug: c.slug,
                isPopular: c.isPopular,
              }))}
            />
          </section>
        )}

        {/* Featured Hotels */}
        <section style={{ marginTop: "2rem" }}>
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

        {/* Why Vibe - Enhanced for desktop */}
        <section style={{ marginTop: "3rem", marginBottom: "0" }}>
          <h2 className="section-title" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            {t("whyBook")}
          </h2>

          <WhyBookGrid items={whyBookItems} />
        </section>
      </main>

      {/* Footer (Desktop only) */}
      <Footer />

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />
    </>
  );
}
