"use client";

import { useTranslations } from "next-intl";
import { FiPercent, FiGift, FiStar, FiClock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export function MemberBenefits() {
    const t = useTranslations("memberBenefits");

    const benefits = [
        {
            icon: FiPercent,
            title: t("benefit1Title"),
            description: t("benefit1Desc"),
            color: "#E63946",
        },
        {
            icon: FiGift,
            title: t("benefit2Title"),
            description: t("benefit2Desc"),
            color: "#10B981",
        },
        {
            icon: FiStar,
            title: t("benefit3Title"),
            description: t("benefit3Desc"),
            color: "#F59E0B",
        },
        {
            icon: FiClock,
            title: t("benefit4Title"),
            description: t("benefit4Desc"),
            color: "#6366F1",
        },
    ];

    return (
        <section className="member-benefits">
            <div className="container">
                <div className="benefits-header">
                    <span className="benefits-badge">
                        <HiSparkles /> {t("badge")}
                    </span>
                    <h2 className="benefits-title">{t("title")}</h2>
                    <p className="benefits-subtitle">{t("subtitle")}</p>
                </div>

                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-card">
                            <div
                                className="benefit-icon"
                                style={{ backgroundColor: `${benefit.color}15`, color: benefit.color }}
                            >
                                <benefit.icon size={24} />
                            </div>
                            <h3 className="benefit-title">{benefit.title}</h3>
                            <p className="benefit-desc">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .member-benefits {
                    padding: 5rem 0;
                    background: linear-gradient(135deg, #0A192F 0%, #1D3557 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .member-benefits::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 50%;
                    height: 100%;
                    background: radial-gradient(circle at 70% 50%, rgba(230, 57, 70, 0.1), transparent 60%);
                    pointer-events: none;
                }

                .benefits-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .benefits-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #D4AF37;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 1rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    border-radius: 99px;
                    background: rgba(212, 175, 55, 0.05);
                }

                .benefits-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .benefits-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }

                .benefit-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .benefit-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .benefit-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.25rem;
                }

                .benefit-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }

                .benefit-desc {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                @media (max-width: 1024px) {
                    .benefits-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .benefits-grid {
                        grid-template-columns: 1fr;
                    }

                    .benefits-title {
                        font-size: 2rem;
                    }

                    .benefit-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </section>
    );
}
