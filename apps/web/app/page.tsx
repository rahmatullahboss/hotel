import { BottomNav, SearchForm, Footer } from "./components";
import { WhyBookGrid } from "./components/WhyBook";
import { CitySelectorWrapper } from "./components/CitySelectorWrapper";
import { FirstBookingBannerWrapper } from "./components/FirstBookingBannerWrapper";
import { AppDownloadSection } from "./components/AppDownloadSection";
import { MemberBenefits } from "./components/MemberBenefits";
import { Newsletter } from "./components/Newsletter";
import { getPopularCities } from "./actions/cities";
import { getTranslations } from "next-intl/server";
import { FiMapPin, FiCheck, FiStar } from "react-icons/fi";
import Link from "next/link";

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch only cities, no hotels needed for landing page
  const cities = await getPopularCities(8);

  const t = await getTranslations("home");

  const whyBookItems = [
    { iconType: "verified" as const, titleKey: "verifiedProperties", descKey: "verifiedDesc" },
    { iconType: "prices" as const, titleKey: "bestPrices", descKey: "bestPricesDesc" },
    { iconType: "hotel" as const, titleKey: "payAtHotel", descKey: "payAtHotelDesc" },
    { iconType: "instant" as const, titleKey: "instantBooking", descKey: "instantBookingDesc" },
  ];

  // Popular destinations data
  const popularDestinations = [
    { name: "Dhaka", image: "/images/destinations/dhaka.webp", hotelCount: 340 },
    { name: "Cox's Bazar", image: "/images/destinations/cox-bazar.webp", hotelCount: 210 },
    { name: "Chittagong", image: "/images/destinations/chittagong.webp", hotelCount: 180 },
    { name: "Sylhet", image: "/images/destinations/sylhet.webp", hotelCount: 150 },
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
          {/* Trust Signals - Dark Section */}
          <section className="luxstay-trust-section">
            <div className="container">
              <WhyBookGrid items={whyBookItems} />
            </div>
          </section>

          {/* First Booking Banner */}
          <div className="container" style={{ marginTop: "4rem", marginBottom: "4rem" }}>
            <FirstBookingBannerWrapper />
          </div>

          {/* Popular Destinations */}
          <section className="luxstay-destinations-section">
            <div className="container">
              <h2 className="luxstay-section-title">Popular Destinations</h2>

              <div className="luxstay-destinations-grid">
                {popularDestinations.map((dest) => (
                  <Link
                    key={dest.name}
                    href={`/hotels?city=${encodeURIComponent(dest.name)}`}
                    className="luxstay-destination-card"
                  >
                    <div
                      className="luxstay-destination-image"
                      style={{ backgroundImage: `url(${dest.image})` }}
                    />
                    <div className="luxstay-destination-overlay" />
                    <div className="luxstay-destination-info">
                      <h3 className="luxstay-destination-name">{dest.name}</h3>
                      <p className="luxstay-destination-count">{dest.hotelCount} Hotels</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

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

          {/* City Selector - Original Functionality */}
          {cities.length > 0 && (
            <section className="luxstay-cities-section">
              <div className="container" style={{ maxWidth: '1400px' }}>
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

          {/* Member Benefits Section */}
          <MemberBenefits />

          {/* Newsletter */}
          <section className="luxstay-newsletter-section">
            <div className="luxstay-newsletter-container">
              <div className="luxstay-newsletter-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
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
          background-color: #fff;
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
          max-width: 1400px;
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
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        @media (min-width: 768px) {
          .luxstay-search-card {
            padding: 2.5rem;
          }
        }

        .luxstay-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(230, 57, 70, 0.08);
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-primary);
          border: 1px solid rgba(230, 57, 70, 0.15);
          margin-bottom: 1.5rem;
        }

        .luxstay-verified-icon {
          color: #D4AF37;
        }

        .luxstay-search-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 900;
          color: #0d121b;
          line-height: 1.2;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        @media (min-width: 768px) {
          .luxstay-search-title {
            font-size: 2.5rem;
          }
        }

        .luxstay-accent {
          color: var(--color-primary);
        }

        .luxstay-search-subtitle {
          font-size: 0.95rem;
          color: #4c669a;
          margin-bottom: 2rem;
          line-height: 1.6;
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
          padding: 1.25rem;
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

        .luxstay-trust-section {
          background-color: #0A192F;
          padding: 6rem 0;
          color: white;
        }

        .luxstay-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 900;
          color: #0d121b;
          margin-bottom: 2.5rem;
          text-align: center;
          letter-spacing: -0.02em;
        }

        /* Popular Destinations */
        .luxstay-destinations-section {
          padding: 5rem 0;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }

        .luxstay-destinations-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .luxstay-destinations-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
        }

        .luxstay-destination-card {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          text-decoration: none;
        }

        .luxstay-destination-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .luxstay-destination-card:hover .luxstay-destination-image {
          transform: scale(1.1);
        }

        .luxstay-destination-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
        }

        .luxstay-destination-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          color: white;
        }

        .luxstay-destination-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .luxstay-destination-count {
          font-size: 0.875rem;
          opacity: 0;
          transform: translateY(0.5rem);
          transition: all 0.3s ease;
        }

        .luxstay-destination-card:hover .luxstay-destination-count {
          opacity: 0.8;
          transform: translateY(0);
        }

        /* Promotional Section */
        .luxstay-promo-section {
          position: relative;
          padding: 5rem 0;
          background: var(--color-primary);
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
          max-width: 1400px;
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
          padding: 0.5rem 0.75rem;
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 0.25rem;
          border: 1px solid rgba(212, 175, 55, 0.3);
          margin-bottom: 1.5rem;
        }

        .luxstay-promo-title {
          font-family: 'Playfair Display', serif;
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
          font-size: 1.1rem;
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
          color: var(--color-primary);
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

        /* Cities Section */
        .luxstay-cities-section {
          padding: 5rem 0;
          background-color: #FAFAFA;
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
          background: rgba(230, 57, 70, 0.1);
          color: var(--color-primary);
          border-radius: 50%;
          margin-bottom: 1.5rem;
        }

        .luxstay-newsletter-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 900;
          color: #0d121b;
          margin-bottom: 1rem;
        }

        .luxstay-newsletter-desc {
          font-size: 1.1rem;
          color: #4c669a;
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
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .luxstay-newsletter-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1);
        }

        .luxstay-newsletter-btn {
          padding: 0.875rem 2rem;
          background: #0d121b;
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
