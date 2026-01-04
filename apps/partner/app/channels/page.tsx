import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiLink2, FiHome, FiGlobe, FiCheckCircle, FiClock } from "react-icons/fi";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getChannelConnections, getHotelRooms } from "../actions/channels";
import { BottomNav } from "../components";
import ChannelsClient from "./ChannelsClient";

export const dynamic = "force-dynamic";

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.3)",
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
    summaryCard: {
        background: "white",
        borderRadius: "20px",
        padding: "20px",
        marginBottom: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
    } as React.CSSProperties,
    statItem: {
        textAlign: "center" as const,
        flex: 1,
    } as React.CSSProperties,
    divider: {
        width: "1px",
        background: "#f0f0f0",
        alignSelf: "stretch" as const,
    } as React.CSSProperties,
};

// Channel metadata
const CHANNELS = [
    {
        type: "AGODA" as const,
        name: "Agoda",
        logo: "A",
        logoColor: "#2196F3",
        description: "Connect to Agoda YCS platform",
        status: "available" as const,
    },
    {
        type: "BOOKING_COM" as const,
        name: "Booking.com",
        logo: "B",
        logoColor: "#003580",
        description: "Requires Connectivity Partner approval",
        status: "coming_soon" as const,
    },
    {
        type: "EXPEDIA" as const,
        name: "Expedia",
        logo: "E",
        logoColor: "#FFD700",
        description: "Requires EPS Partner approval",
        status: "coming_soon" as const,
    },
    {
        type: "SHARETRIP" as const,
        name: "ShareTrip",
        logo: "S",
        logoColor: "#4CAF50",
        description: "Bangladesh's leading OTA",
        status: "coming_soon" as const,
    },
    {
        type: "GOZAYAAN" as const,
        name: "Gozayaan",
        logo: "G",
        logoColor: "#F44336",
        description: "Popular Bangladesh travel platform",
        status: "coming_soon" as const,
    },
];

export default async function ChannelsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();

    if (!hotel || hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const [connections, rooms] = await Promise.all([
        getChannelConnections(),
        getHotelRooms(),
    ]);

    const activeConnections = connections.filter((c) => c.isActive).length;
    const availableOTAs = CHANNELS.filter((c) => c.status === "available").length;

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
                        <FiLink2 size={26} />
                        Channel Manager
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Sync inventory with OTAs
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Status Summary */}
                <div style={styles.summaryCard}>
                    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
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
                                <FiCheckCircle size={22} color="#059669" />
                            </div>
                            <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a2e" }}>
                                {activeConnections}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                Active Channels
                            </div>
                        </div>
                        <div style={styles.divider} />
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
                                <FiHome size={22} color="#2563eb" />
                            </div>
                            <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a2e" }}>
                                {rooms.length}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                Total Rooms
                            </div>
                        </div>
                        <div style={styles.divider} />
                        <div style={styles.statItem}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 10px",
                            }}>
                                <FiGlobe size={22} color="#7c3aed" />
                            </div>
                            <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a1a2e" }}>
                                {availableOTAs}
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                Available OTAs
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Component for Interactive Parts */}
                <ChannelsClient
                    channels={CHANNELS}
                    connections={connections}
                    rooms={rooms}
                />
            </main>

            <BottomNav />
        </div>
    );
}
