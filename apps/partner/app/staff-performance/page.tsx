import { redirect } from "next/navigation";
import Link from "next/link";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getCurrentShiftStatus, getHandoverReports, getLatestHandoverReport } from "../actions/staffAttendance";
import { getDailyPerformanceSummary, getStaffActivityLog } from "../actions/staffPerformance";
import { getStaffMembers } from "../actions/staff";
import { BottomNav } from "../components";
import { AttendanceWidget } from "./AttendanceWidget";
import { HandoverForm } from "./HandoverForm";
import {
    FiActivity,
    FiClock,
    FiUsers,
    FiCheckCircle,
    FiLogIn,
    FiLogOut,
    FiDollarSign,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function StaffPerformancePage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Only OWNER and MANAGER can view staff performance
    const canViewPerformance = roleInfo.role === "OWNER" || roleInfo.role === "MANAGER";

    // Get data
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
        <>
            {/* Header */}
            <header className="page-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "var(--color-bg-secondary)",
                            color: "var(--color-text-secondary)",
                            textDecoration: "none",
                        }}
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="page-title">Staff Performance</h1>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                            {canViewPerformance ? "Track team activity & performance" : "Manage your shift"}
                        </p>
                    </div>
                </div>
            </header>

            <main>
                {/* Attendance Widget - visible to all staff */}
                <AttendanceWidget initialStatus={shiftStatus} />

                {/* Daily Summary - OWNER/MANAGER only */}
                {canViewPerformance && dailySummary && (
                    <div className="card" style={{ marginTop: "1rem" }}>
                        <div className="card-header">
                            <h3 className="card-title">
                                <FiUsers style={{ marginRight: "0.5rem" }} />
                                Today&apos;s Summary
                            </h3>
                        </div>
                        <div className="card-body">
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "1rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            color: "#22c55e",
                                        }}
                                    >
                                        {dailySummary.totalCheckIns}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        Check-ins
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            color: "#f59e0b",
                                        }}
                                    >
                                        {dailySummary.totalCheckOuts}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        Check-outs
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "2rem",
                                            fontWeight: 700,
                                            color: "#3b82f6",
                                        }}
                                    >
                                        {dailySummary.totalPayments}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                        Payments
                                    </div>
                                </div>
                            </div>

                            {/* Staff Breakdown */}
                            {dailySummary.staffBreakdown.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                                        Staff Breakdown
                                    </h4>
                                    {dailySummary.staffBreakdown.map((staff) => (
                                        <div
                                            key={staff.staffId}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                padding: "0.75rem",
                                                marginBottom: "0.5rem",
                                                backgroundColor: "var(--color-bg-secondary)",
                                                borderRadius: "0.5rem",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 500 }}>
                                                    {staff.staffName || staff.staffEmail || "Unknown"}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {staff.role}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "1rem", textAlign: "center" }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{staff.checkInsHandled}</div>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                                                        In
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{staff.checkOutsHandled}</div>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                                                        Out
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{staff.totalActions}</div>
                                                    <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)" }}>
                                                        Total
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Handover Form */}
                <div style={{ marginTop: "1rem" }}>
                    <HandoverForm
                        staffMembers={staffMembers}
                        latestReport={latestHandover}
                    />
                </div>

                {/* Recent Activity Log - OWNER/MANAGER only */}
                {canViewPerformance && activityLog.length > 0 && (
                    <div className="card" style={{ marginTop: "1rem" }}>
                        <div className="card-header">
                            <h3 className="card-title">
                                <FiActivity style={{ marginRight: "0.5rem" }} />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="card-body">
                            {activityLog.slice(0, 10).map((log) => (
                                <div
                                    key={log.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        padding: "0.75rem 0",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            backgroundColor: "var(--color-bg-secondary)",
                                        }}
                                    >
                                        {getActivityIcon(log.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.875rem" }}>{log.description}</div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "0.5rem",
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-secondary)",
                                                marginTop: "0.25rem",
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
                    </div>
                )}

                {/* Recent Handover Reports - OWNER/MANAGER only */}
                {canViewPerformance && handoverReports.length > 0 && (
                    <div className="card" style={{ marginTop: "1rem" }}>
                        <div className="card-header">
                            <h3 className="card-title">
                                <FiClock style={{ marginRight: "0.5rem" }} />
                                Recent Handovers
                            </h3>
                        </div>
                        <div className="card-body">
                            {handoverReports.map((report) => (
                                <div
                                    key={report.id}
                                    style={{
                                        padding: "0.75rem",
                                        marginBottom: "0.5rem",
                                        backgroundColor: "var(--color-bg-secondary)",
                                        borderRadius: "0.5rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <div style={{ fontWeight: 500 }}>
                                            {report.fromStaffName || "Unknown"} → {report.toStaffName || "Next shift"}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                            {formatDate(report.handoverTime)}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "1rem",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        <span>
                                            <FiLogIn style={{ marginRight: "0.25rem" }} />
                                            {report.checkInsHandled} check-ins
                                        </span>
                                        <span>
                                            <FiLogOut style={{ marginRight: "0.25rem" }} />
                                            {report.checkOutsHandled} check-outs
                                        </span>
                                        {report.pendingTasks.length > 0 && (
                                            <span style={{ color: "#f59e0b" }}>
                                                {report.pendingTasks.length} pending tasks
                                            </span>
                                        )}
                                    </div>
                                    {report.notes && (
                                        <div
                                            style={{
                                                marginTop: "0.5rem",
                                                fontSize: "0.875rem",
                                                color: "var(--color-text-secondary)",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            &quot;{report.notes}&quot;
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <BottomNav role={roleInfo.role} />
        </>
    );
}
