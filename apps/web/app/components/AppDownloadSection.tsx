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
                    <h2 className="app-title">Download the Zinu Rooms App</h2>
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
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
          padding: 5rem 1rem;
          margin-top: 4rem;
          color: white;
          overflow: hidden;
          position: relative;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        /* Multiple decorative blobs */
        .app-download-section::before {
            content: "";
            position: absolute;
            top: -100px;
            right: -100px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(230, 57, 70, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }
        
        .app-download-section::after {
            content: "";
            position: absolute;
            bottom: -150px;
            left: -100px;
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, rgba(69, 123, 157, 0.1) 0%, transparent 70%);
            pointer-events: none;
        }

        .app-download-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .app-content {
          flex: 1;
          max-width: 600px;
        }

        .app-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(10px);
            padding: 0.625rem 1.25rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #E63946;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(230, 57, 70, 0.25);
            animation: fadeInUp 0.6s ease-out;
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
            70% { box-shadow: 0 0 0 8px rgba(230, 57, 70, 0); }
            100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
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

        .app-title {
          font-size: 2.75rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
          line-height: 1.15;
          background: linear-gradient(135deg, #fff 0%, #e0e0e0 50%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }

        .app-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 2rem;
          line-height: 1.7;
          animation: fadeInUp 0.6s ease-out 0.2s both;
        }
        
        .app-subtitle strong {
            color: #E63946;
            font-weight: 700;
        }

        .app-features {
            display: flex;
            flex-direction: column;
            gap: 0.875rem;
            margin-bottom: 2.5rem;
        }
        
        .app-feature {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.85);
            animation: fadeInUp 0.6s ease-out both;
        }
        
        .app-feature:nth-child(1) { animation-delay: 0.3s; }
        .app-feature:nth-child(2) { animation-delay: 0.4s; }
        .app-feature:nth-child(3) { animation-delay: 0.5s; }
        
        .feature-check {
            color: #fff;
            font-weight: bold;
            background: linear-gradient(135deg, #E63946 0%, #ff6b6b 100%);
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-size: 0.75rem;
            box-shadow: 0 4px 12px rgba(230, 57, 70, 0.35);
        }

        .store-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }

        .store-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.875rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          text-decoration: none;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .store-btn:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 28px rgba(0,0,0,0.4), 0 0 20px rgba(230, 57, 70, 0.15);
          border-color: rgba(230, 57, 70, 0.4);
          background: rgba(255, 255, 255, 0.1);
        }

        .store-icon {
          font-size: 1.75rem;
        }

        .store-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .store-small {
          font-size: 0.65rem;
          text-transform: uppercase;
          margin-bottom: 2px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.5px;
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
            background: linear-gradient(145deg, #1a1a1a 0%, #0a0a0a 100%);
            border-radius: 44px;
            border: 8px solid #2a2a2a;
            box-shadow: 
              0 30px 60px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.05),
              inset 0 0 60px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
            transform: rotate(-6deg);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: rotate(-6deg) translateY(0); }
          50% { transform: rotate(-6deg) translateY(-15px); }
        }
        
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #fff;
            position: relative;
            display: flex;
            flex-direction: column;
            border-radius: 36px;
        }
        
        .screen-header {
            height: 32px;
            background: linear-gradient(135deg, #E63946 0%, #ff6b6b 100%);
            display: flex;
            justify-content: center;
        }
        
        .screen-notch {
            width: 120px;
            height: 22px;
            background: #0a0a0a;
            border-bottom-left-radius: 14px;
            border-bottom-right-radius: 14px;
        }
        
        .screen-content {
            padding: 1rem;
            flex: 1;
            background: linear-gradient(180deg, #f8f9fa 0%, #f0f0f0 100%);
        }
        
        .ui-nav {
            height: 40px;
            background: #fff;
            border-radius: 10px;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .ui-hero {
            height: 120px;
            background: linear-gradient(135deg, #E63946 0%, #ff6b6b 100%);
            border-radius: 14px;
            margin-bottom: 1rem;
        }
        
        .ui-cards {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .ui-card {
            height: 75px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        @media (max-width: 768px) {
          .app-download-section {
            padding: 3.5rem 1rem;
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
          }
          
          .app-title {
            font-size: 2rem;
          }
          
          .app-features {
            align-items: flex-start;
          }

          .phone-mockup {
             transform: rotate(0);
             width: 260px;
             height: 520px;
             animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        }
      `}</style>
        </section>
    );
}
