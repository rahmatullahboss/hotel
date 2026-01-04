import { redirect } from "next/navigation";
import Link from "next/link";
import {
    FiArrowLeft,
    FiActivity,
    FiClock,
    FiUsers,
    FiLogIn,
    FiLogOut,
    FiDollarSign,
} from "react-icons/fi";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getCurrentShiftStatus, getHandoverReports, getLatestHandoverReport } from "../actions/staffAttendance";
import { getDailyPerformanceSummary, getStaffActivityLog } from "../actions/staffPerformance";
import { getStaffMembers } from "../actions/staff";
import { BottomNav } from "../components";
import { AttendanceWidget } from "./AttendanceWidget";
import { HandoverForm } from "./HandoverForm";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
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
        fontSize: "26px",
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
    card: {
        background: "white",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        marginBottom: "20px",
    } as React.CSSProperties,
    cardTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#1a1a2e",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    } as React.CSSProperties,
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "20px",
    } as React.CSSProperties,
    statItem: {
        textAlign: "center" as const,
    } as React.CSSProperties,
};

export default async function StaffPerformancePage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const canViewPerformance = roleInfo.role === "OWNER" || roleInfo.role === "MANAGER";

    const [shiftStatus, dailySummary, activityLog, staffMembers, latestHandover, handoverReports] =
        await Promise.all([
            getCurrentShiftStatus(),
            canViewPerformance ? getDailyPerformanceSummary() : null,
            canViewPerformance ? getStaffActivityLog({ limit: 20 }) : [],
            canViewPerformance ? getStaffMembers() : [],
            getLatestHandoverReport(),
            canViewPerformance ? getHandoverReports({ limit: 5 }) : [],
        ]);

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "CHECK_IN":
                return <FiLogIn style={{ color: "#22c55e" }} />;
            case "CHECK_OUT":
                return <FiLogOut style={{ color: "#f59e0b" }} />;
            case "PAYMENT_RECEIVED":
                return <FiDollarSign style={{ color: "#3b82f6" }} />;
            default:
                return <FiActivity style={{ color: "#9ca3af" }} />;
        }
    };

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
                        <FiUsers size={26} />
                        Staff Performance
                    </h1>
                    <p style={styles.pageSubtitle}>
                        {canViewPerformance ? "Track team activity & performance" : "Manage your shift"}
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Attendance Widget */}
                <AttendanceWidget initialStatus={shiftStatus} />

                {/* Daily Summary */}
                {canViewPerformance && dailySummary && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <FiUsers size={20} color="#ec4899" />
                            Today&apos;s Summary
                        </h3>
                        <div style={styles.statsGrid}>
                            <div style={styles.statItem}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "14px",
                                    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                }}>
                                    <FiLogIn size={22} color="#059669" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e" }}>
                                    {dailySummary.totalCheckIns}
                                </div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>Check-ins</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "14px",
                                    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                }}>
                                    <FiLogOut size={22} color="#d97706" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e" }}>
                                    {dailySummary.totalCheckOuts}
                                </div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>Check-outs</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "14px",
                                    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                }}>
                                    <FiDollarSign size={22} color="#2563eb" />
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e" }}>
                                    {dailySummary.totalPayments}
                                </div>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>Payments</div>
                            </div>
                        </div>

                        {/* Staff Breakdown */}
                        {dailySummary.staffBreakdown.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#1a1a2e" }}>
                                    Staff Breakdown
                                </h4>
                                {dailySummary.staffBreakdown.map((staff) => (
                                    <div
                                        key={staff.staffId}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "14px 16px",
                                            marginBottom: "10px",
                                            background: "#f8fafc",
                                            borderRadius: "14px",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                                                {staff.staffName || staff.staffEmail || "Unknown"}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                                {staff.role}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", textAlign: "center" }}>
                                            <div>
                                                <div style={{ fontWeight: "700", color: "#059669" }}>{staff.checkInsHandled}</div>
                                                <div style={{ fontSize: "10px", color: "#6b7280" }}>In</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "700", color: "#d97706" }}>{staff.checkOutsHandled}</div>
                                                <div style={{ fontSize: "10px", color: "#6b7280" }}>Out</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "700", color: "#1a1a2e" }}>{staff.totalActions}</div>
                                                <div style={{ fontSize: "10px", color: "#6b7280" }}>Total</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Handover Form */}
                <div style={{ marginBottom: "20px" }}>
                    <HandoverForm
                        staffMembers={staffMembers}
                        latestReport={latestHandover}
                    />
                </div>

                {/* Recent Activity Log */}
                {canViewPerformance && activityLog.length > 0 && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <FiActivity size={20} color="#3b82f6" />
                            Recent Activity
                        </h3>
                        {activityLog.slice(0, 10).map((log) => (
                            <div
                                key={log.id}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "14px",
                                    padding: "14px 0",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "12px",
                                        background: "#f8fafc",
                                    }}
                                >
                                    {getActivityIcon(log.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", color: "#1a1a2e" }}>{log.description}</div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                        }}
                                    >
                                        <span>{log.actorName || log.actorEmail || "System"}</span>
                                        <span>•</span>
                                        <span>{formatTime(log.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Handover Reports */}
                {canViewPerformance && handoverReports.length > 0 && (
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <FiClock size={20} color="#8b5cf6" />
                            Recent Handovers
                        </h3>
                        {handoverReports.map((report) => (
                            <div
                                key={report.id}
                                style={{
                                    padding: "16px",
                                    marginBottom: "12px",
                                    background: "#f8fafc",
                                    borderRadius: "14px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <div style={{ fontWeight: "600", color: "#1a1a2e" }}>
                                        {report.fromStaffName || "Unknown"} → {report.toStaffName || "Next shift"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                        {formatDate(report.handoverTime)}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669" }}>
                                        <FiLogIn size={14} />
                                        {report.checkInsHandled} check-ins
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706" }}>
                                        <FiLogOut size={14} />
                                        {report.checkOutsHandled} check-outs
                                    </span>
                                    {report.pendingTasks.length > 0 && (
                                        <span style={{ color: "#f59e0b", fontWeight: "600" }}>
                                            {report.pendingTasks.length} pending
                                        </span>
                                    )}
                                </div>
                                {report.notes && (
                                    <div
                                        style={{
                                            marginTop: "10px",
                                            fontSize: "13px",
                                            color: "#6b7280",
                                            fontStyle: "italic",
                                            background: "white",
                                            padding: "10px 14px",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        &quot;{report.notes}&quot;
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav role={roleInfo.role} />
        </div>
    );
}
