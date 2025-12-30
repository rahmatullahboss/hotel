import { redirect } from "next/navigation";
import Link from "next/link";
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
import { FiMail, FiMessageSquare, FiZap, FiClock } from "react-icons/fi";

export const dynamic = "force-dynamic";

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

    // Stats
    const stats = {
        pendingMessages: messages.filter((m) => m.status === "PENDING").length,
        sentToday: messages.filter(
            (m) => m.status === "SENT" && m.sentAt && 
            new Date(m.sentAt).toDateString() === new Date().toDateString()
        ).length,
        upcomingCheckIns: upcomingCheckIns.length,
        automationsEnabled: [
            settings.preArrivalEnabled,
            settings.welcomeMessageEnabled,
            settings.postStayEnabled,
        ].filter(Boolean).length,
    };

    return (
        <>
            <header className="page-header glass">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "var(--color-bg-secondary)",
                            color: "var(--color-text-secondary)",
                            fontSize: "1rem",
                            textDecoration: "none",
                        }}
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="page-title gradient-text" style={{ marginBottom: "0.25rem" }}>
                            Guest Communication
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Automate guest messaging
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ padding: "0 1rem 6rem 1rem" }}>
                {/* Stats Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiClock style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.pendingMessages}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Pending
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiMail style={{ color: "var(--color-success)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.sentToday}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Sent Today
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiMessageSquare style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.upcomingCheckIns}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Upcoming Check-ins
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiZap style={{ color: "var(--color-warning)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.automationsEnabled}/3</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            Automations Active
                        </div>
                    </div>
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
        </>
    );
}
