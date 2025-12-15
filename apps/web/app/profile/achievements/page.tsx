"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiAward, FiTarget, FiTrendingUp, FiGift, FiZap } from "react-icons/fi";

import { getStreakData, getUserBadges, getAllBadges, recordDailyLogin } from "../../actions/gamification";

import "./achievements.css";

interface Badge {
    id: string;
    code: string;
    name: string;
    nameBn: string | null;
    description: string;
    descriptionBn: string | null;
    category: string;
    icon: string;
    points: number;
    isEarned: boolean;
    earnedAt: Date | null;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalLoginDays: number;
    nextReward: { days: number; reward: number; badgeCode?: string } | null | undefined;
    daysUntilReward: number;
}

export default function AchievementsPage() {
    const t = useTranslations("achievements");
    const [streakData, setStreakData] = useState<StreakData | null>(null);
    const [userBadges, setUserBadges] = useState<Badge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [streakRecorded, setStreakRecorded] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            // Record daily login on page visit
            if (!streakRecorded) {
                await recordDailyLogin();
                setStreakRecorded(true);
            }

            const [streak, earned, all] = await Promise.all([
                getStreakData(),
                getUserBadges(),
                getAllBadges(),
            ]);

            setStreakData(streak);
            setUserBadges(earned as Badge[]);
            setAllBadges(all as Badge[]);
        } catch (error) {
            console.error("Error loading achievements:", error);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="achievements-page">
                <div className="achievements-loading">
                    <div className="loading-spinner" />
                    <p>{t("loading")}</p>
                </div>
            </div>
        );
    }

    const categories = [
        { key: "STREAK", label: t("categoryStreak"), icon: <FiZap /> },
        { key: "BOOKING", label: t("categoryBooking"), icon: <FiTarget /> },
        { key: "EXPLORER", label: t("categoryExplorer"), icon: <FiTrendingUp /> },
        { key: "REFERRAL", label: t("categoryReferral"), icon: <FiGift /> },
        { key: "LOYALTY", label: t("categoryLoyalty"), icon: <FiAward /> },
        { key: "REVIEWER", label: t("categoryReviewer"), icon: <FiAward /> },
    ];

    return (
        <div className="achievements-page">
            <header className="achievements-header">
                <h1>{t("title")}</h1>
                <p>{t("subtitle")}</p>
            </header>

            {/* Streak Section */}
            <section className="streak-section">
                <div className="streak-card">
                    <div className="streak-fire">🔥</div>
                    <div className="streak-info">
                        <div className="streak-current">
                            <span className="streak-number">{streakData?.currentStreak || 0}</span>
                            <span className="streak-label">{t("dayStreak")}</span>
                        </div>
                        {streakData?.nextReward && (
                            <div className="streak-next">
                                <p>
                                    {t("nextReward", {
                                        days: streakData.daysUntilReward,
                                        reward: streakData.nextReward.reward,
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="streak-stats">
                    <div className="streak-stat">
                        <span className="stat-value">{streakData?.longestStreak || 0}</span>
                        <span className="stat-label">{t("bestStreak")}</span>
                    </div>
                    <div className="streak-stat">
                        <span className="stat-value">{streakData?.totalLoginDays || 0}</span>
                        <span className="stat-label">{t("totalDays")}</span>
                    </div>
                    <div className="streak-stat">
                        <span className="stat-value">{userBadges.length}</span>
                        <span className="stat-label">{t("badgesEarned")}</span>
                    </div>
                </div>
            </section>

            {/* Badges by Category */}
            {categories.map((category) => {
                const categoryBadges = allBadges.filter((b) => b.category === category.key);
                if (categoryBadges.length === 0) return null;

                return (
                    <section key={category.key} className="badge-category">
                        <h2>
                            {category.icon}
                            {category.label}
                        </h2>
                        <div className="badge-grid">
                            {categoryBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className={`badge-item ${badge.isEarned ? "earned" : "locked"}`}
                                >
                                    <span className="badge-icon">{badge.icon}</span>
                                    <span className="badge-name">{badge.name}</span>
                                    <span className="badge-desc">{badge.description}</span>
                                    {badge.isEarned && (
                                        <span className="badge-earned">✓ {t("earned")}</span>
                                    )}
                                    {!badge.isEarned && (
                                        <span className="badge-points">+{badge.points} {t("points")}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}

        </div>
    );
}
