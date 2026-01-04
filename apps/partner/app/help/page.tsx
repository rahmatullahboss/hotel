import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiPhone, FiMail, FiHelpCircle, FiMessageCircle, FiChevronDown } from "react-icons/fi";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav } from "../components";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(236, 72, 153, 0.3)",
        marginBottom: "24px",
    } as React.CSSProperties,
    backLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        fontWeight: "500",
        textDecoration: "none",
        marginBottom: "12px",
    } as React.CSSProperties,
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "white",
        margin: 0,
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    } as React.CSSProperties,
    pageSubtitle: {
        color: "rgba(255,255,255,0.8)",
        fontSize: "15px",
        margin: 0,
    } as React.CSSProperties,
    main: {
        padding: "0 16px",
        maxWidth: "600px",
        margin: "0 auto",
    } as React.CSSProperties,
    contactGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "16px",
        marginBottom: "28px",
    } as React.CSSProperties,
    contactCard: {
        padding: "24px 20px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        textAlign: "center" as const,
        textDecoration: "none",
        color: "inherit",
        transition: "all 0.2s ease",
    } as React.CSSProperties,
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a1a2e",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    } as React.CSSProperties,
    faqItem: {
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f0f0f0",
        marginBottom: "12px",
        overflow: "hidden",
    } as React.CSSProperties,
    faqSummary: {
        fontWeight: "600",
        fontSize: "15px",
        color: "#1a1a2e",
        cursor: "pointer",
        listStyle: "none",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 20px",
    } as React.CSSProperties,
    faqAnswer: {
        padding: "0 20px 18px",
        fontSize: "14px",
        color: "#6b7280",
        lineHeight: "1.7",
    } as React.CSSProperties,
    ctaBanner: {
        background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
        borderRadius: "20px",
        padding: "28px 24px",
        textAlign: "center" as const,
        color: "white",
        marginTop: "28px",
        boxShadow: "0 8px 30px rgba(236, 72, 153, 0.3)",
    } as React.CSSProperties,
};

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
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <Link href="/settings" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Settings
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiHelpCircle size={28} />
                        {t("title")}
                    </h1>
                    <p style={styles.pageSubtitle}>
                        {t("subtitle")}
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Quick Contact Actions */}
                <div style={styles.contactGrid}>
                    <a href="tel:+8801700000000" style={styles.contactCard}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 14px",
                        }}>
                            <FiPhone size={24} color="#059669" />
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "#1a1a2e", marginBottom: "4px" }}>
                            {t("callSupport")}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {t("callHours")}
                        </div>
                    </a>
                    <a href="mailto:rahmatullahzisan@gmail.com" style={styles.contactCard}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "16px",
                            background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 14px",
                        }}>
                            <FiMail size={24} color="#2563eb" />
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "#1a1a2e", marginBottom: "4px" }}>
                            {t("emailUs")}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {t("emailResponse")}
                        </div>
                    </a>
                </div>

                {/* FAQs */}
                <section>
                    <h2 style={styles.sectionTitle}>
                        <FiHelpCircle size={20} />
                        {t("faqTitle")}
                    </h2>
                    <div>
                        {faqKeys.map((key) => (
                            <details key={key} style={styles.faqItem}>
                                <summary style={styles.faqSummary}>
                                    {t(`faqs.${key}.question`)}
                                    <FiChevronDown size={18} color="#9ca3af" />
                                </summary>
                                <p style={styles.faqAnswer}>
                                    {t(`faqs.${key}.answer`)}
                                </p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <div style={styles.ctaBanner}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}>
                        <FiMessageCircle size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
                        {t("needMoreHelp")}
                    </h3>
                    <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "20px", lineHeight: "1.5" }}>
                        {t("partnerTeamHelp")}
                    </p>
                    <a
                        href="https://wa.me/8801700000000"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "14px 32px",
                            background: "white",
                            color: "#be185d",
                            borderRadius: "14px",
                            fontWeight: "700",
                            fontSize: "15px",
                            textDecoration: "none",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <FiMessageCircle size={18} />
                        {t("chatWhatsApp")}
                    </a>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
