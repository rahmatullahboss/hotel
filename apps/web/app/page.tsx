import { BottomNav, SearchForm, Footer } from "./components";
import { WhyBookGrid } from "./components/WhyBook";
import { CitySelectorWrapper } from "./components/CitySelectorWrapper";
import { FirstBookingBannerWrapper } from "./components/FirstBookingBannerWrapper";
import { AppDownloadSection } from "./components/AppDownloadSection";
import { MemberBenefits } from "./components/MemberBenefits";
import { getPopularCities } from "./actions/cities";
import { getTranslations } from "next-intl/server";
import { FiCheck, FiStar, FiMail } from "react-icons/fi";
import Link from "next/link";

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch cities from database
  const cities = await getPopularCities(8);
  // Translations loaded for future use
  const _t = await getTranslations("home");

  const whyBookItems = [
    { iconType: "verified" as const, titleKey: "verifiedProperties", descKey: "verifiedDesc" },
    { iconType: "prices" as const, titleKey: "bestPrices", descKey: "bestPricesDesc" },
    { iconType: "hotel" as const, titleKey: "payAtHotel", descKey: "payAtHotelDesc" },
    { iconType: "instant" as const, titleKey: "instantBooking", descKey: "instantBookingDesc" },
  ];

  return (
    <>
      <div className="luxstay-landing">
        {/* Hero Section with Search Card */}
        <section className="luxstay-hero">
          <div className="luxstay-hero-bg" />
          <div className="luxstay-hero-overlay" />

          <div className="luxstay-hero-content">
            <div className="luxstay-hero-grid">
              {/* Left: Search Card */}
              <div className="luxstay-search-card">
                <div className="luxstay-verified-badge">
                  <FiCheck className="luxstay-verified-icon" />
                  <span>Verified Luxury</span>
                </div>

                <h1 className="luxstay-search-title">
                  Find Your Next <br />
                  <span className="luxstay-accent">Luxury Escape</span>
                </h1>

                <p className="luxstay-search-subtitle">
                  Experience extraordinary stays in 120+ countries with exclusive member deals.
                </p>

                <SearchForm />
              </div>

              {/* Right: Floating Member Info */}
              <div className="luxstay-hero-right">
                <div className="luxstay-member-card">
                  <div className="luxstay-member-badge">
                    <FiStar className="luxstay-star-icon" />
                    <span>Member Favorite</span>
                  </div>
                  <p className="luxstay-member-text">
                    Rated #1 for honeymoon destinations in 2024.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="luxstay-content">
          {/* Trust Signals */}
          <section className="luxstay-trust-section">
            <div className="container">
              <WhyBookGrid items={whyBookItems} />
            </div>
          </section>

          {/* First Booking Banner */}
          <div className="container" style={{ marginTop: "4rem", marginBottom: "4rem" }}>
            <FirstBookingBannerWrapper />
          </div>

          {/* City Selector - Using Original Database Data */}
          {cities.length > 0 && (
            <section className="luxstay-cities-section">
              <div className="container">
                <h2 className="luxstay-section-title">Popular Destinations</h2>
                <CitySelectorWrapper
                  cities={cities.map((c) => ({
                    name: c.name,
                    nameBn: c.nameBn || c.name,
                    slug: c.slug,
                    isPopular: c.isPopular,
                  }))}
                />
              </div>
            </section>
          )}

          {/* Promotional Banner */}
          <section className="luxstay-promo-section">
            <div className="luxstay-promo-bg" />
            <div className="luxstay-promo-glow" />

            <div className="luxstay-promo-content">
              <div className="luxstay-promo-text">
                <span className="luxstay-promo-badge">Limited Time Offer</span>
                <h2 className="luxstay-promo-title">
                  Save 20% on Luxury Suites <br />
                  This Winter
                </h2>
                <p className="luxstay-promo-desc">
                  Book your premium suite at participating hotels before January 31st and enjoy exclusive complimentary breakfast and spa access.
                </p>
                <div className="luxstay-promo-buttons">
                  <Link href="/hotels" className="luxstay-promo-btn-primary">
                    Get Deal
                  </Link>
                  <Link href="/about" className="luxstay-promo-btn-secondary">
                    Learn More
                  </Link>
                </div>
              </div>

              <div className="luxstay-promo-images">
                <div className="luxstay-promo-image-main">
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format"
                    alt="Luxury resort lounge"
                  />
                </div>
                <div className="luxstay-promo-image-small">
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289f49547?w=400&auto=format"
                    alt="Spa treatment"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Member Benefits Section */}
          <MemberBenefits />

          {/* Newsletter */}
          <section className="luxstay-newsletter-section">
            <div className="luxstay-newsletter-container">
              <div className="luxstay-newsletter-icon">
                <FiMail size={32} />
              </div>
              <h2 className="luxstay-newsletter-title">Unlock Secret Deals</h2>
              <p className="luxstay-newsletter-desc">
                Join 40,000+ travelers. Subscribe to get exclusive offers and updates directly to your inbox.
              </p>
              <form className="luxstay-newsletter-form">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="luxstay-newsletter-input"
                />
                <button type="submit" className="luxstay-newsletter-btn">
                  Subscribe
                </button>
              </form>
              <p className="luxstay-newsletter-privacy">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </section>

          {/* App Download */}
          <div style={{ marginTop: "0", background: "#F8FAFC" }}>
            <AppDownloadSection />
          </div>
        </main>

        {/* Footer (Desktop only) */}
        <Footer />

        {/* Bottom Navigation (Mobile only) */}
        <BottomNav />
      </div>

      {/* LuxStay Specific Styles */}
      <style>{`
        .luxstay-landing {
          background-color: #f0f9ff;
        }

        /* Hero Section */
        .luxstay-hero {
          position: relative;
          min-height: 85vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .luxstay-hero-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop') center/cover no-repeat;
          transform: scale(1.05);
        }

        .luxstay-hero-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .luxstay-hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .luxstay-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .luxstay-hero-grid {
            grid-template-columns: minmax(400px, 480px) 1fr;
            gap: 3rem;
          }
        }

        /* Search Card */
        .luxstay-search-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        @media (min-width: 768px) {
          .luxstay-search-card {
            padding: 2rem;
          }
        }

        .luxstay-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background: rgba(14, 165, 233, 0.08);
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0ea5e9;
          border: 1px solid rgba(14, 165, 233, 0.15);
          margin-bottom: 1.5rem;
        }

        .luxstay-verified-icon {
          color: #D4AF37;
          width: 14px;
          height: 14px;
        }

        .luxstay-search-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.875rem;
          font-weight: 900;
          color: #0c4a6e;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .luxstay-search-title {
            font-size: 2.25rem;
          }
        }

        .luxstay-accent {
          color: #0ea5e9;
        }

        .luxstay-search-subtitle {
          font-size: 0.9375rem;
          color: #0369a1;
          margin-bottom: 1.5rem;
          line-height: 1.6;
          font-weight: 500;
        }

        /* Hero Right - Member Card */
        .luxstay-hero-right {
          display: none;
          justify-content: flex-end;
          align-items: flex-end;
          height: 100%;
        }

        @media (min-width: 1024px) {
          .luxstay-hero-right {
            display: flex;
          }
        }

        .luxstay-member-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem;
          border-radius: 0.75rem;
          color: white;
          max-width: 280px;
        }

        .luxstay-member-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .luxstay-star-icon {
          color: #D4AF37;
        }

        .luxstay-member-text {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        /* Content Sections */
        .luxstay-content {
          padding-bottom: 0;
        }

        /* Trust Section */
        .luxstay-trust-section {
          background-color: #0c4a6e;
          padding: 5rem 0;
          color: white;
        }

        .luxstay-section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.875rem;
          font-weight: 900;
          color: #0c4a6e;
          margin-bottom: 2rem;
          text-align: center;
          letter-spacing: -0.02em;
        }

        /* Cities Section */
        .luxstay-cities-section {
          padding: 5rem 0;
          background-color: white;
        }

        /* Promotional Section */
        .luxstay-promo-section {
          position: relative;
          padding: 5rem 0;
          background: #0ea5e9;
          overflow: hidden;
        }

        .luxstay-promo-bg {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: rgba(255,255,255,0.05);
          transform: skewX(-12deg) translateX(5rem);
        }

        .luxstay-promo-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 16rem;
          height: 16rem;
          background: rgba(212, 175, 55, 0.2);
          border-radius: 50%;
          filter: blur(60px);
        }

        .luxstay-promo-content {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          align-items: center;
        }

        @media (min-width: 768px) {
          .luxstay-promo-content {
            flex-direction: row;
            justify-content: space-between;
          }
        }

        .luxstay-promo-text {
          max-width: 600px;
        }

        .luxstay-promo-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 0.25rem;
          border: 1px solid rgba(212, 175, 55, 0.3);
          margin-bottom: 1.5rem;
        }

        .luxstay-promo-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: white;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .luxstay-promo-title {
            font-size: 3rem;
          }
        }

        .luxstay-promo-desc {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .luxstay-promo-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .luxstay-promo-btn-primary {
          padding: 0.875rem 2rem;
          background: white;
          color: #135bec;
          font-weight: 700;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .luxstay-promo-btn-primary:hover {
          background: #f8fafc;
          transform: translateY(-2px);
        }

        .luxstay-promo-btn-secondary {
          padding: 0.875rem 2rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 700;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .luxstay-promo-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Promo Images */
        .luxstay-promo-images {
          display: none;
          position: relative;
        }

        @media (min-width: 768px) {
          .luxstay-promo-images {
            display: block;
          }
        }

        .luxstay-promo-image-main {
          width: 320px;
          height: 380px;
          border-radius: 1rem;
          overflow: hidden;
          transform: rotate(-3deg);
          border: 4px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .luxstay-promo-image-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .luxstay-promo-image-small {
          position: absolute;
          bottom: -1.5rem;
          left: -3rem;
          width: 200px;
          height: 200px;
          border-radius: 0.75rem;
          overflow: hidden;
          transform: rotate(6deg);
          border: 4px solid white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .luxstay-promo-image-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Newsletter Section */
        .luxstay-newsletter-section {
          padding: 5rem 0;
          background: #f6f6f8;
        }

        .luxstay-newsletter-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
        }

        .luxstay-newsletter-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          border-radius: 50%;
          margin-bottom: 1.5rem;
        }

        .luxstay-newsletter-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.875rem;
          font-weight: 900;
          color: #0c4a6e;
          margin-bottom: 1rem;
        }

        .luxstay-newsletter-desc {
          font-size: 1.125rem;
          color: #0369a1;
          margin-bottom: 2rem;
        }

        .luxstay-newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 480px;
          margin: 0 auto;
        }

        @media (min-width: 640px) {
          .luxstay-newsletter-form {
            flex-direction: row;
          }
        }

        .luxstay-newsletter-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border-radius: 0.5rem;
          border: 1px solid #e7ebf3;
          background: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .luxstay-newsletter-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .luxstay-newsletter-btn {
          padding: 0.875rem 2rem;
          background: #0c4a6e;
          color: white;
          font-weight: 700;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .luxstay-newsletter-btn:hover {
          background: #000;
          transform: translateY(-1px);
        }

        .luxstay-newsletter-privacy {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 1rem;
        }
      `}</style>
    </>
  );
}
