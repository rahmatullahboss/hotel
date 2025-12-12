import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav } from "../components";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function HelpPage() {
    const hotel = await getPartnerHotel();
    const t = await getTranslations("help");

    if (!hotel) {
        redirect("/auth/signin");
    }

    const faqKeys = [
        "checkInGuest",
        "advancePayment",
        "collectPayment",
        "cancellation",
        "blockRoom",
        "walkIn",
        "payouts",
    ] as const;

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/settings"
                    className="back-button"
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
                <h1 className="page-title">{t("title")}</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    {t("subtitle")}
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
                        <div style={{ fontWeight: 600 }}>{t("callSupport")}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {t("callHours")}
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
                        <div style={{ fontWeight: 600 }}>{t("emailUs")}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {t("emailResponse")}
                        </div>
                    </a>
                </div>

                {/* FAQs */}
                <section>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                        {t("faqTitle")}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {faqKeys.map((key) => (
                            <details
                                key={key}
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
                                    {t(`faqs.${key}.question`)}
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
                                    {t(`faqs.${key}.answer`)}
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
                        {t("needMoreHelp")}
                    </h3>
                    <p style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "1rem" }}>
                        {t("partnerTeamHelp")}
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
                        {t("chatWhatsApp")}
                    </a>
                </div>
            </main>

            <BottomNav />
        </>
    );
}
