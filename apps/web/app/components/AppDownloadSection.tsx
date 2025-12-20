"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FaApple, FaStar, FaShieldAlt, FaBolt, FaGift } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { GooglePlayLogo } from "./GooglePlayLogo";

export function AppDownloadSection() {
    const t = useTranslations("home");

    return (
        <section className="app-download-section">
            {/* Ambient Background */}
            <div className="ambient-glow" />

            <div className="container app-container">
                <div className="app-content">
                    <div className="premium-badge">
                        <HiSparkles /> <span>{t("appDownload.badge") || "The Future of Booking"}</span>
                    </div>

                    <h2 className="app-title">
                        {t("appDownload.title")}
                    </h2>

                    <p className="app-subtitle">
                        {t("appDownload.subtitle")}
                    </p>

                    <div className="stats-row">
                        <div className="stat-block">
                            <div className="stat-number">4.9<FaStar className="stat-star" /></div>
                            <div className="stat-label">App Store Rating</div>
                        </div>
                        <div className="stat-separator" />
                        <div className="stat-block">
                            <div className="stat-number">50K+</div>
                            <div className="stat-label">Trusted Travelers</div>
                        </div>
                    </div>

                    <div className="feature-list">
                        <div className="feature-item">
                            <div className="feature-icon"><FaBolt /></div>
                            <span>Instant Booking</span>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaGift /></div>
                            <span>Exclusive Rewards</span>
                        </div>
                    </div>

                    <div className="store-buttons">
                        <Link href="#" className="store-badge-link">
                            <img
                                src="/images/badges/google-play-badge.svg"
                                alt="Get it on Google Play"
                                className="store-badge"
                            />
                        </Link>
                        <Link href="#" className="store-badge-link">
                            <img
                                src="/images/badges/app-store-badge.svg"
                                alt="Download on the App Store"
                                className="store-badge"
                            />
                        </Link>
                    </div>
                </div>

                <div className="app-visual">
                    <div className="phone-glow" />
                    <div className="phone-mockup">
                        <div className="phone-notch" />
                        <div className="phone-screen bg-black">
                            {/* User provided screenshot */}
                            <img
                                src="/images/app-mockup.png"
                                alt="App Screenshot"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="floating-card glass-card-1">
                        <FaShieldAlt className="floating-icon" />
                        <div className="floating-text">
                            <strong>Secure Booking</strong>
                            <span>Bank-grade security</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .app-download-section {
                    position: relative;
                    background-color: #F8FAFC;
                    padding: 8rem 0;
                    margin-top: 0;
                    overflow: hidden;
                }

                .ambient-glow {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 60%;
                    height: 100%;
                    background: radial-gradient(circle at top right, rgba(230, 57, 70, 0.05), transparent 70%);
                    pointer-events: none;
                }

                .app-container {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 4rem;
                    position: relative;
                    z-index: 2;
                    align-items: center;
                }

                @media (min-width: 1024px) {
                    .app-container {
                        grid-template-columns: 1.2fr 1fr;
                        gap: 6rem;
                    }
                }

                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #E63946;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 2rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid rgba(230, 57, 70, 0.2);
                    border-radius: 99px;
                    background: rgba(230, 57, 70, 0.05);
                }

                .app-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: #1D3557;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                }
                
                .app-title :global(.text-gold) {
                    color: #E63946;
                    font-style: italic;
                }

                .app-subtitle {
                    color: #64748B;
                    font-size: 1.125rem;
                    line-height: 1.8;
                    margin-bottom: 3rem;
                    max-width: 500px;
                }

                .stats-row {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 3rem;
                    padding: 1.5rem;
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 1rem;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    width: fit-content;
                }

                .stat-block {
                    display: flex;
                    flex-direction: column;
                }

                .stat-number {
                    color: #1D3557;
                    font-size: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stat-star {
                    color: #F59E0B;
                    font-size: 1rem;
                }

                .stat-label {
                    color: #64748B;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .stat-separator {
                    width: 1px;
                    height: 40px;
                    background: #E2E8F0;
                }

                .feature-list {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 3rem;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #1D3557;
                    font-weight: 500;
                }

                .feature-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(230, 57, 70, 0.1);
                    color: #E63946;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                }

                .store-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    align-items: center;
                }

                .store-badge-link {
                    transition: transform 0.3s ease;
                }
                
                .store-badge-link:hover {
                    transform: translateY(-4px);
                }

                .store-badge {
                    height: 60px;
                    width: auto;
                }

                /* Mobile Mockup */
                .app-visual {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    perspective: 1000px;
                }

                .phone-mockup {
                    width: 300px;
                    height: 600px;
                    background: #1a1a1a;
                    border-radius: 3rem;
                    border: 8px solid #2a2a2a;
                    position: relative;
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
                    transform: rotateY(-15deg) rotateX(5deg);
                    transition: transform 0.5s ease;
                }
                
                .app-visual:hover .phone-mockup {
                    transform: rotateY(-5deg) rotateX(0deg);
                }

                .phone-notch {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 120px;
                    height: 30px;
                    background: #2a2a2a;
                    border-bottom-left-radius: 1rem;
                    border-bottom-right-radius: 1rem;
                    z-index: 10;
                }

                .phone-screen {
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    border-radius: 2.5rem;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .app-ui-header {
                    height: 80px;
                    background: #E63946;
                    display: flex;
                    align-items: flex-end;
                    padding: 1rem;
                    justify-content: space-between;
                }
                
                .ui-menu, .ui-avatar { width: 30px; height: 30px; background: rgba(255,255,255,0.3); border-radius: 50%; }
                
                .app-ui-hero {
                    height: 200px;
                    background: #f0f0f0;
                    margin: 1rem;
                    border-radius: 1rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 1rem;
                    gap: 0.5rem;
                }
                
                .ui-hero-text { height: 10px; width: 60%; background: #ccc; border-radius: 4px; }
                .ui-hero-btn { height: 30px; width: 100px; background: #E63946; border-radius: 8px; }

                .app-ui-cards { padding: 0 1rem; display: flex; flex-direction: column; gap: 1rem; }
                .ui-card { height: 80px; background: #fff; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eee; }

                .floating-card {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 1rem 1.5rem;
                    border-radius: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    top: 20%;
                    right: 0;
                    animation: float 6s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                .floating-icon {
                    font-size: 1.5rem;
                    color: #10b981;
                }

                .floating-text {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.8rem;
                    color: #1D3557;
                }

                @media (max-width: 768px) {
                    .app-title { font-size: 2.5rem; }
                    .app-visual { display: none; } /* Hide heavy 3D mockup on mobile for performance/space */
                    .stats-row { width: 100%; justify-content: space-around; }
                }
            `}</style>
        </section>
    );
}
