import { redirect } from "next/navigation";
import { getPartnerHotel } from "../actions/dashboard";
import { getRoomPricing } from "../actions/pricing";
import { BottomNav, ScannerFAB } from "../components";
import { PricingGrid } from "./PricingGrid";

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
    const hotel = await getPartnerHotel();

    if (!hotel) {
        redirect("/auth/signin");
    }

    if (hotel.status !== "ACTIVE") {
        redirect("/");
    }

    const rooms = await getRoomPricing(hotel.id);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Smart Pricing</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Adjust room prices within ±20% of base rate
                </p>
            </header>

            <main>
                {/* Info Card */}
                <div
                    className="card"
                    style={{
                        marginBottom: "1.5rem",
                        backgroundColor: "rgba(29, 53, 87, 0.05)",
                        borderColor: "var(--color-primary)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <div style={{ fontSize: "1.5rem" }}>💡</div>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                Smart Pricing Tips
                            </div>
                            <ul style={{
                                fontSize: "0.875rem",
                                color: "var(--color-text-secondary)",
                                margin: 0,
                                paddingLeft: "1rem",
                            }}>
                                <li>Increase prices during weekends and holidays</li>
                                <li>Lower prices for weekdays with low demand</li>
                                <li>You can adjust up to ±20% of the base price</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {rooms.length === 0 ? (
                    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            No rooms available for pricing. Add rooms first.
                        </p>
                    </div>
                ) : (
                    <PricingGrid rooms={rooms} />
                )}
            </main>

            <ScannerFAB />
            <BottomNav />
        </>
    );
}
