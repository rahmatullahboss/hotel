import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
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

    const [wallet, transactions, loyalty, t] = await Promise.all([
        getWallet(),
        getTransactionHistory(),
        getLoyaltyPoints(),
        getTranslations("wallet"),
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
                    {t("myWallet")}
                </h1>
                <p style={{ opacity: 0.9, fontSize: "0.875rem" }}>
                    {t("manageBalance")}
                </p>
            </header>

            <main className="page-content content-page-layout">
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
                            <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>{t("loyaltyPoints")}</div>
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
                        {t("earnPoints")}
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
                    <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>💡 {t("howItWorks")}</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>💳</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>{t("topUpWallet")}</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {t("topUpDesc")}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>🎁</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>{t("earnRewards")}</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {t("earnRewardsDesc")}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "1.25rem" }}>🔒</span>
                            <div>
                                <div style={{ fontWeight: 500 }}>{t("secureBooking")}</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                                    {t("secureBookingDesc")}
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

