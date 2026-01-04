import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiMail, FiMessageSquare, FiZap, FiClock, FiSend } from "react-icons/fi";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import {
    getAutomationSettings,
    getMessageTemplates,
    getRecentMessages,
    getUpcomingCheckInsForMessaging,
} from "../actions/messaging";
import { BottomNav, ScannerFAB } from "../components";
import MessagingClient from "./MessagingClient";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(20, 184, 166, 0.3)",
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
        maxWidth: "800px",
        margin: "0 auto",
    } as React.CSSProperties,
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "14px",
        marginBottom: "24px",
    } as React.CSSProperties,
    statCard: {
        padding: "20px",
        background: "white",
        borderRadius: "18px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        textAlign: "center" as const,
    } as React.CSSProperties,
};

export default async function MessagingPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const [settings, templates, messages, upcomingCheckIns] = await Promise.all([
        getAutomationSettings(),
        getMessageTemplates(),
        getRecentMessages(10),
        getUpcomingCheckInsForMessaging(),
    ]);

    const statCards = [
        {
            icon: FiClock,
            value: messages.filter((m) => m.status === "PENDING").length,
            label: "Pending",
            gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            iconColor: "#2563eb",
        },
        {
            icon: FiSend,
            value: messages.filter(
                (m) => m.status === "SENT" && m.sentAt && 
                new Date(m.sentAt).toDateString() === new Date().toDateString()
            ).length,
            label: "Sent Today",
            gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            iconColor: "#059669",
        },
        {
            icon: FiMessageSquare,
            value: upcomingCheckIns.length,
            label: "Upcoming Check-ins",
            gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
            iconColor: "#7c3aed",
        },
        {
            icon: FiZap,
            value: `${[
                settings.preArrivalEnabled,
                settings.welcomeMessageEnabled,
                settings.postStayEnabled,
            ].filter(Boolean).length}/3`,
            label: "Automations Active",
            gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            iconColor: "#d97706",
        },
    ];

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiMail size={28} />
                        Guest Communication
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Automate guest messaging & notifications
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
                        <div key={index} style={styles.statCard}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: stat.gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                            }}>
                                <stat.icon size={22} color={stat.iconColor} />
                            </div>
                            <div style={{
                                fontSize: "26px",
                                fontWeight: "800",
                                color: "#1a1a2e",
                                marginBottom: "4px",
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                fontWeight: "500",
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Client Component for Interactive Parts */}
                <MessagingClient
                    settings={settings}
                    templates={templates}
                    messages={messages}
                    upcomingCheckIns={upcomingCheckIns}
                    hotelName={hotel.name}
                />
            </main>

            <ScannerFAB />
            <BottomNav />
        </div>
    );
}
