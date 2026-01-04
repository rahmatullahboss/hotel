import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiDollarSign, FiTrendingUp, FiCalendar, FiCreditCard, FiPieChart, FiCheckCircle, FiClock } from "react-icons/fi";
import { getEarningsData } from "../actions/earnings";
import { getAvailableBalance, getPayoutHistory } from "../actions/payout";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getPartnerHotel } from "../actions/dashboard";
import { BottomNav, ScannerFAB, PayoutSection } from "../components";
import { EarningsExportClient } from "../components/EarningsExportClient";

export const dynamic = 'force-dynamic';

// Reusable style objects
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        paddingBottom: "100px",
    } as React.CSSProperties,
    header: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        padding: "24px 20px 32px",
        borderRadius: "0 0 32px 32px",
        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
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
        gap: "16px",
        marginBottom: "24px",
    } as React.CSSProperties,
    statCard: {
        padding: "20px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f0f0f0",
    } as React.CSSProperties,
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1a1a2e",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    } as React.CSSProperties,
    transactionCard: {
        padding: "18px 20px",
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
        border: "1px solid #f0f0f0",
        marginBottom: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    } as React.CSSProperties,
    badge: {
        padding: "6px 12px",
        borderRadius: "100px",
        fontSize: "11px",
        fontWeight: "700",
    } as React.CSSProperties,
};

export default async function EarningsPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

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
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ 
                    maxWidth: "800px", 
                    margin: "0 auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start"
                }}>
                    <div>
                        <Link href="/" style={styles.backLink}>
                            <FiArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 style={styles.pageTitle}>
                            <FiTrendingUp style={{ marginRight: "10px", verticalAlign: "middle" }} />
                            Earnings
                        </h1>
                        <p style={styles.pageSubtitle}>
                            Your revenue summary for this month
                        </p>
                    </div>
                    <div style={{ marginTop: "30px" }}>
                        <EarningsExportClient
                            earnings={earnings}
                            hotelName={hotel?.name || "Hotel"}
                            period="month"
                        />
                    </div>
                </div>
            </header>

            <main style={styles.main}>
                {/* Earnings Stats Grid */}
                <div style={styles.statsGrid}>
                    {/* Total Revenue */}
                    <div style={{
                        ...styles.statCard,
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "12px",
                        }}>
                            <FiDollarSign size={22} color="white" />
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "white" }}>
                            ৳{earnings.totalRevenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                            Total Revenue
                        </div>
                    </div>

                    {/* Net Earnings */}
                    <div style={{
                        ...styles.statCard,
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    }}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "12px",
                        }}>
                            <FiTrendingUp size={22} color="white" />
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "white" }}>
                            ৳{earnings.netEarnings.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                            Net Earnings
                        </div>
                    </div>

                    {/* Total Bookings */}
                    <div style={styles.statCard}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "12px",
                        }}>
                            <FiCalendar size={22} color="#667eea" />
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#1a1a2e" }}>
                            {earnings.totalBookings}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            Total Bookings
                        </div>
                    </div>

                    {/* Platform Commission */}
                    <div style={styles.statCard}>
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "12px",
                        }}>
                            <FiPieChart size={22} color="#ef4444" />
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444" }}>
                            -৳{earnings.totalCommission.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                            Platform Commission
                        </div>
                    </div>
                </div>

                {/* Payout Section */}
                <PayoutSection
                    availableBalance={balance.availableBalance}
                    pendingPayouts={balance.pendingPayouts}
                    payouts={payoutHistory.payouts}
                />

                {/* Commission Info Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px",
                    border: "2px solid #667eea",
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "14px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <FiCreditCard size={24} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: "700", fontSize: "16px", color: "#4338ca" }}>
                                    Platform Commission
                                </div>
                                <div style={{ fontSize: "14px", color: "#6366f1" }}>
                                    20% of total bookings
                                </div>
                            </div>
                        </div>
                        <div style={{
                            fontSize: "22px",
                            fontWeight: "800",
                            color: "#4338ca",
                        }}>
                            -৳{earnings.totalCommission.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <section style={{ marginBottom: "24px" }}>
                    <h2 style={styles.sectionTitle}>
                        <FiCreditCard size={20} />
                        Recent Transactions
                    </h2>

                    <div>
                        {earnings.transactions.length === 0 ? (
                            <div style={{
                                padding: "48px 24px",
                                textAlign: "center",
                                background: "white",
                                borderRadius: "20px",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                            }}>
                                <div style={{
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                }}>
                                    <FiCreditCard size={28} color="#9ca3af" />
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "600", color: "#6b7280" }}>
                                    No transactions this month
                                </div>
                            </div>
                        ) : (
                            earnings.transactions.map((tx) => (
                                <div key={tx.id} style={styles.transactionCard}>
                                    <div>
                                        <div style={{ 
                                            fontWeight: "700", 
                                            fontSize: "15px", 
                                            color: "#1a1a2e",
                                            marginBottom: "4px" 
                                        }}>
                                            {tx.guestName}
                                        </div>
                                        <div style={{ 
                                            fontSize: "13px", 
                                            color: "#6b7280",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}>
                                            <FiCalendar size={12} />
                                            Check-in: {tx.checkIn}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{
                                            fontWeight: "800",
                                            fontSize: "17px",
                                            color: "#10b981",
                                            marginBottom: "6px",
                                        }}>
                                            ৳{tx.net.toLocaleString()}
                                        </div>
                                        <span style={{
                                            ...styles.badge,
                                            background: tx.paymentStatus === "PAID" 
                                                ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                                                : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                            color: tx.paymentStatus === "PAID" ? "#059669" : "#d97706",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "4px",
                                        }}>
                                            {tx.paymentStatus === "PAID" 
                                                ? <><FiCheckCircle size={12} /> Paid</>
                                                : tx.paymentStatus === "PAY_AT_HOTEL" 
                                                    ? <><FiClock size={12} /> Pay at Hotel</>
                                                    : <><FiClock size={12} /> Pending</>
                                            }
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <ScannerFAB />
            <BottomNav role={roleInfo.role} />
        </div>
    );
}
