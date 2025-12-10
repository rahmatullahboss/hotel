"use client";

import { BottomNav, ScannerFAB } from "../components";

// Mock data - will be replaced with Server Actions
const mockEarnings = {
    today: "৳12,500",
    thisWeek: "৳78,400",
    thisMonth: "৳3,45,000",
    pending: "৳25,000",
};

const mockRecentTransactions = [
    {
        id: "1",
        guestName: "Mohammad Rahman",
        roomName: "Room 101",
        amount: "৳3,500",
        date: "Today, 10:30 AM",
        status: "PAID" as const,
    },
    {
        id: "2",
        guestName: "Fatima Akter",
        roomName: "Room 205",
        amount: "৳4,200",
        date: "Today, 9:15 AM",
        status: "PAID" as const,
    },
    {
        id: "3",
        guestName: "Abdul Karim",
        roomName: "Room 302",
        amount: "৳4,800",
        date: "Yesterday",
        status: "PAY_AT_HOTEL" as const,
    },
];

export default function EarningsPage() {
    return (
        <>
            {/* Header */}
            <header className="page-header">
                <h1 className="page-title">Earnings</h1>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Your revenue summary
                </p>
            </header>

            <main style={{ padding: "1rem" }}>
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
                        <div className="stat-value">{mockEarnings.today}</div>
                        <div className="stat-label">Today</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{mockEarnings.thisWeek}</div>
                        <div className="stat-label">This Week</div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-value">{mockEarnings.thisMonth}</div>
                        <div className="stat-label">This Month</div>
                    </div>
                    <div className="card stat-card">
                        <div
                            className="stat-value"
                            style={{ color: "var(--color-warning)" }}
                        >
                            {mockEarnings.pending}
                        </div>
                        <div className="stat-label">Pending (Pay at Hotel)</div>
                    </div>
                </div>

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
                            -৳69,000
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
                        {mockRecentTransactions.map((tx) => (
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
                                        {tx.roomName} • {tx.date}
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
                                        {tx.amount}
                                    </div>
                                    <span
                                        className={`badge ${tx.status === "PAID" ? "badge-success" : "badge-warning"
                                            }`}
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        {tx.status === "PAID" ? "Paid" : "Pay at Hotel"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Scanner FAB */}
            <ScannerFAB onClick={() => (window.location.href = "/scanner")} />

            {/* Bottom Navigation */}
            <BottomNav />
        </>
    );
}
