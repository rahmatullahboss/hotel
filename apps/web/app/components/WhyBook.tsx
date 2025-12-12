"use client";

import { FiCheck } from "react-icons/fi";
import { FaDollarSign, FaHotel, FaBolt } from "react-icons/fa";
import { useTranslations } from "next-intl";

interface WhyBookItemProps {
    iconType: "verified" | "prices" | "hotel" | "instant";
    titleKey: string;
    descKey: string;
}

const iconMap = {
    verified: <FiCheck size={24} />,
    prices: <FaDollarSign size={24} />,
    hotel: <FaHotel size={24} />,
    instant: <FaBolt size={24} />,
};

export function WhyBookItem({ iconType, titleKey, descKey }: WhyBookItemProps) {
    const t = useTranslations("home");

    return (
        <div className="card why-book-card">
            <span className="why-book-icon">{iconMap[iconType]}</span>
            <div className="why-book-title">{t(titleKey)}</div>
            <div className="why-book-desc">{t(descKey)}</div>
        </div>
    );
}

interface WhyBookGridProps {
    items: WhyBookItemProps[];
}

export function WhyBookGrid({ items }: WhyBookGridProps) {
    return (
        <div className="why-book-grid">
            {items.map((item) => (
                <WhyBookItem key={item.titleKey} {...item} />
            ))}
        </div>
    );
}
