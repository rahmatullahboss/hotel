"use client";

import { useState, useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";
import { FiShare2, FiCopy, FiCheck, FiUsers, FiDollarSign, FiClock, FiGift } from "react-icons/fi";

import { getOrCreateReferralCode, getReferralStats, applyReferralCode } from "../../actions/referrals";

import "./referral.css";

interface ReferralHistory {
    id: string;
    referredUserName: string;
    referredUserImage: string | null;
    status: "PENDING" | "COMPLETED" | "EXPIRED";
    reward: number;
    createdAt: Date;
    completedAt: Date | null;
}

interface ReferralStats {
    code: string | null;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalEarned: number;
    referralHistory: ReferralHistory[];
}

export default function ReferralPage() {
    const t = useTranslations("referral");
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [applyCode, setApplyCode] = useState("");
    const [applyError, setApplyError] = useState("");
    const [applySuccess, setApplySuccess] = useState("");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // First ensure user has a referral code
            await getOrCreateReferralCode();
            // Then get stats
            const data = await getReferralStats();
            setStats(data);
        } catch (error) {
            console.error("Error loading referral data:", error);
        }
        setLoading(false);
    }

    async function handleCopy() {
        if (stats?.code) {
            await navigator.clipboard.writeText(stats.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function handleShare() {
        if (stats?.code) {
            const shareText = t("shareMessage", { code: stats.code });
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: t("shareTitle"),
                        text: shareText,
                        url: `${window.location.origin}?ref=${stats.code}`,
                    });
                } catch (error) {
                    // User cancelled or error
                }
            } else {
                // Fallback to copy
                handleCopy();
            }
        }
    }

    function handleApplyCode() {
        if (!applyCode.trim()) return;
        setApplyError("");
        setApplySuccess("");

        startTransition(async () => {
            const result = await applyReferralCode(applyCode.trim());
            if (result.success) {
                setApplySuccess(result.message || t("codeApplied"));
                setApplyCode("");
            } else {
                setApplyError(result.error || t("invalidCode"));
            }
        });
    }

    if (loading) {
        return (
            <div className="referral-page">
                <div className="referral-loading">
                    <div className="loading-spinner" />
                    <p>{t("loading")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="referral-page">
            <header className="referral-header">
                <h1>{t("title")}</h1>
                <p>{t("subtitle")}</p>
            </header>

            {/* Your Referral Code */}
            <section className="referral-code-section">
                <div className="referral-code-card">
                    <div className="code-icon">
                        <FiGift />
                    </div>
                    <h2>{t("yourCode")}</h2>
                    <div className="code-display">
                        {stats?.code || "---"}
                    </div>
                    <div className="code-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleCopy}
                        >
                            {copied ? <FiCheck /> : <FiCopy />}
                            {copied ? t("copied") : t("copy")}
                        </button>
                        <button
                            className="btn btn-outline"
                            onClick={handleShare}
                        >
                            <FiShare2 />
                            {t("share")}
                        </button>
                    </div>
                    <p className="code-hint">{t("shareHint")}</p>
                </div>
            </section>

            {/* Stats */}
            <section className="referral-stats">
                <div className="stat-card">
                    <FiUsers className="stat-icon" />
                    <span className="stat-value">{stats?.totalReferrals || 0}</span>
                    <span className="stat-label">{t("totalReferrals")}</span>
                </div>
                <div className="stat-card">
                    <FiClock className="stat-icon" />
                    <span className="stat-value">{stats?.pendingReferrals || 0}</span>
                    <span className="stat-label">{t("pending")}</span>
                </div>
                <div className="stat-card">
                    <FiDollarSign className="stat-icon" />
                    <span className="stat-value">৳{stats?.totalEarned || 0}</span>
                    <span className="stat-label">{t("earned")}</span>
                </div>
            </section>

            {/* How it works */}
            <section className="referral-how-it-works">
                <h2>{t("howItWorks")}</h2>
                <div className="steps">
                    <div className="step">
                        <span className="step-number">1</span>
                        <p>{t("step1")}</p>
                    </div>
                    <div className="step">
                        <span className="step-number">2</span>
                        <p>{t("step2")}</p>
                    </div>
                    <div className="step">
                        <span className="step-number">3</span>
                        <p>{t("step3")}</p>
                    </div>
                </div>
            </section>

            {/* Apply a code */}
            <section className="referral-apply">
                <h2>{t("haveCode")}</h2>
                <div className="apply-form">
                    <input
                        type="text"
                        placeholder={t("enterCode")}
                        value={applyCode}
                        onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                        className="apply-input"
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleApplyCode}
                        disabled={isPending || !applyCode.trim()}
                    >
                        {isPending ? t("applying") : t("apply")}
                    </button>
                </div>
                {applyError && <p className="apply-error">{applyError}</p>}
                {applySuccess && <p className="apply-success">{applySuccess}</p>}
            </section>

            {/* Referral History */}
            {stats?.referralHistory && stats.referralHistory.length > 0 && (
                <section className="referral-history">
                    <h2>{t("history")}</h2>
                    <div className="history-list">
                        {stats.referralHistory.map((ref) => (
                            <div key={ref.id} className="history-item">
                                <div className="history-user">
                                    <div className="history-avatar">
                                        {ref.referredUserName.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="history-name">{ref.referredUserName}</span>
                                        <span className="history-date">
                                            {new Date(ref.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className={`history-status status-${ref.status.toLowerCase()}`}>
                                    {ref.status === "COMPLETED" ? (
                                        <span>+৳{ref.reward}</span>
                                    ) : (
                                        <span>{t(`status${ref.status}`)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
