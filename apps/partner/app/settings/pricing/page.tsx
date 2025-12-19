import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { getPartnerHotel } from "../../actions/dashboard";

export default async function PricingSettingsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/signin");
    }

    const hotel = await getPartnerHotel();
    if (!hotel) {
        redirect("/register-hotel");
    }

    return (
        <main className="oyo-main">
            <div className="oyo-container">
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Pricing Settings
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                        Manage room prices and promotions
                    </p>
                </div>

                <div className="oyo-card">
                    <div className="oyo-card-header">
                        <h2 className="oyo-card-title">Quick Options</h2>
                    </div>
                    <div className="oyo-card-body">
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <a
                                href="/inventory/rooms"
                                className="btn btn-accent"
                                style={{
                                    padding: "1rem",
                                    textAlign: "left",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>Manage Room Prices</div>
                                    <div style={{ fontSize: "0.875rem", opacity: 0.9, marginTop: "0.25rem" }}>
                                        Update base prices and room details
                                    </div>
                                </div>
                                <span>→</span>
                            </a>

                            <a
                                href="/pricing"
                                className="btn"
                                style={{
                                    padding: "1rem",
                                    textAlign: "left",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "white",
                                    border: "2px solid #e5e7eb"
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>Dynamic Pricing</div>
                                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                        Set seasonal & demand-based pricing
                                    </div>
                                </div>
                                <span>→</span>
                            </a>

                            <a
                                href="/"
                                className="btn"
                                style={{
                                    padding: "1rem",
                                    textAlign: "left",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "white",
                                    border: "2px solid #e5e7eb"
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>Promotions</div>
                                    <div style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                                        Configure discount campaigns
                                    </div>
                                </div>
                                <span>→</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="oyo-card" style={{ marginTop: "1.5rem" }}>
                    <div className="oyo-card-header">
                        <h2 className="oyo-card-title">📊 Pricing Tips</h2>
                    </div>
                    <div className="oyo-card-body">
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div style={{
                                padding: "1rem",
                                background: "#f9fafb",
                                borderRadius: "8px",
                                borderLeft: "4px solid #3b82f6"
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>💡 Competitive Pricing</div>
                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    Check competitor prices in your area and adjust accordingly to stay competitive
                                </div>
                            </div>

                            <div style={{
                                padding: "1rem",
                                background: "#f9fafb",
                                borderRadius: "8px",
                                borderLeft: "4px solid #10b981"
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>📅 Weekend Pricing</div>
                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    Consider higher rates for weekends and holidays when demand is typically higher
                                </div>
                            </div>

                            <div style={{
                                padding: "1rem",
                                background: "#f9fafb",
                                borderRadius: "8px",
                                borderLeft: "4px solid #f59e0b"
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>🎯 Promotions</div>
                                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                                    Use time-limited promotions to boost bookings during low-occupancy periods
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
