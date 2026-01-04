import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import {
    getMaintenanceRequests,
    getMaintenanceStats,
    getVendors,
    getPreventiveMaintenance,
    getRoomsForMaintenance,
} from "../actions/maintenance";
import { BottomNav, ScannerFAB } from "../components";
import MaintenanceClient from "./MaintenanceClient";
import { FiTool, FiAlertCircle, FiCheckCircle, FiClock, FiArrowLeft } from "react-icons/fi";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
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
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
        textAlign: "center" as const,
    } as React.CSSProperties,
};

export default async function MaintenancePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const [requests, stats, vendors, preventive, roomList] = await Promise.all([
        getMaintenanceRequests(hotel.id),
        getMaintenanceStats(hotel.id),
        getVendors(hotel.id),
        getPreventiveMaintenance(hotel.id),
        getRoomsForMaintenance(hotel.id),
    ]);

    const statCards = [
        {
            icon: FiAlertCircle,
            value: stats.openRequests,
            label: "Open Requests",
            gradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            iconColor: "#d97706",
        },
        {
            icon: FiTool,
            value: stats.inProgress,
            label: "In Progress",
            gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
            iconColor: "#2563eb",
        },
        {
            icon: FiCheckCircle,
            value: stats.completedThisMonth,
            label: "Completed",
            gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
            iconColor: "#059669",
        },
        {
            icon: FiClock,
            value: `${stats.avgResolutionTime}h`,
            label: "Avg Resolution",
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
                        <FiTool size={28} />
                        Maintenance
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Work orders & preventive maintenance
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
                        <div key={index} style={styles.statCard}>
                            <div style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "16px",
                                background: stat.gradient,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                            }}>
                                <stat.icon size={24} color={stat.iconColor} />
                            </div>
                            <div style={{
                                fontSize: "28px",
                                fontWeight: "800",
                                color: "#1a1a2e",
                                marginBottom: "4px",
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: "13px",
                                color: "#6b7280",
                                fontWeight: "500",
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <MaintenanceClient
                    requests={requests}
                    vendors={vendors}
                    preventive={preventive}
                    roomList={roomList}
                    hotelId={hotel.id}
                />
            </main>

            <ScannerFAB />
            <BottomNav />
        </div>
    );
}
