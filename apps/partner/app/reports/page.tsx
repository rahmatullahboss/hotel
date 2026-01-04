import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getScheduledReports, getReportScheduleSettings } from "../actions/reports";
import { BottomNav, ScannerFAB, ReportBuilder } from "../components";
import ReportsClient from "./ReportsClient";
import { FiFileText, FiClock, FiMail, FiArrowLeft, FiBarChart2 } from "react-icons/fi";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
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
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
        marginBottom: "24px",
    } as React.CSSProperties,
    statCard: {
        padding: "20px 16px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        textAlign: "center" as const,
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
    section: {
        marginBottom: "28px",
    } as React.CSSProperties,
};

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

    const statCards = [
        {
            icon: FiFileText,
            value: scheduledReports.length,
            label: "Scheduled",
            gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            iconColor: "#2563eb",
        },
        {
            icon: FiClock,
            value: scheduledReports.filter((r) => r.isActive).length,
            label: "Active",
            gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            iconColor: "#059669",
        },
        {
            icon: FiMail,
            value: scheduledReports.filter(
                (r) =>
                    r.lastSentAt &&
                    new Date(r.lastSentAt).getMonth() === new Date().getMonth()
            ).length,
            label: "Sent",
            gradient: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
            iconColor: "#7c3aed",
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
                        <FiBarChart2 size={28} />
                        Reports & Analytics
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Generate and schedule reports
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

                {/* Report Builder */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <FiFileText size={20} />
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
        </div>
    );
}
