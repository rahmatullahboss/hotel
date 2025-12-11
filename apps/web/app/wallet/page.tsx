import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getWallet, getTransactionHistory, getLoyaltyPoints } from "../actions/wallet";
import { WalletCard } from "./WalletCard";
import { TransactionList } from "./TransactionList";
import { BottomNav } from "../components";

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const [wallet, transactions, loyalty] = await Promise.all([
        getWallet(),
        getTransactionHistory(),
        getLoyaltyPoints(),
    ]);

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)" }}>
            {/* Header */}
            <header
                style={{
                    padding: "1.5rem",
                    background: "linear-gradient(135deg, #1d3557 0%, #457b9d 100%)",
                    color: "white",
                }}
            >
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    My Wallet
                </h1>
                <p style={{ opacity: 0.9, fontSize: "0.875rem" }}>
                    Manage your balance and track transactions
                </p>
            </header>

            <main className="page-content" style={{ paddingLeft: "1rem", paddingRight: "1rem", maxWidth: "600px", margin: "0 auto" }}>
                {/* Wallet Balance Card */}
                <WalletCard balance={Number(wallet?.balance || 0)} />

                {/* Loyalty Points */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #f4a261 0%, #e76f51 100%)",
                        borderRadius: "1rem",
                        padding: "1.25rem",
                        marginBottom: "1.5rem",
                        color: "white",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Loyalty Points</div>
                            <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                                {loyalty?.points?.toLocaleString() || 0}
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "0.5rem 1rem",
                                background: "rgba(255,255,255,0.2)",
                                borderRadius: "2rem",
                                fontWeight: 600,
                            }}
                        >
                            {loyalty?.tier || "BRONZE"} 🏆
                        </div>
                    </div>
                    <div style={{ fontSize: "0.75rem", marginTop: "0.75rem", opacity: 0.8 }}>
                        Earn points on every booking • Use points for discounts
                    </div>
                </div>

                {/* How It Works */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "1rem",
                        padding: "1.25rem",
                        marginBottom: "1.5rem",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>💡 How It Works</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>💳</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>Top Up Wallet</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Add money via bKash/Nagad for quick bookings
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>🎁</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>Earn Rewards</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Get points on every booking + bonus for QR check-in
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>🔒</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>Secure Booking</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    Small booking fee ensures your reservation
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <TransactionList transactions={transactions} />
            </main>

            <BottomNav />
        </div>
    );
}
