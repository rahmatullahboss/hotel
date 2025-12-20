"use client";

import { useTranslations } from "next-intl";
import { FiPercent, FiGift, FiStar, FiClock, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export function MemberBenefits() {
    const t = useTranslations("memberBenefits");

    const benefits = [
        {
            icon: FiPercent,
            title: t("benefit1Title"),
            description: t("benefit1Desc"),
            accent: "#E63946",
        },
        {
            icon: FiGift,
            title: t("benefit2Title"),
            description: t("benefit2Desc"),
            accent: "#10B981",
        },
        {
            icon: FiStar,
            title: t("benefit3Title"),
            description: t("benefit3Desc"),
            accent: "#F59E0B",
        },
        {
            icon: FiClock,
            title: t("benefit4Title"),
            description: t("benefit4Desc"),
            accent: "#6366F1",
        },
    ];

    return (
        <section className="member-benefits">
            <div className="container">
                {/* Left Content */}
                <div className="benefits-content">
                    <span className="overline">{t("badge")}</span>
                    <h2 className="title">{t("title")}</h2>
                    <p className="subtitle">{t("subtitle")}</p>

                    <Link href="#" className="cta-link">
                        Download the App <FiArrowRight />
                    </Link>
                </div>

                {/* Right Grid */}
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-card">
                            <div
                                className="icon-box"
                                style={{ backgroundColor: benefit.accent }}
                            >
                                <benefit.icon size={22} />
                            </div>
                            <div className="card-content">
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .member-benefits {
                    padding: 6rem 0;
                    background: #0F172A;
                    color: white;
                }

                .member-benefits .container {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 4rem;
                    align-items: center;
                }

                .benefits-content {
                    padding-right: 2rem;
                }

                .overline {
                    display: inline-block;
                    color: #D4AF37;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 1rem;
                }

                .title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.75rem;
                    font-weight: 700;
                    line-height: 1.2;
                    margin-bottom: 1.25rem;
                }

                .subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 1.05rem;
                    line-height: 1.7;
                    margin-bottom: 2rem;
                }

                .cta-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #E63946;
                    font-weight: 600;
                    font-size: 1rem;
                    text-decoration: none;
                    transition: gap 0.2s ease;
                }

                .cta-link:hover {
                    gap: 0.75rem;
                }

                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .benefit-card {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    transition: background 0.2s ease, border-color 0.2s ease;
                }

                .benefit-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .icon-box {
                    flex-shrink: 0;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .card-content h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.35rem;
                }

                .card-content p {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                @media (max-width: 1024px) {
                    .member-benefits .container {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }

                    .benefits-content {
                        text-align: center;
                        padding-right: 0;
                    }

                    .title {
                        font-size: 2.25rem;
                    }
                }

                @media (max-width: 640px) {
                    .member-benefits {
                        padding: 4rem 0;
                    }

                    .benefits-grid {
                        grid-template-columns: 1fr;
                    }

                    .title {
                        font-size: 1.875rem;
                    }
                }
            `}</style>
        </section>
    );
}
