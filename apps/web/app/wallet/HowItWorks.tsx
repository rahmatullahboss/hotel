"use client";

import { FiCreditCard, FiGift, FiLock, FiInfo } from "react-icons/fi";
import { useTranslations } from "next-intl";

interface HowItWorksProps {
    items: {
        titleKey: string;
        descKey: string;
        iconType: "topUp" | "rewards" | "secure";
    }[];
}

const iconMap = {
    topUp: <FiCreditCard size={20} />,
    rewards: <FiGift size={20} />,
    secure: <FiLock size={20} />,
};

export function HowItWorks({ items }: HowItWorksProps) {
    const t = useTranslations("wallet");

    return (
        <div
            style={{
                background: "white",
                borderRadius: "1rem",
                padding: "1.25rem",
                marginBottom: "1.5rem",
                border: "1px solid var(--color-border)",
            }}
        >
            <h3 style={{ fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FiInfo size={18} /> {t("howItWorks")}
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
                {items.map((item, index) => (
                    <div key={index} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "1.25rem", color: "var(--color-primary)" }}>{iconMap[item.iconType]}</span>
                        <div>
                            <div style={{ fontWeight: 500 }}>{t(item.titleKey)}</div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                {t(item.descKey)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
