"use client";

import Link from "next/link";
import { BottomNav } from "../components";

const faqItems = [
    {
        question: "How do I make a booking?",
        answer: "Search for hotels by location and dates, select your preferred room, fill in guest details, and complete the payment. You'll receive a confirmation email and can view your booking in the 'Bookings' section.",
    },
    {
        question: "How can I cancel my booking?",
        answer: "Go to 'My Bookings', select the booking you want to cancel, and tap 'Cancel Booking'. Cancellation policies vary by hotel - please check the hotel's terms before booking.",
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept bKash mobile payments and wallet balance. You can add money to your wallet for faster checkout on future bookings.",
    },
    {
        question: "How do I earn loyalty points?",
        answer: "Earn points on every booking! You get 1 point per ৳10 spent, plus bonus points for QR code check-ins. Points can be redeemed for discounts on future bookings.",
    },
    {
        question: "What is the wallet feature?",
        answer: "The wallet lets you store money for quick payments. Add funds via bKash and use your balance for booking fees and full payments. It's faster and more convenient!",
    },
    {
        question: "How do I contact a hotel directly?",
        answer: "On each hotel's page, you'll find contact information including phone number and address. You can also reach out through our support for any issues.",
    },
];

const SUPPORT_EMAIL = "rahmatullahzisan@gmail.com";
const SUPPORT_PHONE = "+8801570260118";
const SUPPORT_PHONE_DISPLAY = "01570-260118";

export default function HelpPage() {
    return (
        <>
            <header className="page-header">
                <Link href="/profile" className="back-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1>Help & Support</h1>
            </header>

            <main className="container page-content">
                {/* Contact Options */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        Contact Us
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* Email Support */}
                        <a
                            href={`mailto:${SUPPORT_EMAIL}?subject=Help%20Request%20-%20Vibe%20Hotels`}
                            className="card"
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "0.75rem",
                                    background: "var(--color-bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                }}
                            >
                                📧
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    Email Support
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {SUPPORT_EMAIL}
                                </p>
                            </div>
                            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                                →
                            </span>
                        </a>

                        {/* Phone Support */}
                        <a
                            href={`tel:${SUPPORT_PHONE}`}
                            className="card"
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "0.75rem",
                                    background: "var(--color-bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                }}
                            >
                                📞
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    Phone Support
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {SUPPORT_PHONE_DISPLAY}
                                </p>
                            </div>
                            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                                📱
                            </span>
                        </a>

                        {/* WhatsApp Support */}
                        <a
                            href={`https://wa.me/8801570260118?text=Hello%2C%20I%20need%20help%20with%20Vibe%20Hotels`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card"
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "0.75rem",
                                    background: "#25D366",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                }}
                            >
                                💬
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                    WhatsApp
                                </h3>
                                <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Chat with us instantly
                                </p>
                            </div>
                            <span style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                                →
                            </span>
                        </a>
                    </div>
                </section>

                {/* FAQ Section */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                        Frequently Asked Questions
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
                        Legal & Policies
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
                            <span>Terms of Service</span>
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
                            <span>Privacy Policy</span>
                            <span>→</span>
                        </Link>
                    </div>
                </section>
            </main>

            <BottomNav />
        </>
    );
}
