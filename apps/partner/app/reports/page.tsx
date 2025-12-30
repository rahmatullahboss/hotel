import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getScheduledReports, getReportScheduleSettings } from "../actions/reports";
import { BottomNav, ScannerFAB, ReportBuilder } from "../components";
import ReportsClient from "./ReportsClient";
import { FiFileText, FiClock, FiMail } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const [scheduledReports, scheduleSettings] = await Promise.all([
        getScheduledReports(),
        getReportScheduleSettings(),
    ]);

    const stats = {
        totalScheduled: scheduledReports.length,
        activeReports: scheduledReports.filter((r) => r.isActive).length,
        sentThisMonth: scheduledReports.filter(
            (r) =>
                r.lastSentAt &&
                new Date(r.lastSentAt).getMonth() === new Date().getMonth()
        ).length,
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
                            Reports & Analytics
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Generate and schedule reports
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ padding: "0 1rem 6rem 1rem" }}>
                {/* Stats Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiFileText style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.totalScheduled}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Scheduled
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiClock style={{ color: "var(--color-success)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.activeReports}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Active
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiMail style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.sentThisMonth}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Sent This Month
                        </div>
                    </div>
                </div>

                {/* Report Builder */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Generate Report
                    </h2>
                    <ReportBuilder />
                </section>

                {/* Scheduled Reports */}
                <ReportsClient
                    scheduledReports={scheduledReports}
                    scheduleSettings={scheduleSettings}
                    userEmail={session.user.email || ""}
                />
            </main>

            <ScannerFAB />
            <BottomNav />
        </>
    );
}
