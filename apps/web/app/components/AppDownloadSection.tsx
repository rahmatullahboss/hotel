"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { FaGooglePlay, FaApple } from "react-icons/fa";

export function AppDownloadSection() {
    const t = useTranslations("home");

    return (
        <section className="app-download-section">
            <div className="container app-download-container">
                <div className="app-content">
                    <div className="app-badge">
                        <span className="pulse-dot"></span>
                        Exclusive Deals
                    </div>
                    <h2 className="app-title">Download the Vibe App</h2>
                    <p className="app-subtitle">
                        Get an extra <strong>20% OFF</strong> up to 1000 Taka on your first booking!
                        Experience seamless booking, exclusive deals, and wallet rewards.
                    </p>

                    <div className="app-features">
                        <div className="app-feature">
                            <span className="feature-check">✓</span>
                            <span>Fast & Secure Booking</span>
                        </div>
                        <div className="app-feature">
                            <span className="feature-check">✓</span>
                            <span>Exclusive App-only Discounts</span>
                        </div>
                        <div className="app-feature">
                            <span className="feature-check">✓</span>
                            <span>Manage Bookings on the Go</span>
                        </div>
                    </div>

                    <div className="store-buttons">
                        <Link href="#" className="store-btn google-play">
                            <FaGooglePlay className="store-icon" />
                            <div className="store-text">
                                <span className="store-small">GET IT ON</span>
                                <span className="store-large">Google Play</span>
                            </div>
                        </Link>
                        <Link href="#" className="store-btn app-store">
                            <FaApple className="store-icon" />
                            <div className="store-text">
                                <span className="store-small">Download on the</span>
                                <span className="store-large">App Store</span>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="app-image-wrapper">
                    {/* Placeholder for app mockup - using a generic phone frame style or illustration */}
                    <div className="phone-mockup">
                        <div className="phone-screen">
                            <div className="screen-header">
                                <div className="screen-notch"></div>
                            </div>
                            <div className="screen-content">
                                {/* Abstract representation of the app UI */}
                                <div className="ui-nav"></div>
                                <div className="ui-hero"></div>
                                <div className="ui-cards">
                                    <div className="ui-card"></div>
                                    <div className="ui-card"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .app-download-section {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 4rem 1rem;
          margin-top: 4rem;
          color: white;
          overflow: hidden;
          position: relative;
        }
        
        /* Decorative background elements */
        .app-download-section::before {
            content: "";
            position: absolute;
            top: -100px;
            right: -100px;
            width: 300px;
            height: 300px;
            background: rgba(230, 57, 70, 0.1);
            border-radius: 50%;
            filter: blur(50px);
        }

        .app-download-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .app-content {
          flex: 1;
          max-width: 600px;
        }

        .app-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #E63946;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(230, 57, 70, 0.3);
        }
        
        .pulse-dot {
            width: 8px;
            height: 8px;
            background-color: #E63946;
            border-radius: 50%;
            box-shadow: 0 0 0 rgba(230, 57, 70, 0.7);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(230, 57, 70, 0); }
            100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
        }

        .app-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
          background: linear-gradient(to right, #fff, #aaa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .app-subtitle {
          font-size: 1.125rem;
          color: #ccc;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .app-subtitle strong {
            color: #E63946;
            font-weight: 700;
        }

        .app-features {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 2.5rem;
        }
        
        .app-feature {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
            color: #ddd;
        }
        
        .feature-check {
            color: #E63946;
            font-weight: bold;
            background: rgba(230, 57, 70, 0.1);
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 0.75rem;
        }

        .store-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .store-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #000;
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #333;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .store-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          border-color: #555;
          background: #111;
        }

        .store-icon {
          font-size: 1.75rem;
        }

        .store-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .store-small {
          font-size: 0.625rem;
          text-transform: uppercase;
          margin-bottom: 2px;
          color: #bbb;
        }

        .store-large {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .app-image-wrapper {
          flex: 1;
          display: flex;
          justify-content: center;
          position: relative;
        }

        .phone-mockup {
            width: 300px;
            height: 600px;
            background: #111;
            border-radius: 40px;
            border: 8px solid #333;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
            transform: rotate(-5deg);
        }
        
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #fff;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .screen-header {
            height: 30px;
            background: #E63946;
            display: flex;
            justify-content: center;
        }
        
        .screen-notch {
            width: 120px;
            height: 20px;
            background: #111;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
        }
        
        .screen-content {
            padding: 1rem;
            flex: 1;
            background: #f5f5f5;
        }
        
        .ui-nav {
            height: 40px;
            background: #fff;
            border-radius: 8px;
            margin-bottom: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .ui-hero {
            height: 120px;
            background: #E63946;
            border-radius: 12px;
            margin-bottom: 1rem;
            opacity: 0.8;
        }
        
        .ui-cards {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .ui-card {
            height: 80px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .app-download-container {
            flex-direction: column;
            text-align: center;
            gap: 3rem;
          }

          .app-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .app-features {
            align-items: flex-start;
          }

          .phone-mockup {
             transform: rotate(0);
             width: 260px;
             height: 520px;
          }
        }
      `}</style>
        </section>
    );
}
