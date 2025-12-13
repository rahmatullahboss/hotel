import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { getPartnerHotel } from "../actions/dashboard";
import { getChannelConnections, getHotelRooms } from "../actions/channels";
import { BottomNav } from "../components";
import ChannelsClient from "./ChannelsClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

    return (
        <>
            <header className="page-header">
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
                        <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
                            Channel Manager
                        </h1>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                            Sync inventory with OTAs
                        </p>
                    </div>
                </div>
            </header>

            <main style={{ padding: "0 1rem 6rem 1rem" }}>
                {/* Status Summary */}
                <div
                    className="card"
                    style={{
                        padding: "1rem",
                        marginBottom: "1.5rem",
                        background: "linear-gradient(135deg, rgba(42, 157, 143, 0.1) 0%, rgba(29, 53, 87, 0.1) 100%)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                {connections.filter((c) => c.isActive).length}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                Active Channels
                            </div>
                        </div>
                        <div style={{ width: "1px", background: "var(--color-border)" }} />
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                                {rooms.length}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                                Total Rooms
                            </div>
                        </div>
                        <div style={{ width: "1px", background: "var(--color-border)" }} />
                        <div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)" }}>
                                {CHANNELS.filter((c) => c.status === "available").length}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
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
        </>
    );
}
