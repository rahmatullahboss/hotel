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
                    <div key={index} className="why-book-card">
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
            padding: 2rem 0;
            border-bottom: 1px solid #eee;
        }

        .why-book-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .why-book-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            border: 1px solid #f0f0f0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .why-book-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .icon-wrapper {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            flex-shrink: 0;
        }

        .icon-verified { background: rgba(46, 196, 182, 0.1); color: #2EC4B6; }
        .icon-prices { background: rgba(255, 159, 28, 0.1); color: #FF9F1C; }
        .icon-hotel { background: rgba(231, 29, 54, 0.1); color: #E71D36; }
        .icon-instant { background: rgba(112, 214, 255, 0.1); color: #70D6FF; }

        .card-content {
            flex: 1;
        }

        .card-title {
            font-size: 1rem;
            font-weight: 700;
            color: #1D3557;
            margin: 0 0 0.25rem 0;
        }

        .card-desc {
            font-size: 0.875rem;
            color: #666;
            margin: 0;
            line-height: 1.4;
        }

        @media (max-width: 768px) {
            .why-book-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }
      `}</style>
        </div>
    );
}
