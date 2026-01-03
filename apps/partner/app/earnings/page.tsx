import { redirect } from "next/navigation";
import { getEarningsData } from "../actions/earnings";
import { getAvailableBalance, getPayoutHistory } from "../actions/payout";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav, ScannerFAB, PayoutSection } from "../components";
import { EarningsExportClient } from "../components/EarningsExportClient";

export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Role-based access control: Only OWNER can view earnings
    if (!roleInfo.permissions.canViewEarnings) {
        redirect("/?accessDenied=earnings");
    }

    const [earnings, balance, payoutHistory, hotel] = await Promise.all([
        getEarningsData(roleInfo.hotelId, "month"),
        getAvailableBalance(),
        getPayoutHistory(),
        getPartnerHotel(),
    ]);

    return (
        <>
            {/* Header */}
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    background: "white",
                    padding: "16px",
                    borderRadius: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    border: "1px solid #f1f5f9",
                    marginBottom: "16px",
                    maxWidth: "1200px",
                    margin: "0 auto 16px auto"
                }}
            >
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Earnings</h1>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0, marginTop: "4px" }}>
                        Your revenue summary
                    </p>
                </div>
                <EarningsExportClient
                    earnings={earnings}
                    hotelName={hotel?.name || "Hotel"}
                    period="month"
                />
            </header>

            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Earnings Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div className="stat-value" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>৳{earnings.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label" style={{ fontSize: "0.875rem", color: "#64748b" }}>Total Revenue</div>
                    </div>
                    <div style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div className="stat-value" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>৳{earnings.netEarnings.toLocaleString()}</div>
                        <div className="stat-label" style={{ fontSize: "0.875rem", color: "#64748b" }}>Net Earnings</div>
                    </div>
                    <div style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div className="stat-value" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>{earnings.totalBookings}</div>
                        <div className="stat-label" style={{ fontSize: "0.875rem", color: "#64748b" }}>Total Bookings</div>
                    </div>
                    <div style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        border: "1px solid #f1f5f9"
                    }}>
                        <div
                            className="stat-value"
                            style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: 700 }}
                        >
                            -৳{earnings.totalCommission.toLocaleString()}
                        </div>
                        <div className="stat-label" style={{ fontSize: "0.875rem", color: "#64748b" }}>Platform Commission</div>
                    </div>
                </div>

                {/* Payout Section */}
                <PayoutSection
                    availableBalance={balance.availableBalance}
                    pendingPayouts={balance.pendingPayouts}
                    payouts={payoutHistory.payouts}
                />

                {/* Commission Info */}
                <div
                    className="card"
                    style={{
                        marginBottom: "1.5rem",
                        backgroundColor: "rgba(29, 53, 87, 0.05)",
                        borderColor: "var(--color-primary)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                Platform Commission
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                20% of total bookings
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color: "var(--color-primary)",
                            }}
                        >
                            -৳{earnings.totalCommission.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <section>
                    <h2
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: 600,
                            marginBottom: "1rem",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Recent Transactions
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {earnings.transactions.length === 0 ? (
                            <div
                                style={{
                                    padding: "32px",
                                    textAlign: "center",
                                    color: "#64748b",
                                    background: "white",
                                    borderRadius: "16px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                    border: "1px solid #f1f5f9"
                                }}
                            >
                                No transactions this month
                            </div>
                        ) : (
                            earnings.transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className=""
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "16px",
                                        background: "white",
                                        borderRadius: "16px",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                        border: "1px solid #f1f5f9"
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "#1e293b" }}>
                                            {tx.guestName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                            Check-in: {tx.checkIn}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                color: "var(--color-success)",
                                                marginBottom: "0.25rem",
                                            }}
                                        >
                                            ৳{tx.net.toLocaleString()}
                                        </div>
                                        <span
                                            className={`badge ${tx.paymentStatus === "PAID" ? "badge-success" : "badge-warning"
                                                }`}
                                            style={{ fontSize: "0.75rem" }}
                                        >
                                            {tx.paymentStatus === "PAID" ? "Paid" : tx.paymentStatus === "PAY_AT_HOTEL" ? "Pay at Hotel" : "Pending"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Scanner FAB */}
            <ScannerFAB />

            {/* Bottom Navigation */}
            <BottomNav role={roleInfo.role} />
        </>
    );
}
