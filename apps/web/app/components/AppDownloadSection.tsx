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
                        {t("appDownload.title") || <>Luxury in <br /><span className="text-gold">Your Pocket.</span></>}
                    </h2>

                    <p className="app-subtitle">
                        {t.rich("appDownload.subtitle", {
                            strong: (chunks) => <strong style={{ color: "white" }}>{chunks}</strong>
                        })}
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
                        <Link href="#" className="store-btn">
                            <GooglePlayLogo className="store-icon" />
                            <div className="store-text">
                                <span className="small-text">GET IT ON</span>
                                <span className="large-text">Google Play</span>
                            </div>
                        </Link>
                        <Link href="#" className="store-btn">
                            <FaApple className="store-icon" />
                            <div className="store-text">
                                <span className="small-text">Download on the</span>
                                <span className="large-text">App Store</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="app-visual">
                    <div className="phone-glow" />
                    <div className="phone-mockup">
                        <div className="phone-notch" />
                        <div className="phone-screen">
                            {/* Simulated App UI */}
                            <div className="app-ui-header">
                                <div className="ui-menu" />
                                <div className="ui-avatar" />
                            </div>
                            <div className="app-ui-hero">
                                <div className="ui-hero-text" />
                                <div className="ui-hero-btn" />
                            </div>
                            <div className="app-ui-cards">
                                <div className="ui-card" />
                                <div className="ui-card" />
                            </div>
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
                    background-color: #0A192F;
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
                    background: radial-gradient(circle at top right, rgba(21, 40, 70, 0.8), transparent 70%);
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
                    color: #D4AF37;
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    margin-bottom: 2rem;
                    padding: 0.5rem 1rem;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    border-radius: 99px;
                    background: rgba(212, 175, 55, 0.05);
                }

                .app-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 3.5rem;
                    font-weight: 700;
                    color: white;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                }
                
                .app-title :global(.text-gold) {
                    color: #D4AF37;
                    font-style: italic;
                }

                .app-subtitle {
                    color: rgba(255, 255, 255, 0.7);
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
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 1rem;
                    backdrop-filter: blur(10px);
                    width: fit-content;
                }

                .stat-block {
                    display: flex;
                    flex-direction: column;
                }

                .stat-number {
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stat-star {
                    color: #D4AF37;
                    font-size: 1rem;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .stat-separator {
                    width: 1px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
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
                    color: rgba(255, 255, 255, 0.9);
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
                    gap: 1rem;
                }

                .store-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 1rem;
                    color: white;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .store-btn:hover {
                    background: white;
                    color: #0A192F;
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                
                .store-btn:hover :global(.store-icon) {
                    color: #0A192F; /* Invert icon color on hover if needed, or keep refined */
                }

                .store-icon {
                    font-size: 2rem;
                    transition: color 0.3s ease;
                }

                .store-text {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.2;
                }

                .small-text {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    opacity: 0.7;
                }

                .large-text {
                    font-size: 1.125rem;
                    font-weight: 700;
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
