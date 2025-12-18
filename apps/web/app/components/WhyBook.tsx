"use client";

import { useTranslations } from "next-intl";
import { FaShieldAlt, FaTag, FaHotel, FaBolt } from "react-icons/fa";

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
            case "verified": return <FaShieldAlt className="icon" />;
            case "prices": return <FaTag className="icon" />;
            case "hotel": return <FaHotel className="icon" />;
            case "instant": return <FaBolt className="icon" />;
        }
    };

    return (
        <div className="why-book-container">
            <div className="why-book-grid">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`why-book-card card-${index}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`icon-wrapper icon-${item.iconType}`}>
                            {getIcon(item.iconType)}
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">{t(item.titleKey)}</h3>
                            <p className="card-desc">{t(item.descKey)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .why-book-container {
            padding: 2.5rem 0;
        }

        .why-book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .why-book-card {
            display: flex;
            align-items: center;
            gap: 1.25rem;
            padding: 1.5rem 1.75rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.04);
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            animation: fadeInUp 0.6s ease-out both;
            cursor: default;
        }
        
        .why-book-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.1);
            border-color: transparent;
        }

        .icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .why-book-card:hover .icon-wrapper {
            transform: scale(1.1);
        }

        .icon-verified { 
            background: linear-gradient(135deg, rgba(46, 196, 182, 0.15) 0%, rgba(46, 196, 182, 0.05) 100%); 
            color: #2EC4B6; 
        }
        .why-book-card:hover .icon-verified {
            box-shadow: 0 0 20px rgba(46, 196, 182, 0.3);
        }
        
        .icon-prices { 
            background: linear-gradient(135deg, rgba(255, 159, 28, 0.15) 0%, rgba(255, 159, 28, 0.05) 100%); 
            color: #FF9F1C; 
        }
        .why-book-card:hover .icon-prices {
            box-shadow: 0 0 20px rgba(255, 159, 28, 0.3);
        }
        
        .icon-hotel { 
            background: linear-gradient(135deg, rgba(230, 57, 70, 0.15) 0%, rgba(230, 57, 70, 0.05) 100%); 
            color: #E63946; 
        }
        .why-book-card:hover .icon-hotel {
            box-shadow: 0 0 20px rgba(230, 57, 70, 0.3);
        }
        
        .icon-instant { 
            background: linear-gradient(135deg, rgba(112, 214, 255, 0.15) 0%, rgba(112, 214, 255, 0.05) 100%); 
            color: #70D6FF; 
        }
        .why-book-card:hover .icon-instant {
            box-shadow: 0 0 20px rgba(112, 214, 255, 0.3);
        }

        .card-content {
            flex: 1;
        }

        .card-title {
            font-size: 1.05rem;
            font-weight: 700;
            color: #1D3557;
            margin: 0 0 0.35rem 0;
            letter-spacing: -0.01em;
        }

        .card-desc {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0;
            line-height: 1.5;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
            .why-book-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .why-book-card {
                padding: 1.25rem;
            }
            
            .icon-wrapper {
                width: 48px;
                height: 48px;
                font-size: 1.25rem;
            }
        }
      `}</style>
        </div>
    );
}
