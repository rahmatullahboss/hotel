import { redirect } from "next/navigation";
import Link from "next/link";
import { MdEmojiEvents, MdTrendingUp, MdCheckCircle, MdAccessTime, MdLock } from "react-icons/md";
import { getPartnerRole } from "../actions/getPartnerRole";
import { getActivePrograms, getIncentiveStats, refreshIncentiveProgress, isIncentivesEnabled } from "../actions/incentives";
import { BottomNav } from "../components";
import { IncentiveCard } from "./IncentiveCard";

export const dynamic = 'force-dynamic';

export default async function IncentivesPage() {
    const roleInfo = await getPartnerRole();

    if (!roleInfo) {
        redirect("/auth/signin");
    }

    // Check if incentives are enabled
    const enabled = await isIncentivesEnabled();

    if (!enabled) {
        return (
            <>
                <header className="page-header">
                    <Link
                        href="/"
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "1.5rem",
                            textDecoration: "none",
                            color: "inherit",
                            display: "block",
                            marginBottom: "0.5rem",
                        }}
                    >
                        ←
                    </Link>
                    <h1 className="page-title">Incentives & Bonuses</h1>
                </header>
                <main>
                    <div
                        className="card"
                        style={{
                            padding: "3rem 2rem",
                            textAlign: "center",
                            marginTop: "2rem",
                        }}
                    >
                        <MdLock style={{ fontSize: "3rem", color: "var(--color-text-muted)", marginBottom: "1rem" }} />
                        <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>Coming Soon</h2>
                        <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                            Incentive programs are not available yet. Check back soon for exciting bonus opportunities!
                        </p>
                    </div>
                </main>
                <BottomNav role={roleInfo.role} />
            </>
        );
    }

    // Refresh progress on page load
    await refreshIncentiveProgress();

    const [incentives, stats] = await Promise.all([
        getActivePrograms(),
        getIncentiveStats(),
    ]);

    const activeIncentives = incentives.filter((i) => !i.isCompleted);
    const completedIncentives = incentives.filter((i) => i.isCompleted);

    return (
        <>
            {/* Header */}
            <header className="page-header">
                <Link
                    href="/"
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        marginBottom: "0.5rem",
                    }}
                >
                    ←
                </Link>
                <h1 className="page-title">Incentives & Bonuses</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Complete targets to earn rewards
                </p>
            </header>

            <main>
                {/* Stats Cards */}
                {stats && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "0.75rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div className="card" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <MdTrendingUp style={{ color: "var(--color-primary)", fontSize: "1.25rem" }} />
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Active</span>
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.active}</div>
                        </div>
                        <div className="card" style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <MdCheckCircle style={{ color: "var(--color-success)", fontSize: "1.25rem" }} />
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>Claimed</span>
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.claimed}</div>
                        </div>
                    </div>
                )}

                {/* Total Earned Banner */}
                {stats && stats.totalEarned > 0 && (
                    <div
                        className="card"
                        style={{
                            padding: "1.25rem",
                            marginBottom: "1.5rem",
                            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
                            color: "white",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <MdEmojiEvents style={{ fontSize: "2rem" }} />
                            <div>
                                <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Total Earned</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                                    ৳{stats.totalEarned.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Incentives */}
                <section style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MdAccessTime style={{ color: "var(--color-primary)" }} />
                        In Progress ({activeIncentives.length})
                    </h2>

                    {activeIncentives.length === 0 ? (
                        <div
                            className="card"
                            style={{
                                padding: "2rem",
                                textAlign: "center",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <MdEmojiEvents style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: 0.5 }} />
                            <p>No active incentives</p>
                            <p style={{ fontSize: "0.875rem" }}>Check back soon for new opportunities!</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {activeIncentives.map((incentive) => (
                                <IncentiveCard key={incentive.id} incentive={incentive} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Completed Incentives */}
                {completedIncentives.length > 0 && (
                    <section>
                        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <MdCheckCircle style={{ color: "var(--color-success)" }} />
                            Completed ({completedIncentives.length})
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {completedIncentives.map((incentive) => (
                                <IncentiveCard key={incentive.id} incentive={incentive} />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <BottomNav role={roleInfo.role} />
        </>
    );
}
