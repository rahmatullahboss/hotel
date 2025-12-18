"use client";

import Link from "next/link";
import { BottomNav } from "../components";
import { useTranslations } from "next-intl";
import { FiMail, FiPhone, FiMessageCircle, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const SUPPORT_EMAIL = "rahmatullahzisan@gmail.com";
const SUPPORT_PHONE = "+8801570260118";
const SUPPORT_PHONE_DISPLAY = "01570-260118";

export default function HelpPage() {
    const t = useTranslations("help");
    const tFooter = useTranslations("footer");

    const faqItems = [
        { question: t("faq1_q"), answer: t("faq1_a") },
        { question: t("faq2_q"), answer: t("faq2_a") },
        { question: t("faq3_q"), answer: t("faq3_a") },
        { question: t("faq4_q"), answer: t("faq4_a") },
        { question: t("faq5_q"), answer: t("faq5_a") },
        { question: t("faq6_q"), answer: t("faq6_a") },
    ];

    return (
        <>
            <header className="page-header">
                <Link href="/profile" className="back-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1>{t("title")}</h1>
            </header>

            <main className="container page-content content-page-layout">
                {/* Contact Options */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        {t("contactTitle")}
                    </h2>
                    <div className="help-contact-grid">
                        {/* Email Support */}
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20Request%20-%20Zinu%20Rooms`}
                            className="card help-contact-card"
                        >
                            <div className="help-contact-icon"><FiMail size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {t("emailSupport")}
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {SUPPORT_EMAIL}
                                </p>
                            </div>
                            <span className="help-contact-arrow" style={{ color: "var(--color-primary)", fontWeight: 500 }}>→</span>
                        </a>

                        {/* Phone Support */}
                        <a
                            href={`tel:${SUPPORT_PHONE}`}
                            className="card help-contact-card"
                        >
                            <div className="help-contact-icon"><FiPhone size={24} /></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {t("phoneSupport")}
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {SUPPORT_PHONE_DISPLAY}
                                </p>
                            </div>
                            <span className="help-contact-arrow" style={{ color: "var(--color-primary)", fontWeight: 500 }}><FiArrowRight size={18} /></span>
                        </a>

                        {/* WhatsApp Support */}
                        <a
                            href={`https://wa.me/8801570260118?text=Hello%2C%20I%20need%20help%20with%20Zinu%20Rooms`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card help-contact-card"
                        >
                            <div className="help-contact-icon whatsapp"><FaWhatsapp size={24} color="white" /></div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    {t("whatsapp")}
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {t("chatInstant")}
                                </p>
                            </div>
                            <span className="help-contact-arrow" style={{ color: "var(--color-primary)", fontWeight: 500 }}>→</span>
                        </a>
                    </div>
                </section>

                {/* FAQ Section */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        {t("faqTitle")}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {faqItems.map((item, index) => (
                            <details
                                key={index}
                                className="card"
                                style={{ padding: "1rem" }}
                            >
                                <summary
                                    style={{
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        listStyle: "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    {item.question}
                                    <span style={{ color: "var(--color-primary)" }}>+</span>
                                </summary>
                                <p
                                    style={{
                                        marginTop: "0.75rem",
                                        paddingTop: "0.75rem",
                                        borderTop: "1px solid var(--color-border)",
                                        color: "var(--color-text-secondary)",
                                        fontSize: "0.9375rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {item.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Quick Links */}
                <section>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        {t("legalTitle")}
                    </h2>
                    <div className="card" style={{ padding: 0 }}>
                        <Link
                            href="/terms"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1rem",
                                color: "var(--color-text-primary)",
                                textDecoration: "none",
                                borderBottom: "1px solid var(--color-border)",
                            }}
                        >
                            <span>{tFooter("terms")}</span>
                            <span>→</span>
                        </Link>
                        <Link
                            href="/privacy"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1rem",
                                color: "var(--color-text-primary)",
                                textDecoration: "none",
                            }}
                        >
                            <span>{tFooter("privacy")}</span>
                            <span>→</span>
                        </Link>
                    </div>
                </section>
            </main>

            <BottomNav />
        </>
    );
}
