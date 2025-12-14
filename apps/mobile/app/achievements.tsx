import { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

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
    earnedAt: string | null;
}

interface AchievementsData {
    streak: {
        currentStreak: number;
        longestStreak: number;
        totalLoginDays: number;
        nextReward: { days: number; reward: number; badgeCode: string } | null;
        daysUntilReward: number;
    };
    badges: Badge[];
    earnedCount: number;
}

const CATEGORY_ICONS: Record<string, string> = {
    STREAK: 'fire',
    BOOKING: 'calendar-check-o',
    EXPLORER: 'compass',
    REFERRAL: 'gift',
    LOYALTY: 'star',
    REVIEWER: 'star-o',
};

export default function AchievementsScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const [data, setData] = useState<AchievementsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAchievements = useCallback(async () => {
        // Record daily login
        await api.recordDailyLogin();
        // Get achievements
        const { data: achievementsData } = await api.getAchievements();
        if (achievementsData) {
            setData(achievementsData);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAchievements();
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const categories = [
        { key: 'STREAK', label: t('achievements.categoryStreak') },
        { key: 'BOOKING', label: t('achievements.categoryBooking') },
        { key: 'EXPLORER', label: t('achievements.categoryExplorer') },
        { key: 'REFERRAL', label: t('achievements.categoryReferral') },
        { key: 'LOYALTY', label: t('achievements.categoryLoyalty') },
        { key: 'REVIEWER', label: t('achievements.categoryReviewer') },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('achievements.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Streak Card */}
                <View style={styles.streakCard}>
                    <Text style={styles.streakFire}>🔥</Text>
                    <View style={[styles.streakInfo, { backgroundColor: 'transparent' }]}>
                        <Text style={styles.streakNumber}>
                            {data?.streak?.currentStreak || 0}
                        </Text>
                        <Text style={styles.streakLabel}>{t('achievements.dayStreak')}</Text>
                    </View>
                    {data?.streak?.nextReward && (
                        <Text style={styles.streakHint}>
                            {t('achievements.nextReward', {
                                days: data.streak.daysUntilReward,
                                reward: data.streak.nextReward.reward,
                            })}
                        </Text>
                    )}
                </View>

                {/* Streak Stats */}
                <View style={styles.streakStats}>
                    <View style={[styles.streakStat, { backgroundColor: colors.card }]}>
                        <Text style={[styles.streakStatValue, { color: colors.text }]}>
                            {data?.streak?.longestStreak || 0}
                        </Text>
                        <Text style={[styles.streakStatLabel, { color: colors.textSecondary }]}>
                            {t('achievements.bestStreak')}
                        </Text>
                    </View>
                    <View style={[styles.streakStat, { backgroundColor: colors.card }]}>
                        <Text style={[styles.streakStatValue, { color: colors.text }]}>
                            {data?.streak?.totalLoginDays || 0}
                        </Text>
                        <Text style={[styles.streakStatLabel, { color: colors.textSecondary }]}>
                            {t('achievements.totalDays')}
                        </Text>
                    </View>
                    <View style={[styles.streakStat, { backgroundColor: colors.card }]}>
                        <Text style={[styles.streakStatValue, { color: colors.text }]}>
                            {data?.earnedCount || 0}
                        </Text>
                        <Text style={[styles.streakStatLabel, { color: colors.textSecondary }]}>
                            {t('achievements.badgesEarned')}
                        </Text>
                    </View>
                </View>

                {/* Badges by Category */}
                {categories.map((category) => {
                    const categoryBadges = data?.badges?.filter(
                        (b) => b.category === category.key
                    ) || [];
                    if (categoryBadges.length === 0) return null;

                    return (
                        <View key={category.key} style={[styles.categorySection, { backgroundColor: colors.card }]}>
                            <View style={[styles.categoryHeader, { backgroundColor: 'transparent' }]}>
                                <FontAwesome
                                    name={CATEGORY_ICONS[category.key] as any || 'trophy'}
                                    size={18}
                                    color={Colors.primary}
                                />
                                <Text style={[styles.categoryTitle, { color: colors.text }]}>
                                    {category.label}
                                </Text>
                            </View>
                            <View style={[styles.badgeGrid, { backgroundColor: 'transparent' }]}>
                                {categoryBadges.map((badge) => (
                                    <View
                                        key={badge.id}
                                        style={[
                                            styles.badgeItem,
                                            !badge.isEarned && styles.badgeLocked,
                                            { backgroundColor: badge.isEarned ? `${Colors.primary}15` : colors.backgroundSecondary },
                                        ]}
                                    >
                                        <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                        <Text
                                            style={[
                                                styles.badgeName,
                                                { color: badge.isEarned ? colors.text : colors.textSecondary },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {i18n.language === 'bn' && badge.nameBn ? badge.nameBn : badge.name}
                                        </Text>
                                        {badge.isEarned ? (
                                            <Text style={styles.badgeEarned}>✓ {t('achievements.earned')}</Text>
                                        ) : (
                                            <Text style={[styles.badgePoints, { color: colors.textSecondary }]}>
                                                +{badge.points} {t('achievements.points')}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    streakCard: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#f97316',
        alignItems: 'center',
    },
    streakFire: {
        fontSize: 48,
        marginBottom: 8,
    },
    streakInfo: {
        alignItems: 'center',
    },
    streakNumber: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '800',
    },
    streakLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    streakHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
    streakStats: {
        flexDirection: 'row',
        marginHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    streakStat: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    streakStatValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    streakStatLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
    categorySection: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    badgeItem: {
        width: '30%',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    badgeLocked: {
        opacity: 0.6,
    },
    badgeIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    badgeName: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
    },
    badgeEarned: {
        color: '#16a34a',
        fontSize: 10,
        marginTop: 4,
    },
    badgePoints: {
        fontSize: 10,
        marginTop: 4,
    },
});
