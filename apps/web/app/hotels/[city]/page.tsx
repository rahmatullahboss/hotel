import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import { BottomNav, HotelCard } from "../../components";
import { getCityBySlug, getAllCitySlugs } from "../../actions/cities";
import { searchHotels } from "../../actions/hotels";

interface CityPageProps {
    params: Promise<{ city: string }>;
}

// Generate static params for popular cities
export async function generateStaticParams() {
    const slugs = await getAllCitySlugs();
    return slugs.map((city) => ({ city }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
    params,
}: CityPageProps): Promise<Metadata> {
    const { city: citySlug } = await params;
    const city = await getCityBySlug(citySlug);

    if (!city) {
        return {
            title: "City Not Found | Vibe Hotels",
        };
    }

    return {
        title: city.metaTitle || `Hotels in ${city.name} | Vibe Hotels`,
        description:
            city.metaDescription ||
            `Find the best hotels in ${city.name}. Book verified hotels at great prices with free cancellation and pay at hotel options.`,
        openGraph: {
            title: `Hotels in ${city.name} | Vibe Hotels`,
            description: `Discover ${city.hotelCount}+ verified hotels in ${city.name}. Best prices guaranteed.`,
            images: city.coverImage ? [city.coverImage] : [],
        },
    };
}

export default async function CityPage({ params }: CityPageProps) {
    const { city: citySlug } = await params;
    const city = await getCityBySlug(citySlug);

    if (!city) {
        notFound();
    }

    const hotels = await searchHotels({ city: city.name });
    const t = await getTranslations("cityPage");
    const tCommon = await getTranslations("common");

    return (
        <>
            {/* Hero Section */}
            <section
                className="city-hero"
                style={{
                    background: city.coverImage
                        ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${city.coverImage})`
                        : "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "2rem 1rem 3rem",
                    color: "white",
                    minHeight: "200px",
                }}
            >
                <div className="container">
                    <Link
                        href="/hotels"
                        style={{
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                            opacity: 0.9,
                        }}
                    >
                        <FiArrowLeft /> {t("allHotels")}
                    </Link>
                    <h1
                        style={{
                            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                            fontWeight: 700,
                            marginBottom: "0.5rem",
                        }}
                    >
                        {t("hotelsIn", { city: city.name })}
                    </h1>
                    <p
                        style={{
                            fontSize: "1rem",
                            opacity: 0.9,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <FiMapPin />
                        {t("propertiesFound", { count: city.hotelCount })}
                    </p>
                </div>
            </section>

            {/* City Description (SEO content) */}
            {city.description && (
                <section
                    className="container"
                    style={{ padding: "1.5rem 1rem 0" }}
                >
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            fontSize: "0.95rem",
                        }}
                    >
                        {city.description}
                    </p>
                </section>
            )}

            {/* Hotels Grid */}
            <main className="container page-content" style={{ paddingTop: "1.5rem" }}>
                <Suspense
                    fallback={
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem",
                            }}
                        >
                            {tCommon("loadingHotels")}
                        </div>
                    }
                >
                    {hotels.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <p style={{ marginBottom: "1rem" }}>{t("noHotels")}</p>
                            <Link href="/hotels" className="btn btn-primary">
                                {t("browseAllHotels")}
                            </Link>
                        </div>
                    ) : (
                        <div className="hotel-grid">
                            {hotels.map((hotel) => (
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
                            ))}
                        </div>
                    )}
                </Suspense>
            </main>

            {/* SEO Content Section */}
            <section
                className="container"
                style={{
                    padding: "2rem 1rem 6rem",
                }}
            >
                <h2
                    style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                    }}
                >
                    {t("whyBook", { city: city.name })}
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    <div
                        className="card"
                        style={{ padding: "1rem", textAlign: "center" }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                            ✓
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                            {t("verifiedHotels")}
                        </h3>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {t("verifiedHotelsDesc")}
                        </p>
                    </div>
                    <div
                        className="card"
                        style={{ padding: "1rem", textAlign: "center" }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                            💰
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                            {t("bestPrices")}
                        </h3>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {t("bestPricesDesc")}
                        </p>
                    </div>
                    <div
                        className="card"
                        style={{ padding: "1rem", textAlign: "center" }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                            🏨
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                            {t("payAtHotel")}
                        </h3>
                        <p
                            style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {t("payAtHotelDesc")}
                        </p>
                    </div>
                </div>
            </section>

            <BottomNav />
        </>
    );
}
