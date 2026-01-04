import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiAward, FiTrendingUp, FiCheckCircle, FiClock, FiLock } from "react-icons/fi";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getActivePrograms, getIncentiveStats, refreshIncentiveProgress, isIncentivesEnabled } from "../actions/incentives";
import { BottomNav } from "../components";
import { IncentiveCard } from "./IncentiveCard";

export const dynamic = 'force-dynamic';

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
        maxWidth: "600px",
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
        borderRadius: "18px",
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
    emptyState: {
        padding: "48px 24px",
        textAlign: "center" as const,
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    } as React.CSSProperties,
    totalBanner: {
        background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        borderRadius: "20px",
        padding: "24px",
        color: "white",
        marginBottom: "24px",
        boxShadow: "0 8px 30px rgba(245, 158, 11, 0.3)",
    } as React.CSSProperties,
};

export default async function IncentivesPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    const enabled = await isIncentivesEnabled();

    if (!enabled) {
        return (
            <div style={styles.pageContainer}>
                <header style={styles.header}>
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <Link href="/" style={styles.backLink}>
                            <FiArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 style={styles.pageTitle}>
                            <FiAward size={28} />
                            Incentives & Bonuses
                        </h1>
                    </div>
                </header>
                <main style={styles.main}>
                    <div style={styles.emptyState}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                        }}>
                            <FiLock size={36} color="#9ca3af" />
                        </div>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", marginBottom: "10px", margin: 0 }}>
                            Coming Soon
                        </h2>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "12px 0 0" }}>
                            Incentive programs are not available yet. Check back soon for exciting bonus opportunities!
                        </p>
                    </div>
                </main>
                <BottomNav role={roleInfo.role} />
            </div>
        );
    }

    await refreshIncentiveProgress();

    const [incentives, stats] = await Promise.all([
        getActivePrograms(),
        getIncentiveStats(),
    ]);

    const activeIncentives = incentives.filter((i) => !i.isCompleted);
    const completedIncentives = incentives.filter((i) => i.isCompleted);

    return (
        <div style={styles.pageContainer}>
            {/* Header */}
            <header style={styles.header}>
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <Link href="/" style={styles.backLink}>
                        <FiArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <h1 style={styles.pageTitle}>
                        <FiAward size={28} />
                        Incentives & Bonuses
                    </h1>
                    <p style={styles.pageSubtitle}>
                        Complete targets to earn rewards
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {/* Stats Cards */}
                {stats && (
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "12px",
                            }}>
                                <FiTrendingUp size={22} color="#2563eb" />
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Active</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e" }}>{stats.active}</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "12px",
                            }}>
                                <FiCheckCircle size={22} color="#059669" />
                            </div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Claimed</div>
                            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a1a2e" }}>{stats.claimed}</div>
                        </div>
                    </div>
                )}

                {/* Total Earned Banner */}
                {stats && stats.totalEarned > 0 && (
                    <div style={styles.totalBanner}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "16px",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <FiAward size={28} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Earned</div>
                                <div style={{ fontSize: "28px", fontWeight: "800" }}>
                                    ৳{stats.totalEarned.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Incentives */}
                <section style={{ marginBottom: "28px" }}>
                    <h2 style={styles.sectionTitle}>
                        <FiClock size={20} color="#2563eb" />
                        In Progress ({activeIncentives.length})
                    </h2>

                    {activeIncentives.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}>
                                <FiAward size={32} color="#d97706" />
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
                                No active incentives
                            </div>
                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                                Check back soon for new opportunities!
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {activeIncentives.map((incentive) => (
                                <IncentiveCard key={incentive.id} incentive={incentive} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Incentives */}
                {completedIncentives.length > 0 && (
                    <section>
                        <h2 style={styles.sectionTitle}>
                            <FiCheckCircle size={20} color="#059669" />
                            Completed ({completedIncentives.length})
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {completedIncentives.map((incentive) => (
                                <IncentiveCard key={incentive.id} incentive={incentive} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <BottomNav role={roleInfo.role} />
        </div>
    );
}
