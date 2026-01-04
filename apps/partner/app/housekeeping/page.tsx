import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiPlay, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { MdCleaningServices, MdTouchApp } from "react-icons/md";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getRoomsWithCleaningStatus, getTodaysTasks, getHousekeepingStats } from "../actions/housekeeping";
import { BottomNav } from "../components";
import { HousekeepingTaskCard } from "./HousekeepingTaskCard";
import { RoomStatusGrid } from "./RoomStatusGrid";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(6, 182, 212, 0.3)",
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
        maxWidth: "1000px",
        margin: "0 auto",
    } as React.CSSProperties,
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "24px",
    } as React.CSSProperties,
    statCard: {
        padding: "18px 14px",
        background: "white",
        borderRadius: "18px",
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
        justifyContent: "space-between",
    } as React.CSSProperties,
    emptyState: {
        padding: "48px 24px",
        textAlign: "center" as const,
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
};

export default async function HousekeepingPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const [rooms, tasks, stats] = await Promise.all([
        getRoomsWithCleaningStatus(),
        getTodaysTasks(),
        getHousekeepingStats(),
    ]);

    const statCards = [
        {
            icon: FiClock,
            value: stats?.pending || 0,
            label: "Pending",
            gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            iconColor: "#d97706",
        },
        {
            icon: FiPlay,
            value: stats?.inProgress || 0,
            label: "In Progress",
            gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            iconColor: "#2563eb",
        },
        {
            icon: FiCheckCircle,
            value: stats?.completed || 0,
            label: "Done",
            gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            iconColor: "#059669",
        },
        {
            icon: FiAlertTriangle,
            value: stats?.dirtyRooms || 0,
            label: "Dirty",
            gradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            iconColor: "#dc2626",
        },
    ];

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <MdCleaningServices size={28} />
                        Housekeeping
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Room cleaning & maintenance tasks
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Cards */}
                {stats && (
                    <div style={styles.statsGrid}>
                        {statCards.map((stat, index) => (
                            <div key={index} style={styles.statCard}>
                                <div style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    background: stat.gradient,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 10px",
                                }}>
                                    <stat.icon size={20} color={stat.iconColor} />
                                </div>
                                <div style={{
                                    fontSize: "24px",
                                    fontWeight: "800",
                                    color: "#1a1a2e",
                                    marginBottom: "2px",
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
                )}

                {/* Room Status Grid */}
                <section style={{ marginBottom: "28px" }}>
                    <div style={styles.sectionTitle}>
                        <span>Room Status</span>
                        <span style={{ 
                            fontSize: "13px", 
                            color: "#6b7280", 
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}>
                            <MdTouchApp size={16} />
                            Tap to create task
                        </span>
                    </div>
                    <RoomStatusGrid rooms={rooms} />
                </section>

                {/* Today's Tasks */}
                <section>
                    <h2 style={styles.sectionTitle}>
                        Today&apos;s Tasks ({tasks.length})
                    </h2>

                    {tasks.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}>
                                <MdCleaningServices size={36} color="#0891b2" />
                            </div>
                            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                                No tasks for today
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                Tap a room above to create a cleaning task
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {tasks.map((task) => (
                                <HousekeepingTaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <BottomNav role={roleInfo.role} />
        </div>
    );
}
