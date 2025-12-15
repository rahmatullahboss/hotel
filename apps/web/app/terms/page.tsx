import Link from "next/link";
import { useTranslations } from "next-intl";

export default function TermsPage() {
    const t = useTranslations("terms");

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
                <div className="content-page-card">
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        {t("lastUpdated")}
                    </p>

                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            1. Acceptance of Terms
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            By accessing or using Vibe Hotels ("Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            2. Description of Service
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            Vibe Hotels provides an online platform that connects travelers with hotel accommodations
                            in Bangladesh. We facilitate bookings between guests and hotel partners but are not
                            the direct provider of accommodation services.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            3. User Accounts
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            To use certain features of the Service, you must create an account. You are responsible for:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Providing accurate and up-to-date information</li>
                            <li>Notifying us immediately of any unauthorized access</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            4. Booking and Payments
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            When you make a booking through our platform:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>A booking fee is required to confirm your reservation</li>
                            <li>The remaining balance may be paid at the hotel or through our platform</li>
                            <li>Prices displayed include applicable taxes and fees</li>
                            <li>Cancellation policies vary by hotel and are displayed during booking</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            5. Wallet and Loyalty Program
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            Our wallet and loyalty program terms:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>Wallet funds are non-refundable but can be used for future bookings</li>
                            <li>Loyalty points expire after 12 months of account inactivity</li>
                            <li>Points cannot be transferred or exchanged for cash</li>
                            <li>We reserve the right to modify the loyalty program terms</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            6. User Conduct
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            You agree not to:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>Use the Service for any unlawful purpose</li>
                            <li>Attempt to gain unauthorized access to any part of the Service</li>
                            <li>Interfere with the proper functioning of the Service</li>
                            <li>Submit false or misleading information</li>
                            <li>Resell or commercially exploit the Service without permission</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            7. Limitation of Liability
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            To the maximum extent permitted by law, Vibe Hotels shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages resulting from your use of the Service.
                            We are not responsible for the actions of hotel partners or the quality of their accommodations.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            8. Changes to Terms
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            We reserve the right to modify these Terms at any time. Changes will be effective immediately
                            upon posting. Your continued use of the Service after changes constitutes acceptance of the
                            modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            9. Contact Us
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p style={{ marginTop: "0.5rem" }}>
                            <a href="mailto:rahmatullahzisan@gmail.com" style={{ color: "var(--color-primary)" }}>
                                rahmatullahzisan@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>
        </>
    );
}
