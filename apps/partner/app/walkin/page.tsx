import { redirect } from "next/navigation";
import { getPartnerHotel } from "../actions/dashboard";
import { getHotelRooms } from "../actions/inventory";
import { BottomNav, ScannerFAB } from "../components";
import { WalkInForm } from "./WalkInForm";

export const dynamic = 'force-dynamic';

export default async function WalkInPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    if (hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const rooms = await getHotelRooms(hotel.id);
    const availableRooms = rooms.filter(r => r.status === "AVAILABLE");

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Record Walk-in</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Record guests who walked in directly (no commission)
                </p>
            </header>

            <main>
                {/* Info Banner */}
                <div
                    className="card"
                    style={{
                        marginBottom: "1.5rem",
                        backgroundColor: "rgba(44, 182, 125, 0.1)",
                        borderColor: "var(--color-success)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ fontSize: "1.5rem" }}>💰</div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                No Commission for Walk-ins
                            </div>
                            <p style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                                margin: 0,
                            }}>
                                Walk-in guests are recorded for inventory tracking only.
                                You keep 100% of the revenue - no platform commission.
                            </p>
                        </div>
                    </div>
                </div>

                {availableRooms.length === 0 ? (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            No rooms available. All rooms are occupied or blocked.
                        </p>
                    </div>
                ) : (
                    <WalkInForm rooms={availableRooms} />
                )}
            </main>

            <ScannerFAB />
            <BottomNav />
        </>
    );
}
