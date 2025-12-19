"use client";

import { useTranslations } from "next-intl";
import { FaShieldAlt, FaTag, FaHotel, FaBolt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

type IconType = "verified" | "prices" | "hotel" | "instant";

interface WhyBookItem {
    iconType: IconType;
    titleKey: string;
    descKey: string;
}

interface WhyBookGridProps {
    items: WhyBookItem[];
}

const artImages: Record<IconType, string> = {
    verified: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop", // Abstract Luxury Dark
    prices: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop", // Gold/Financial
    hotel: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop", // Hotel Interior
    instant: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop", // Cyber/Fast
};

export function WhyBookGrid({ items }: WhyBookGridProps) {
    const t = useTranslations("home");

    return (
        <section className="why-book-section">
            <div className="section-header-center">
                <span className="subtitle-badge"><HiSparkles /> {t("whyUs.badge") || "The Zinu Standard"}</span>
                <h2 className="section-title-premium">{t("whyUs.title") || "Experiential Luxury"}</h2>
                <p className="section-desc-premium">{t("whyUs.subtitle") || "We don't just offer rooms; we curate moments. Discover why tailored perfection starts here."}</p>
            </div>

            <div className="art-grid">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`art-card art-card-${item.iconType}`}
                    >
                        <div
                            className="art-card-bg"
                            style={{ backgroundImage: `url(${artImages[item.iconType] || artImages.hotel})` }}
                        />
                        <div className="art-card-overlay" />

                        <div className="art-card-content">
                            <div className="art-icon-glass">
                                {{
                                    verified: <FaShieldAlt />,
                                    prices: <FaTag />,
                                    hotel: <FaHotel />,
                                    instant: <FaBolt />
                                }[item.iconType]}
                            </div>
                            <h3 className="art-title">{t(item.titleKey)}</h3>
                            <p className="art-desc">{t(item.descKey)}</p>
                        </div>

                        <div className="art-card-hover-reveal">
                            <span className="explore-text">Learn More</span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .why-book-section {
                    /* Padding handled by parent section now */
                }

                .section-header-center {
                    text-align: center;
                    margin-bottom: 4rem;
                    max-width: 800px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .subtitle-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--color-gold);
                    font-size: 0.875rem;
                    font-weight: 600;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .section-title-premium {
                    font-family: 'Playfair Display', serif;
                    font-size: 3.5rem;
                    color: white;
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                }

                .section-desc-premium {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1.1rem;
                    line-height: 1.8;
                }

                .art-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 1.5rem;
                }

                @media (min-width: 768px) {
                    .art-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1200px) {
                    .art-grid {
                        grid-template-columns: repeat(4, 1fr);
                        height: 500px; /* Fixed height for the strip */
                    }
                }

                .art-card {
                    position: relative;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    height: 400px;
                    isolation: isolate;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Desktop transformation to vertical stripes that expand */
                @media (min-width: 1200px) {
                    .art-card {
                        height: 100%;
                        flex: 1;
                        transition: flex 0.5s ease;
                    }
                     /* This grid layout doesn't use flex, so we use grid-template-columns or width */
                     /* Just keep simple grid for now to ensure stability, but make inner content react */
                }

                .art-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }

                .art-card-bg {
                    position: absolute;
                    inset: 0;
                    background-size: cover;
                    background-position: center;
                    transition: transform 0.8s ease;
                    z-index: -2;
                }

                .art-card:hover .art-card-bg {
                    transform: scale(1.1);
                }

                .art-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, 
                        #0A192F 0%, 
                        rgba(10, 25, 47, 0.8) 40%, 
                        rgba(10, 25, 47, 0.4) 100%);
                    z-index: -1;
                    transition: opacity 0.5s ease;
                }

                .art-card:hover .art-card-overlay {
                    opacity: 0.9; 
                    background: linear-gradient(to top, 
                        #E63946 0%, 
                        rgba(230, 57, 70, 0.8) 50%, 
                        rgba(10, 25, 47, 0.2) 100%);
                }
                
                .art-card-content {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 2.5rem;
                    transform: translateY(0);
                    transition: transform 0.5s ease;
                }

                .art-card:hover .art-card-content {
                    transform: translateY(-20px);
                }

                .art-icon-glass {
                    width: 64px;
                    height: 64px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }

                .art-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.75rem;
                    color: white;
                    margin-bottom: 0.75rem;
                }

                .art-desc {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 1rem;
                    line-height: 1.6;
                    opacity: 0.8;
                    transition: opacity 0.3s ease;
                }
                
                .art-card:hover .art-desc {
                    opacity: 1;
                    color: white;
                }

                .art-card-hover-reveal {
                    position: absolute;
                    bottom: 1.5rem;
                    left: 2.5rem;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.5s ease;
                }

                .art-card:hover .art-card-hover-reveal {
                    opacity: 1;
                    transform: translateY(0);
                }

                .explore-text {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    border-bottom: 1px solid white;
                    padding-bottom: 2px;
                }

                @media (max-width: 640px) {
                    .section-title-premium {
                        font-size: 2.5rem;
                    }
                    
                    .art-card {
                        height: 350px;
                    }
                }
            `}</style>
        </section>
    );
}
