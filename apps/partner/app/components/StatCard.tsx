interface StatCardProps {
    value: string | number;
    label: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export function StatCard({ value, label, trend }: StatCardProps) {
    return (
        <div className="card stat-card">
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {trend && (
                <div
                    style={{
                        marginTop: "0.5rem",
                        fontSize: "0.875rem",
                        color: trend.isPositive ? "var(--color-success)" : "var(--color-error)",
                    }}
                >
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% vs yesterday
                </div>
            )}
        </div>
    );
}
