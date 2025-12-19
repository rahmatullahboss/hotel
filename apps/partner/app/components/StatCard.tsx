import { ReactNode } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

type StatVariant = "default" | "revenue" | "occupancy" | "bookings" | "warning";

interface StatCardProps {
    value: string | number;
    label: string;
    icon?: ReactNode;
    variant?: StatVariant;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const variantStyles: Record<StatVariant, { background: string; iconBg: string; borderColor?: string }> = {
    default: {
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        iconBg: "rgba(100, 116, 139, 0.1)",
    },
    revenue: {
        background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
        iconBg: "rgba(34, 197, 94, 0.15)",
        borderColor: "var(--color-success)",
    },
    occupancy: {
        background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
        iconBg: "rgba(59, 130, 246, 0.15)",
        borderColor: "var(--color-primary)",
    },
    bookings: {
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
        iconBg: "rgba(245, 158, 11, 0.15)",
        borderColor: "var(--color-warning)",
    },
    warning: {
        background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
        iconBg: "rgba(239, 68, 68, 0.15)",
        borderColor: "var(--color-error)",
    },
};

export function StatCard({ value, label, icon, variant = "default", trend }: StatCardProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className="card stat-card"
            style={{
                background: styles.background,
                borderLeft: styles.borderColor ? `3px solid ${styles.borderColor}` : undefined,
                padding: "1rem",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Icon */}
            {icon && (
                <div
                    style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: styles.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: styles.borderColor || "var(--color-text-secondary)",
                        fontSize: "1rem",
                    }}
                >
                    {icon}
                </div>
            )}

            {/* Value */}
            <div
                className="stat-value"
                style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "0.25rem",
                    color: "var(--color-text-primary)",
                }}
            >
                {value}
            </div>

            {/* Label */}
            <div
                className="stat-label"
                style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.025em",
                }}
            >
                {label}
            </div>

            {/* Trend */}
            {trend && (
                <div
                    style={{
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        color: trend.isPositive ? "var(--color-success)" : "var(--color-error)",
                    }}
                >
                    {trend.isPositive ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                    {Math.abs(trend.value)}% vs yesterday
                </div>
            )}
        </div>
    );
}
