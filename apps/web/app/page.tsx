import { BottomNav, SearchForm, Footer } from "./components";
import { WhyBookGrid } from "./components/WhyBook";
import { CitySelectorWrapper } from "./components/CitySelectorWrapper";
import { FirstBookingBannerWrapper } from "./components/FirstBookingBannerWrapper";
import { AppDownloadSection } from "./components/AppDownloadSection";
import { Testimonials } from "./components/Testimonials";
import { Newsletter } from "./components/Newsletter";
import { getPopularCities } from "./actions/cities";
import { getTranslations } from "next-intl/server";

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

  return (
    <>
      <div className="landing-page">
        {/* Helper Script to remove hotel grid data if present in hydration */}

        {/* Hero Section - Immersive Landing Page Style */}
        <section className="hero-section">
          <div className="hero-background">
            {/* Background image is handled via CSS or next/image in globals/component */}
            <div className="hero-overlay"></div>
          </div>

          <div className="hero-content container">
            <div className="hero-text-wrapper animated fadeInUp">
              <h1 className="hero-title">Luxury Redefined.</h1>
              <p className="hero-subtitle">
                Discover the art of luxury living in our exclusive properties. Experience the extraordinary.
              </p>
            </div>

            {/* Prominent Search Form - Centered and Elevated */}
            <div className="hero-search-wrapper animated fadeInUp delay-100">
              <SearchForm />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="page-content-wrapper">

          {/* Value Proposition / Trust Signals - Dark Mode Section */}
          <section style={{ backgroundColor: '#0A192F', padding: '6rem 0', color: 'white' }}>
            <div className="container">
              <WhyBookGrid items={whyBookItems} />
            </div>
          </section>

          {/* First Booking Offer Banner - Strategically placed */}
          <div className="container" style={{ marginTop: "4rem", marginBottom: "4rem" }}>
            <FirstBookingBannerWrapper />
          </div>

          {/* Popular Destinations - Highlight of the landing page */}
          {cities.length > 0 && (
            <section className="destinations-section">
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



          {/* Lead Capture - Newsletter - Dark Section */}
          <section style={{ background: '#0A192F', padding: '6rem 0' }}>
            <div className="container">
              <Newsletter />
            </div>
          </section>

          {/* App Download - Full Width */}
          <div style={{ marginTop: "0" }}>
            <AppDownloadSection />
          </div>

        </main>

        {/* Footer (Desktop only) */}
        <Footer />

        {/* Bottom Navigation (Mobile only) */}
        <BottomNav />
      </div>

      {/* Page Specific Styles */}
      <style>{`
        /* Cinematic Hero Styles */
        .landing-page {
          background-color: #fff;
        }

        .hero-section {
          position: relative;
          min-height: 100vh; /* Full screen immersive */
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop') center/cover no-repeat fixed;
          margin-bottom: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10, 25, 47, 0.4) 0%, rgba(10, 25, 47, 0.7) 100%);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          text-align: center;
          padding-top: 80px;
        }

        .hero-text-wrapper {
          margin-bottom: 4rem;
          color: white;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .hero-title {
          font-family: 'Playfair Display', serif; /* Elegant Serif */
          font-size: 5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 400;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
          letter-spacing: 0.02em;
        }

        .destinations-section {
          padding: 6rem 0;
          background-color: #FAFAFA;
        }

        .page-content-wrapper {
          padding-bottom: 80px; /* For mobile nav */
        }

        /* Animations */
        .animated { animation-duration: 1s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fadeInUp { animation-name: fadeInUp; }
        .delay-100 { animation-delay: 0.2s; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 85vh;
            background-attachment: scroll; 
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .hero-subtitle {
             font-size: 1rem;
             padding: 0 1rem;
          }
        }
      `}</style>
    </>
  );
}
