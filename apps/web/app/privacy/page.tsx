import Link from "next/link";
import { BottomNav } from "../components";

export default function PrivacyPage() {
    return (
        <>
            <header className="page-header">
                <Link href="/profile" className="back-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1>Privacy Policy</h1>
            </header>

            <main className="container page-content">
                <div className="card" style={{ padding: "1.5rem" }}>
                    <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                        Last updated: December 2024
                    </p>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Introduction
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            Vibe Hotels ("we", "our", or "us") respects your privacy and is committed to protecting
                            your personal data. This Privacy Policy explains how we collect, use, disclose, and
                            safeguard your information when you use our platform.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Information We Collect
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            We collect information that you provide directly to us:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                            <li><strong>Account Information:</strong> Name, email address, phone number, and profile picture</li>
                            <li><strong>Booking Information:</strong> Guest details, check-in/check-out dates, and preferences</li>
                            <li><strong>Payment Information:</strong> Transaction details and wallet balance</li>
                            <li><strong>Communication Data:</strong> Messages and inquiries you send to us or hotels</li>
                        </ul>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            We also automatically collect:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li><strong>Device Information:</strong> Device type, operating system, and browser type</li>
                            <li><strong>Usage Data:</strong> Pages visited, search queries, and interaction patterns</li>
                            <li><strong>Location Data:</strong> General location based on IP address (with consent for precise location)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            How We Use Your Information
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            We use the information we collect to:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>Process and manage your bookings</li>
                            <li>Manage your account and provide customer support</li>
                            <li>Send booking confirmations and important updates</li>
                            <li>Process payments and manage your wallet</li>
                            <li>Administer the loyalty points program</li>
                            <li>Improve our services and develop new features</li>
                            <li>Send promotional communications (with your consent)</li>
                            <li>Prevent fraud and ensure security</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Information Sharing
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            We may share your information with:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li><strong>Hotel Partners:</strong> To facilitate your bookings and check-ins</li>
                            <li><strong>Payment Processors:</strong> To process transactions securely</li>
                            <li><strong>Service Providers:</strong> Third parties who help us operate our platform</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                        </ul>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginTop: "1rem" }}>
                            We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Data Security
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            We implement appropriate technical and organizational security measures to protect
                            your personal data against unauthorized access, alteration, disclosure, or destruction.
                            This includes encryption, secure servers, and regular security assessments.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Data Retention
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            We retain your personal data for as long as necessary to fulfill the purposes outlined
                            in this Privacy Policy, unless a longer retention period is required by law. Booking
                            records are kept for a minimum of 5 years for legal and tax purposes.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Your Rights
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>
                            You have the right to:
                        </p>
                        <ul style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, paddingLeft: "1.5rem" }}>
                            <li>Access and receive a copy of your personal data</li>
                            <li>Correct inaccurate or incomplete information</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to or restrict certain processing activities</li>
                            <li>Withdraw consent for marketing communications</li>
                            <li>Data portability (receive your data in a structured format)</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Cookies and Tracking
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            We use cookies and similar tracking technologies to enhance your experience,
                            analyze usage patterns, and deliver personalized content. You can control cookie
                            preferences through your browser settings.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Children's Privacy
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            Our Service is not intended for children under 18. We do not knowingly collect
                            personal information from children. If you believe we have collected information
                            from a child, please contact us immediately.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Changes to This Policy
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            We may update this Privacy Policy from time to time. We will notify you of any
                            significant changes by posting the new policy on this page and updating the
                            "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Contact Us
                        </h2>
                        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                            If you have any questions about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div style={{ marginTop: "1rem", color: "var(--color-text-secondary)" }}>
                            <p><strong>Email:</strong> <span style={{ color: "var(--color-primary)" }}>privacy@vibehotels.com</span></p>
                            <p style={{ marginTop: "0.5rem" }}><strong>Address:</strong> Dhaka, Bangladesh</p>
                        </div>
                    </section>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
