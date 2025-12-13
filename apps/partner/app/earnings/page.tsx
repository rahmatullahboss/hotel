import { redirect } from "next/navigation";
import { getEarningsData } from "../actions/earnings";
import { getAvailableBalance, getPayoutHistory } from "../actions/payout";
import { getPartnerRole } from "../actions/getPartnerRole";
import { BottomNav, ScannerFAB, PayoutSection } from "../components";

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

    const [earnings, balance, payoutHistory] = await Promise.all([
        getEarningsData(roleInfo.hotelId, "month"),
        getAvailableBalance(),
        getPayoutHistory(),
    ]);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Earnings</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Your revenue summary
                </p>
            </header>

            <main>
                {/* Earnings Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="card stat-card">
                        <div className="stat-value">৳{earnings.totalRevenue.toLocaleString()}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">৳{earnings.netEarnings.toLocaleString()}</div>
                        <div className="stat-label">Net Earnings</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{earnings.totalBookings}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <div className="card stat-card">
                        <div
                            className="stat-value"
                            style={{ color: "var(--color-warning)" }}
                        >
                            -৳{earnings.totalCommission.toLocaleString()}
                        </div>
                        <div className="stat-label">Platform Commission</div>
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
                                className="card"
                                style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                No transactions this month
                            </div>
                        ) : (
                            earnings.transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="card"
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "1rem",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                                            {tx.guestName}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
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
