interface Transaction {
    id: string;
    type: "CREDIT" | "DEBIT";
    amount: string;
    reason: string;
    description: string | null;
    createdAt: Date;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div
                style={{
                    background: "white",
                    borderRadius: "1rem",
                    padding: "2rem",
                    textAlign: "center",
                    border: "1px solid var(--color-border)",
                }}
            >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📜</div>
                <div style={{ color: "var(--color-text-secondary)" }}>
                    No transactions yet
                </div>
            </div>
        );
    }

    const formatReason = (reason: string) => {
        const labels: Record<string, string> = {
            TOP_UP: "Wallet Top-up",
            BOOKING_FEE: "Booking Fee",
            REFUND: "Refund",
            REWARD: "Loyalty Reward",
            CASHBACK: "Cashback",
        };
        return labels[reason] || reason;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-BD", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            style={{
                background: "white",
                borderRadius: "1rem",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--color-border)",
                    fontWeight: 600,
                }}
            >
                Transaction History
            </div>

            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    style={{
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 500 }}>{formatReason(tx.reason)}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                            {formatDate(tx.createdAt)}
                        </div>
                    </div>
                    <div
                        style={{
                            fontWeight: 600,
                            color: tx.type === "CREDIT" ? "#2cb67d" : "#e76f51",
                        }}
                    >
                        {tx.type === "CREDIT" ? "+" : "-"}৳{Number(tx.amount).toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
