import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FiArrowLeft, FiMapPin, FiCheck, FiDollarSign, FiHome } from "react-icons/fi";
import { BottomNav, HotelCard } from "@/app/components";
import { getCityBySlug, getAllCitySlugs } from "@/app/actions/cities";
import { searchHotels } from "@/app/actions/hotels";

import "../city.css";

interface CityPageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for popular cities
export async function generateStaticParams() {
    const slugs = await getAllCitySlugs();
    return slugs.map((slug) => ({ slug }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
    params,
}: CityPageProps): Promise<Metadata> {
    const { slug } = await params;
    const city = await getCityBySlug(slug);

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
    const { slug } = await params;
    const city = await getCityBySlug(slug);

    if (!city) {
        notFound();
    }

    const hotels = await searchHotels({ city: city.name });
    const t = await getTranslations("cityPage");
    const tCommon = await getTranslations("common");

    return (
        <>
            {/* Hero Section */}
            <section className="city-hero">
                <div
                    className={`city-hero-bg ${city.coverImage ? "" : "city-hero-gradient"}`}
                    style={
                        city.coverImage
                            ? { backgroundImage: `url(${city.coverImage})` }
                            : undefined
                    }
                />
                <div className="container">
                    <Link href="/hotels" className="city-back-link">
                        <FiArrowLeft /> {t("allHotels")}
                    </Link>
                    <h1 className="city-hero-title">
                        {t("hotelsIn", { city: city.name })}
                    </h1>
                    <p className="city-hero-subtitle">
                        <FiMapPin />
                        {t("propertiesFound", { count: city.hotelCount })}
                    </p>
                </div>
            </section>

            {/* City Description (SEO content) */}
            {city.description && (
                <section className="city-description container">
                    <p>{city.description}</p>
                </section>
            )}

            {/* Hotels Grid */}
            <main className="city-content container">
                <Suspense fallback={<div className="city-loading">{tCommon("loadingHotels")}</div>}>
                    {hotels.length === 0 ? (
                        <div className="city-empty-state">
                            <p>{t("noHotels")}</p>
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
            <section className="city-why-book">
                <h2 className="city-why-book-title">
                    {t("whyBook", { city: city.name })}
                </h2>
                <div className="city-features-grid container">
                    <div className="city-feature-card">
                        <div className="city-feature-icon">
                            <FiCheck />
                        </div>
                        <h3>{t("verifiedHotels")}</h3>
                        <p>{t("verifiedHotelsDesc")}</p>
                    </div>
                    <div className="city-feature-card">
                        <div className="city-feature-icon">
                            <FiDollarSign />
                        </div>
                        <h3>{t("bestPrices")}</h3>
                        <p>{t("bestPricesDesc")}</p>
                    </div>
                    <div className="city-feature-card">
                        <div className="city-feature-icon">
                            <FiHome />
                        </div>
                        <h3>{t("payAtHotel")}</h3>
                        <p>{t("payAtHotelDesc")}</p>
                    </div>
                </div>
            </section>

            <BottomNav />
        </>
    );
}
