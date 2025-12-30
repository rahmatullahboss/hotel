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
import { FiTool, FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";

export const dynamic = "force-dynamic";

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
                            Maintenance
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Work orders & preventive maintenance
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
                            <FiAlertCircle style={{ color: "var(--color-warning)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.openRequests}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Open Requests
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiTool style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.inProgress}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            In Progress
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiCheckCircle style={{ color: "var(--color-success)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.completedThisMonth}</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Completed This Month
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <FiClock style={{ color: "var(--color-accent)" }} />
                            <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.avgResolutionTime}h</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                            Avg Resolution
                        </div>
                    </div>
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
        </>
    );
}
