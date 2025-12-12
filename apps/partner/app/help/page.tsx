import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav } from "../components";

export const dynamic = 'force-dynamic';

export default async function HelpPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    const faqs = [
        {
            question: "How do I check in a guest?",
            answer: "Use the Scanner page to scan the guest's QR code or enter their booking ID manually. Then tap 'Check In' to confirm their arrival.",
        },
        {
            question: "How does the 20% advance payment work?",
            answer: "For Pay at Hotel bookings, customers pay 20% online as advance. This covers the platform commission. You collect the remaining 80% at check-in.",
        },
        {
            question: "How do I collect the remaining payment?",
            answer: "On the dashboard's Today's Check-ins section or the Scanner page, tap the 'Collect' button after receiving cash from the guest.",
        },
        {
            question: "What if a customer cancels?",
            answer: "If cancelled 24+ hours before check-in, the advance is refunded to their wallet. Late cancellations forfeit the advance, split 50-50 between you and the platform.",
        },
        {
            question: "How do I block a room?",
            answer: "Go to Room Inventory, tap on a room, and select 'Block Room'. Choose the dates and confirm. Blocked rooms won't appear in search results.",
        },
        {
            question: "How are walk-in guests different?",
            answer: "Walk-in guests are recorded for inventory tracking only - no commission is charged. Use the Walk-in page to record them.",
        },
        {
            question: "When do I receive my payouts?",
            answer: "Payouts are processed weekly. You receive the remaining 80% from Pay at Hotel bookings and full amount from walk-ins.",
        },
    ];

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/settings"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Help & Support</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Frequently asked questions
                </p>
            </header>

            <main>
                {/* Quick Actions */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <a
                        href="tel:+8801700000000"
                        className="card"
                        style={{
                            padding: "1.25rem",
                            textAlign: "center",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📞</div>
                        <div style={{ fontWeight: 600 }}>Call Support</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            9 AM - 9 PM
                        </div>
                    </a>
                    <a
                        href="mailto:partners@vibehotels.com"
                        className="card"
                        style={{
                            padding: "1.25rem",
                            textAlign: "center",
                            textDecoration: "none",
                            color: "inherit",
                        }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✉️</div>
                        <div style={{ fontWeight: 600 }}>Email Us</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            24h response
                        </div>
                    </a>
                </div>

                {/* FAQs */}
                <section>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {faqs.map((faq, index) => (
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
                                    {faq.question}
                                    <span style={{ color: "var(--color-text-muted)" }}>+</span>
                                </summary>
                                <p
                                    style={{
                                        marginTop: "0.75rem",
                                        fontSize: "0.875rem",
                                        color: "var(--color-text-secondary)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Contact Card */}
                <div
                    className="card"
                    style={{
                        marginTop: "1.5rem",
                        padding: "1.25rem",
                        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                        color: "white",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤝</div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                        Need more help?
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "1rem" }}>
                        Our partner success team is here by your need
                    </p>
                    <a
                        href="https://wa.me/8801700000000"
                        style={{
                            display: "inline-block",
                            padding: "0.75rem 2rem",
                            background: "white",
                            color: "var(--color-primary)",
                            borderRadius: "0.5rem",
                            fontWeight: 600,
                            textDecoration: "none",
                        }}
                    >
                        Chat on WhatsApp
                    </a>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
