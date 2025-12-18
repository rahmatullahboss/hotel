"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { FaGooglePlay, FaApple, FaStar, FaDownload, FaShieldAlt, FaBolt, FaGift } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { GooglePlayLogo } from "./GooglePlayLogo";

export function AppDownloadSection() {
    const t = useTranslations("home");

    return (
        <section className="app-download-section">
            {/* Animated background elements */}
            <div className="bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="container app-download-container">
                <div className="app-content">
                    <div className="app-badge">
                        <HiSparkles className="badge-icon" />
                        <span>{t("appDownload.badge")}</span>
                    </div>

                    <h2 className="app-title" dangerouslySetInnerHTML={{ __html: t.raw("appDownload.title") }} />

                    <p className="app-subtitle" dangerouslySetInnerHTML={{ __html: t.raw("appDownload.subtitle") }} />

                    {/* Stats Row */}
                    <div className="app-stats">
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">4.8</span>
                                <FaStar className="stat-star" />
                            </div>
                            <span className="stat-label">{t("appDownload.stats.rating")}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">50K+</span>
                            </div>
                            <span className="stat-label">{t("appDownload.stats.downloads")}</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">
                                <span className="stat-number">10K+</span>
                            </div>
                            <span className="stat-label">{t("appDownload.stats.guests")}</span>
                        </div>
                    </div>

                    {/* Feature Pills */}
                    <div className="feature-pills">
                        <div className="feature-pill">
                            <FaBolt className="pill-icon" />
                            <span>{t("appDownload.features.instant")}</span>
                        </div>
                        <div className="feature-pill">
                            <FaGift className="pill-icon" />
                            <span>{t("appDownload.features.rewards")}</span>
                        </div>
                        <div className="feature-pill">
                            <FaShieldAlt className="pill-icon" />
                            <span>{t("appDownload.features.secure")}</span>
                        </div>
                    </div>

                    <div className="store-buttons">
                        <Link href="#" className="store-btn google-play">
                            <GooglePlayLogo className="store-icon" />
                            <div className="store-text">
                                <span className="store-small">{t("appDownload.buttons.getItOn")}</span>
                                <span className="store-large">{t("appDownload.buttons.googlePlay")}</span>
                            </div>
                        </Link>
                        <Link href="#" className="store-btn app-store">
                            <FaApple className="store-icon apple" />
                            <div className="store-text">
                                <span className="store-small">{t("appDownload.buttons.downloadOn")}</span>
                                <span className="store-large">{t("appDownload.buttons.appStore")}</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="app-visual">
                    {/* Glow effects behind phone */}
                    <div className="visual-glow"></div>
                    <div className="visual-glow-secondary"></div>

                    {/* Main phone mockup */}
                    <div className="phone-mockup">
                        <div className="phone-frame">
                            <div className="phone-notch"></div>
                            <div className="phone-screen">
                                {/* App UI Simulation */}
                                <div className="app-header">
                                    <div className="header-logo">Z</div>
                                    <div className="header-search"></div>
                                </div>
                                <div className="app-promo">
                                    <span className="promo-badge">{t("appDownload.mockup.deal")}</span>
                                    <span className="promo-text">{t("appDownload.mockup.off")}</span>
                                </div>
                                <div className="app-cards">
                                    <div className="hotel-card">
                                        <div className="card-image"></div>
                                        <div className="card-content">
                                            <div className="card-title"></div>
                                            <div className="card-rating">
                                                <FaStar className="tiny-star" />
                                                <span>4.9</span>
                                            </div>
                                            <div className="card-price"></div>
                                        </div>
                                    </div>
                                    <div className="hotel-card">
                                        <div className="card-image"></div>
                                        <div className="card-content">
                                            <div className="card-title"></div>
                                            <div className="card-rating">
                                                <FaStar className="tiny-star" />
                                                <span>4.7</span>
                                            </div>
                                            <div className="card-price"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="app-nav">
                                    <div className="nav-item active"></div>
                                    <div className="nav-item"></div>
                                    <div className="nav-item"></div>
                                    <div className="nav-item"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating notification cards */}
                    <div className="floating-notif notif-1">
                        <FaDownload className="notif-icon" />
                        <div className="notif-content">
                            <span className="notif-title">{t("appDownload.mockup.bookingConfirmed")}</span>
                            <span className="notif-sub">{t("appDownload.mockup.staySecured")}</span>
                        </div>
                    </div>

                    <div className="floating-notif notif-2">
                        <FaGift className="notif-icon gift" />
                        <div className="notif-content">
                            <span className="notif-title">{t("appDownload.mockup.earned")}</span>
                            <span className="notif-sub">{t("appDownload.mockup.addedToWallet")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .app-download-section {
                    position: relative;
                    background: linear-gradient(160deg, #0a0a0f 0%, #111827 40%, #1e1e2f 100%);
                    padding: 6rem 1.5rem;
                    margin-top: 4rem;
                    overflow: hidden;
                }
                
                .bg-orbs {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    pointer-events: none;
                }
                
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.4;
                }
                
                .orb-1 {
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(230, 57, 70, 0.4) 0%, transparent 70%);
                    top: -200px;
                    right: -100px;
                    animation: orbFloat 20s ease-in-out infinite;
                }
                
                .orb-2 {
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
                    bottom: -150px;
                    left: -100px;
                    animation: orbFloat 25s ease-in-out infinite reverse;
                }
                
                .orb-3 {
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
                    top: 50%;
                    left: 50%;
                    animation: orbFloat 18s ease-in-out infinite;
                }
                
                @keyframes orbFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(30px, -30px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.95); }
                    75% { transform: translate(20px, 10px) scale(1.05); }
                }

                .app-download-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 4rem;
                    max-width: 1280px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 2;
                }

                .app-content {
                    flex: 1;
                    max-width: 560px;
                }

                .app-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, rgba(230, 57, 70, 0.15) 0%, rgba(230, 57, 70, 0.05) 100%);
                    padding: 0.625rem 1.25rem;
                    border-radius: 100px;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    color: #E63946;
                    margin-bottom: 1.75rem;
                    border: 1px solid rgba(230, 57, 70, 0.3);
                    animation: fadeUp 0.6s ease-out;
                }
                
                .badge-icon {
                    font-size: 1rem;
                }

                .app-title {
                    font-size: 3.25rem;
                    font-weight: 800;
                    line-height: 1.1;
                    color: #fff;
                    margin-bottom: 1.5rem;
                    animation: fadeUp 0.6s ease-out 0.1s both;
                }
                
                .app-title .highlight {
                    background: linear-gradient(135deg, #E63946 0%, #ff6b6b 50%, #E63946 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 3s linear infinite;
                }
                
                @keyframes shimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }

                .app-subtitle {
                    font-size: 1.125rem;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.7;
                    margin-bottom: 2rem;
                    animation: fadeUp 0.6s ease-out 0.2s both;
                }
                
                .app-subtitle strong {
                    color: #E63946;
                    font-weight: 700;
                }

                /* Stats Section */
                .app-stats {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    padding: 1.25rem 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1rem;
                    backdrop-filter: blur(10px);
                    animation: fadeUp 0.6s ease-out 0.3s both;
                }
                
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                
                .stat-value {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }
                
                .stat-number {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                }
                
                .stat-star {
                    color: #fbbf24;
                    font-size: 0.875rem;
                }
                
                .stat-label {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .stat-divider {
                    width: 1px;
                    height: 40px;
                    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent);
                }

                /* Feature Pills */
                .feature-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 2.5rem;
                    animation: fadeUp 0.6s ease-out 0.4s both;
                }
                
                .feature-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.625rem 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 100px;
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.85);
                    transition: all 0.3s ease;
                }
                
                .feature-pill:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(230, 57, 70, 0.3);
                    transform: translateY(-2px);
                }
                
                .pill-icon {
                    color: #E63946;
                    font-size: 0.875rem;
                }

                /* Store Buttons */
                .store-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    animation: fadeUp 0.6s ease-out 0.5s both;
                }

                .store-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                    color: white;
                    padding: 1rem 1.75rem;
                    border-radius: 1rem;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    text-decoration: none;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .store-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s ease;
                }
                
                .store-btn:hover::before {
                    left: 100%;
                }

                .store-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(230, 57, 70, 0.15);
                    border-color: rgba(230, 57, 70, 0.4);
                    background: linear-gradient(135deg, rgba(230, 57, 70, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
                }

                .store-icon {
                    font-size: 2rem;
                }
                
                .store-icon.apple {
                    font-size: 2.25rem;
                }

                .store-text {
                    display: flex;
                    flex-direction: column;
                    line-height: 1.2;
                }

                .store-small {
                    font-size: 0.6875rem;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 0.5px;
                }

                .store-large {
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Visual Section */
                .app-visual {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    min-height: 600px;
                }
                
                .visual-glow {
                    position: absolute;
                    width: 350px;
                    height: 350px;
                    background: radial-gradient(circle, rgba(230, 57, 70, 0.25) 0%, transparent 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    filter: blur(60px);
                    animation: glowPulse 4s ease-in-out infinite;
                }
                
                .visual-glow-secondary {
                    position: absolute;
                    width: 250px;
                    height: 250px;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
                    top: 30%;
                    left: 60%;
                    filter: blur(50px);
                    animation: glowPulse 5s ease-in-out infinite reverse;
                }
                
                @keyframes glowPulse {
                    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                }

                /* Phone Mockup */
                .phone-mockup {
                    position: relative;
                    transform: perspective(1000px) rotateY(-8deg) rotateX(5deg);
                    animation: phoneFloat 6s ease-in-out infinite;
                    z-index: 2;
                }
                
                @keyframes phoneFloat {
                    0%, 100% { transform: perspective(1000px) rotateY(-8deg) rotateX(5deg) translateY(0); }
                    50% { transform: perspective(1000px) rotateY(-8deg) rotateX(5deg) translateY(-15px); }
                }
                
                .phone-frame {
                    width: 280px;
                    height: 560px;
                    background: linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 100%);
                    border-radius: 40px;
                    padding: 12px;
                    box-shadow: 
                        0 50px 100px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }
                
                .phone-notch {
                    position: absolute;
                    top: 12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 24px;
                    background: #1a1a1a;
                    border-radius: 0 0 16px 16px;
                    z-index: 10;
                }
                
                .phone-screen {
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    border-radius: 28px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                /* App UI Elements */
                .app-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 2.5rem 1rem 0.75rem;
                    background: linear-gradient(135deg, #E63946 0%, #ff6b6b 100%);
                }
                
                .header-logo {
                    width: 32px;
                    height: 32px;
                    background: #fff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    color: #E63946;
                    font-size: 1rem;
                }
                
                .header-search {
                    flex: 1;
                    height: 32px;
                    background: rgba(255, 255, 255, 0.25);
                    border-radius: 8px;
                }
                
                .app-promo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(90deg, #E63946 0%, #ff6b6b 100%);
                }
                
                .promo-badge {
                    background: #fff;
                    color: #E63946;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.625rem;
                    font-weight: 700;
                }
                
                .promo-text {
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.875rem;
                }
                
                .app-cards {
                    flex: 1;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    background: #f8f9fa;
                }
                
                .hotel-card {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    display: flex;
                    gap: 0.75rem;
                    padding: 0.5rem;
                }
                
                .card-image {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%);
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                
                .card-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.25rem;
                }
                
                .card-title {
                    height: 12px;
                    width: 80%;
                    background: #e0e0e0;
                    border-radius: 4px;
                }
                
                .card-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.625rem;
                    color: #666;
                }
                
                .tiny-star {
                    color: #fbbf24;
                    font-size: 0.5rem;
                }
                
                .card-price {
                    height: 10px;
                    width: 50%;
                    background: #E63946;
                    border-radius: 4px;
                    opacity: 0.7;
                }
                
                .app-nav {
                    display: flex;
                    justify-content: space-around;
                    padding: 1rem;
                    background: #fff;
                    border-top: 1px solid #eee;
                }
                
                .nav-item {
                    width: 24px;
                    height: 24px;
                    background: #e0e0e0;
                    border-radius: 6px;
                }
                
                .nav-item.active {
                    background: #E63946;
                }

                /* Floating Notifications */
                .floating-notif {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.95);
                    padding: 0.875rem 1.25rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    z-index: 5;
                    backdrop-filter: blur(10px);
                }
                
                .notif-1 {
                    top: 15%;
                    right: -20px;
                    animation: notifFloat 5s ease-in-out infinite;
                }
                
                .notif-2 {
                    bottom: 20%;
                    left: -30px;
                    animation: notifFloat 5s ease-in-out infinite 2s;
                }
                
                @keyframes notifFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .notif-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 1rem;
                    padding: 0.5rem;
                }
                
                .notif-icon.gift {
                    background: linear-gradient(135deg, #E63946 0%, #ff6b6b 100%);
                }
                
                .notif-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.125rem;
                }
                
                .notif-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1a1a2e;
                }
                
                .notif-sub {
                    font-size: 0.75rem;
                    color: #666;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .app-download-container {
                        gap: 3rem;
                    }
                    
                    .app-title {
                        font-size: 2.75rem;
                    }
                    
                    .app-visual {
                        min-height: 500px;
                    }
                    
                    .phone-frame {
                        width: 240px;
                        height: 480px;
                    }
                }

                @media (max-width: 768px) {
                    .app-download-section {
                        padding: 4rem 1rem;
                    }
                    
                    .app-download-container {
                        flex-direction: column;
                        text-align: center;
                        gap: 3rem;
                    }

                    .app-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        max-width: 100%;
                    }
                    
                    .app-title {
                        font-size: 2.25rem;
                    }
                    
                    .app-title br {
                        display: none;
                    }
                    
                    .app-stats {
                        justify-content: center;
                        width: 100%;
                    }
                    
                    .feature-pills {
                        justify-content: center;
                    }
                    
                    .store-buttons {
                        justify-content: center;
                    }
                    
                    .app-visual {
                        min-height: 450px;
                    }
                    
                    .phone-mockup {
                        transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
                    }
                    
                    @keyframes phoneFloat {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-12px); }
                    }
                    
                    .phone-frame {
                        width: 220px;
                        height: 440px;
                    }
                    
                    .floating-notif {
                        display: none;
                    }
                }
                
                @media (max-width: 480px) {
                    .app-title {
                        font-size: 1.875rem;
                    }
                    
                    .app-stats {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }
                    
                    .stat-divider {
                        width: 80%;
                        height: 1px;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    }
                    
                    .feature-pills {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .store-buttons {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .store-btn {
                        justify-content: center;
                        width: 100%;
                    }
                }
            `}</style>
        </section>
    );
}
