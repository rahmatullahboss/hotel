"use client";

import { useTranslations } from "next-intl";
import { FaShieldAlt, FaTag, FaHotel, FaBolt, FaCheck, FaStar } from "react-icons/fa";
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

export function WhyBookGrid({ items }: WhyBookGridProps) {
    const t = useTranslations("home");

    const getIcon = (type: IconType) => {
        switch (type) {
            case "verified": return <FaShieldAlt className="benefit-icon" />;
            case "prices": return <FaTag className="benefit-icon" />;
            case "hotel": return <FaHotel className="benefit-icon" />;
            case "instant": return <FaBolt className="benefit-icon" />;
        }
    };

    const promises = [
        { icon: <FaShieldAlt />, text: t("whyUs.promise1") || "100% Verified Hotels" },
        { icon: <FaTag />, text: t("whyUs.promise2") || "Best Price Guarantee" },
        { icon: <FaStar />, text: t("whyUs.promise3") || "24/7 Customer Support" },
    ];

    return (
        <section className="why-book-section">
            <div className="why-book-wrapper">
                {/* Left Side - Brand Promise */}
                <div className="promise-column">
                    <div className="promise-header">
                        <span className="promise-badge">
                            <HiSparkles /> {t("whyUs.badge") || "Our Promise"}
                        </span>
                        <h2 className="promise-title">{t("whyUs.title") || "Book with Confidence"}</h2>
                        <p className="promise-subtitle">{t("whyUs.subtitle") || "Your trusted partner for hotel bookings in Bangladesh"}</p>
                    </div>

                    <div className="promise-list">
                        {promises.map((promise, index) => (
                            <div
                                key={index}
                                className="promise-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="promise-icon">{promise.icon}</div>
                                <span className="promise-text">{promise.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="cta-wrapper">
                        <a href="/hotels" className="explore-btn">
                            {t("whyUs.exploreBtn") || "Explore Hotels"} →
                        </a>
                    </div>
                </div>

                {/* Right Side - Benefit Cards */}
                <div className="benefits-column">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="benefit-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`benefit-icon-wrapper icon-${item.iconType}`}>
                                {getIcon(item.iconType)}
                            </div>
                            <div className="benefit-content">
                                <h3 className="benefit-title">{t(item.titleKey)}</h3>
                                <p className="benefit-desc">{t(item.descKey)}</p>
                            </div>
                            <div className="benefit-check">
                                <FaCheck />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .why-book-section {
                    padding: 4rem 1.5rem;
                    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
                }

                .why-book-wrapper {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 3rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    align-items: start;
                }

                /* Promise Column - Left */
                .promise-column {
                    padding: 2.5rem;
                    background: linear-gradient(145deg, #1D3557 0%, #2a4a6e 100%);
                    border-radius: 24px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .promise-column::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -30%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }

                .promise-header {
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .promise-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 1rem;
                    background: rgba(230, 57, 70, 0.2);
                    border: 1px solid rgba(230, 57, 70, 0.3);
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #ff6b7a;
                    letter-spacing: 0.02em;
                    margin-bottom: 1rem;
                }

                .promise-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                    letter-spacing: -0.02em;
                }

                .promise-subtitle {
                    font-size: 0.95rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    line-height: 1.5;
                }

                .promise-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }

                .promise-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    animation: fadeInUp 0.6s ease-out both;
                    transition: all 0.3s ease;
                }

                .promise-item:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateX(4px);
                }

                .promise-icon {
                    font-size: 1.25rem;
                    color: #E63946;
                }

                .promise-text {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.95);
                }

                .cta-wrapper {
                    position: relative;
                    z-index: 1;
                }

                .explore-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1.75rem;
                    background: #E63946;
                    color: white;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .explore-btn:hover {
                    background: #cf2f3c;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(230, 57, 70, 0.3);
                }

                /* Benefits Column - Right */
                .benefits-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .benefit-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.25rem 1.5rem;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.6s ease-out both;
                    cursor: default;
                    position: relative;
                }

                .benefit-card:hover {
                    transform: translateX(8px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                    border-color: rgba(230, 57, 70, 0.2);
                }

                .benefit-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .benefit-card:hover .benefit-icon-wrapper {
                    transform: scale(1.1);
                }

                .benefit-icon-wrapper :global(.benefit-icon) {
                    font-size: 1.25rem;
                }

                .icon-verified { 
                    background: linear-gradient(135deg, #2EC4B6 0%, #23a69a 100%);
                    color: white;
                }
                
                .icon-prices { 
                    background: linear-gradient(135deg, #FF9F1C 0%, #e88c14 100%);
                    color: white;
                }
                
                .icon-hotel { 
                    background: linear-gradient(135deg, #E63946 0%, #cf2f3c 100%);
                    color: white;
                }
                
                .icon-instant { 
                    background: linear-gradient(135deg, #70D6FF 0%, #5bc4eb 100%);
                    color: white;
                }

                .benefit-content {
                    flex: 1;
                }

                .benefit-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1D3557;
                    margin: 0 0 0.25rem 0;
                    letter-spacing: -0.01em;
                }

                .benefit-desc {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.5;
                }

                .benefit-check {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    flex-shrink: 0;
                    opacity: 0;
                    transform: scale(0.8);
                    transition: all 0.3s ease;
                }

                .benefit-card:hover .benefit-check {
                    opacity: 1;
                    transform: scale(1);
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 968px) {
                    .why-book-wrapper {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .promise-column {
                        padding: 2rem;
                    }
                }

                @media (max-width: 640px) {
                    .why-book-section {
                        padding: 3rem 1rem;
                    }

                    .promise-column {
                        padding: 1.5rem;
                    }

                    .promise-title {
                        font-size: 1.5rem;
                    }

                    .benefit-card {
                        padding: 1rem 1.25rem;
                    }

                    .benefit-icon-wrapper {
                        width: 42px;
                        height: 42px;
                    }
                }
            `}</style>
        </section>
    );
}
