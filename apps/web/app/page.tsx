import { BottomNav, SearchForm, HotelCard, Footer } from "./components";
import { WhyBookGrid } from "./components/WhyBook";
import { CitySelectorWrapper } from "./components/CitySelectorWrapper";
import { FirstBookingBannerWrapper } from "./components/FirstBookingBannerWrapper";
import { AppDownloadSection } from "./components/AppDownloadSection";
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
      {/* Hero Section - OYO Inspired */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content container">
          <h1 className="hero-title">{t("heroTitle")}</h1>
          <p className="hero-subtitle">
            {t("heroSubtitle")}
          </p>

          {/* Prominent Search Form */}
          <div className="hero-search-wrapper">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container page-content">

        {/* First Booking Offer Banner */}
        <div style={{ marginTop: "2rem" }}>
          <FirstBookingBannerWrapper />
        </div>

        {/* Why Vibe - Trust Bar (Moved Up) */}
        <section style={{ marginTop: "3rem" }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            {t("whyBook")}
          </h2>
          <WhyBookGrid items={whyBookItems} />
        </section>

        {/* City Selector - New Tile Design */}
        {cities.length > 0 && (
          <section style={{ marginTop: "4rem" }}>
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
        <section style={{ marginTop: "4rem" }}>
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
                  zinuCode={hotel.zinuCode}
                  category={hotel.category}
                />
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
                {t("noHotels")}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* App Download Section - Full Width */}
      <AppDownloadSection />

      {/* Footer (Desktop only) */}
      <Footer />

      {/* Bottom Navigation (Mobile only) */}
      <BottomNav />

    </>
  );
}
