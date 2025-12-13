"use client";

import { useState } from "react";
import { MdEmojiEvents, MdLocalOffer, MdTimer } from "react-icons/md";
import { claimIncentive } from "../actions/incentives";

type IncentiveType =
    | "BOOKING_COUNT"
    | "REVENUE_TARGET"
    | "OCCUPANCY_RATE"
    | "RATING_IMPROVEMENT"
    | "FIRST_MILESTONE"
    | "STREAK"
    | "SEASONAL_BONUS";

type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";

interface Incentive {
    id: string;
    programId: string;
    name: string;
    description: string | null;
    type: IncentiveType;
    targetValue: number;
    targetUnit: string;
    rewardAmount: string;
    rewardType: string;
    startDate: Date;
    endDate: Date;
    badgeIcon: string | null;
    badgeColor: string | null;
    currentProgress: number;
    progressPercentage: string;
    isCompleted: boolean;
    completedAt: Date | null;
    claimStatus: ClaimStatus | null;
    daysRemaining: number;
}

interface IncentiveCardProps {
    incentive: Incentive;
}

export function IncentiveCard({ incentive }: IncentiveCardProps) {
    const [isClaiming, setIsClaiming] = useState(false);

    const getTypeIcon = (type: IncentiveType) => {
        switch (type) {
            case "BOOKING_COUNT":
            case "FIRST_MILESTONE":
                return "📅";
            case "REVENUE_TARGET":
                return "💰";
            case "OCCUPANCY_RATE":
                return "🏨";
            case "RATING_IMPROVEMENT":
                return "⭐";
            case "STREAK":
                return "🔥";
            case "SEASONAL_BONUS":
                return "🎁";
            default:
                return "🏆";
        }
    };

    const getStatusBadge = () => {
        if (incentive.claimStatus === "PAID") {
            return { text: "Paid", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" };
        }
        if (incentive.claimStatus === "PENDING") {
            return { text: "Processing", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" };
        }
        if (incentive.claimStatus === "APPROVED") {
            return { text: "Approved", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" };
        }
        if (incentive.isCompleted) {
            return { text: "Ready to Claim", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
        }
        return null;
    };

    const handleClaim = async () => {
        setIsClaiming(true);
        try {
            await claimIncentive(incentive.id);
        } catch (error) {
            console.error("Error claiming:", error);
        } finally {
            setIsClaiming(false);
        }
    };

    const progressPercent = parseFloat(incentive.progressPercentage);
    const statusBadge = getStatusBadge();

    return (
        <div className="incentive-card">
            <div className="card-header">
                <div className="icon-wrapper" style={{ background: incentive.badgeColor || "var(--color-bg-secondary)" }}>
                    <span>{incentive.badgeIcon || getTypeIcon(incentive.type)}</span>
                </div>
                <div className="card-title">
                    <h3>{incentive.name}</h3>
                    {statusBadge && (
                        <span className="status-badge" style={{ color: statusBadge.color, background: statusBadge.bg }}>
                            {statusBadge.text}
                        </span>
                    )}
                </div>
            </div>

            {incentive.description && (
                <p className="description">{incentive.description}</p>
            )}

            {/* Progress Bar */}
            {!incentive.isCompleted && (
                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-text">
                            {incentive.currentProgress.toLocaleString()} / {incentive.targetValue.toLocaleString()} {incentive.targetUnit}
                        </span>
                        <span className="progress-percent">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, progressPercent)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Reward & Time */}
            <div className="card-footer">
                <div className="reward">
                    <MdLocalOffer />
                    <span>৳{parseFloat(incentive.rewardAmount).toLocaleString()}</span>
                </div>
                {!incentive.isCompleted && incentive.daysRemaining > 0 && (
                    <div className="time-remaining">
                        <MdTimer />
                        <span>{incentive.daysRemaining} days left</span>
                    </div>
                )}
                {incentive.isCompleted && !incentive.claimStatus && (
                    <button
                        type="button"
                        className="claim-btn"
                        onClick={handleClaim}
                        disabled={isClaiming}
                    >
                        <MdEmojiEvents />
                        {isClaiming ? "Claiming..." : "Claim Reward"}
                    </button>
                )}
            </div>

            <style jsx>{`
                .incentive-card {
                    background: var(--color-bg-primary);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }
                .card-header {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }
                .icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
                .card-title {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.25rem;
                }
                .card-title h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0;
                }
                .status-badge {
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                    width: fit-content;
                }
                .description {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 0.75rem;
                    line-height: 1.4;
                }
                .progress-section {
                    margin-bottom: 0.75rem;
                }
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.375rem;
                }
                .progress-text {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                }
                .progress-percent {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--color-primary);
                }
                .progress-bar {
                    height: 8px;
                    background: var(--color-bg-secondary);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .reward {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--color-success);
                }
                .time-remaining {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                }
                .claim-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.5rem 1rem;
                    background: var(--color-success);
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s ease;
                }
                .claim-btn:hover:not(:disabled) {
                    opacity: 0.9;
                }
                .claim-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default IncentiveCard;
