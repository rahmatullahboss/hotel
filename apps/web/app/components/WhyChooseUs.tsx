"use client";

import { FiCheck, FiDollarSign, FiHome, FiZap } from "react-icons/fi";
import { useTranslations } from "next-intl";

import "./WhyChooseUs.css";

interface WhyChooseUsProps {
    cityName?: string;
}

export function WhyChooseUs({ cityName }: WhyChooseUsProps) {
    const t = useTranslations("whyChooseUs");

    return (
        <section className="why-choose-us" style={{ marginTop: "3rem", marginBottom: "0" }}>
            <div className="container">
                <h2 className="section-title" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                    {cityName ? t("titleWithCity", { city: cityName }) : t("title")}
                </h2>
                <div className="why-choose-us-grid">
                    <div className="why-choose-us-card card">
                        <span className="why-choose-us-icon">
                            <FiCheck size={24} />
                        </span>
                        <h3 className="why-book-title">{t("verifiedTitle")}</h3>
                        <p className="why-book-desc">{t("verifiedDesc")}</p>
                    </div>
                    <div className="why-choose-us-card card">
                        <span className="why-choose-us-icon">
                            <FiDollarSign size={24} />
                        </span>
                        <h3 className="why-book-title">{t("priceTitle")}</h3>
                        <p className="why-book-desc">{t("priceDesc")}</p>
                    </div>
                    <div className="why-choose-us-card card">
                        <span className="why-choose-us-icon">
                            <FiHome size={24} />
                        </span>
                        <h3 className="why-book-title">{t("payAtHotelTitle")}</h3>
                        <p className="why-book-desc">{t("payAtHotelDesc")}</p>
                    </div>
                    <div className="why-choose-us-card card">
                        <span className="why-choose-us-icon">
                            <FiZap size={24} />
                        </span>
                        <h3 className="why-book-title">{t("instantTitle")}</h3>
                        <p className="why-book-desc">{t("instantDesc")}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
