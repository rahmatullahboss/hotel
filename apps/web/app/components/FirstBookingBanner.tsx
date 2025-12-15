"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface FirstBookingBannerProps {
    userId?: string;
}

/**
 * First Booking Promotional Banner
 * Shows 20% OFF offer for first-time bookers
 * Only visible to authenticated users who haven't made a booking yet
 */
export function FirstBookingBanner({ userId }: FirstBookingBannerProps) {
    const t = useTranslations("home");
    const [isEligible, setIsEligible] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const checkEligibility = async () => {
            try {
                const res = await fetch("/api/first-booking");
                if (res.ok) {
                    const data = await res.json();
                    setIsEligible(data.eligible);
                }
            } catch (error) {
                console.error("Error checking first booking eligibility:", error);
            } finally {
                setLoading(false);
            }
        };

        checkEligibility();
    }, [userId]);

    // Don't show if not logged in, loading, or not eligible
    if (!userId || loading || !isEligible) {
        return null;
    }

    return (
        <section className="first-booking-banner">
            <div className="banner-decoration banner-circle-1" />
            <div className="banner-decoration banner-circle-2" />

            <div className="banner-content">
                <span className="banner-badge">{t("promo.badge")}</span>
                <h3 className="banner-title">{t("promo.title")}</h3>
                <p className="banner-subtitle">
                    {t("promo.subtitle")}
                </p>
                <Link href="/hotels" className="banner-cta">
                    {t("promo.button")}
                </Link>
            </div>

            <div className="banner-emoji">🎉</div>

            <style jsx>{`
                .first-booking-banner {
                    position: relative;
                    background: var(--color-secondary, #1D3557);
                    border-radius: 1.5rem;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    overflow: hidden;
                    margin-bottom: 2rem;
                    box-shadow: 0 8px 24px rgba(29, 53, 87, 0.3);
                }

                .banner-decoration {
                    position: absolute;
                    border-radius: 50%;
                }

                .banner-circle-1 {
                    width: 7rem;
                    height: 7rem;
                    background: rgba(255, 255, 255, 0.1);
                    top: -2rem;
                    right: -2rem;
                }

                .banner-circle-2 {
                    width: 5rem;
                    height: 5rem;
                    background: rgba(230, 57, 70, 0.2);
                    bottom: -1rem;
                    left: -1rem;
                }

                .banner-content {
                    position: relative;
                    z-index: 10;
                }

                .banner-badge {
                    display: inline-block;
                    background: rgba(230, 57, 70, 0.2);
                    color: var(--color-primary, #E63946);
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .banner-title {
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0 0 0.25rem 0;
                }

                .banner-subtitle {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                    margin: 0 0 1rem 0;
                }

                .banner-cta {
                    display: inline-block;
                    background: var(--color-primary, #E63946);
                    color: white;
                    padding: 0.625rem 1.25rem;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    text-decoration: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 12px rgba(230, 57, 70, 0.4);
                }

                .banner-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(230, 57, 70, 0.5);
                }

                .banner-emoji {
                    font-size: 3rem;
                    position: relative;
                    z-index: 10;
                }

                @media (max-width: 480px) {
                    .first-booking-banner {
                        padding: 1rem;
                    }

                    .banner-title {
                        font-size: 1.125rem;
                    }

                    .banner-emoji {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </section>
    );
}
