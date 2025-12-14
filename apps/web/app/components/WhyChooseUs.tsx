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
        <section className="why-choose-us">
            <div className="container">
                <h2 className="why-choose-us-title">
                    {cityName ? t("titleWithCity", { city: cityName }) : t("title")}
                </h2>
                <div className="why-choose-us-grid">
                    <div className="why-choose-us-card">
                        <div className="why-choose-us-icon">
                            <FiCheck />
                        </div>
                        <h3>{t("verifiedTitle")}</h3>
                        <p>{t("verifiedDesc")}</p>
                    </div>
                    <div className="why-choose-us-card">
                        <div className="why-choose-us-icon">
                            <FiDollarSign />
                        </div>
                        <h3>{t("priceTitle")}</h3>
                        <p>{t("priceDesc")}</p>
                    </div>
                    <div className="why-choose-us-card">
                        <div className="why-choose-us-icon">
                            <FiHome />
                        </div>
                        <h3>{t("payAtHotelTitle")}</h3>
                        <p>{t("payAtHotelDesc")}</p>
                    </div>
                    <div className="why-choose-us-card">
                        <div className="why-choose-us-icon">
                            <FiZap />
                        </div>
                        <h3>{t("instantTitle")}</h3>
                        <p>{t("instantDesc")}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
