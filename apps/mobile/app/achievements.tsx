import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api, { getToken } from '@/lib/api';

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
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const [data, setData] = useState<AchievementsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAchievements = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            setData(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        await api.recordDailyLogin();
        const { data: achievementsData, error } = await api.getAchievements();
        if (achievementsData && !error) {
            setData(achievementsData);
        } else if (error) {
            setData(null);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAchievements();
        }, [fetchAchievements])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAchievements();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-gray-900">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: t('achievements.title'),
                        headerStyle: { backgroundColor: '#E63946' },
                        headerTintColor: '#fff',
                    }}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
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
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('achievements.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
                }
            >
                {/* Streak Card */}
                <View className="mx-5 mt-5 p-6 rounded-2xl bg-orange-500 items-center">
                    <Text className="text-5xl mb-2">🔥</Text>
                    <View className="items-center">
                        <Text className="text-white text-5xl font-extrabold">
                            {data?.streak?.currentStreak || 0}
                        </Text>
                        <Text className="text-white/90 text-sm">{t('achievements.dayStreak')}</Text>
                    </View>
                    {data?.streak?.nextReward && (
                        <Text className="text-white/80 text-xs mt-3 text-center">
                            {t('achievements.nextReward', {
                                days: data.streak.daysUntilReward,
                                reward: data.streak.nextReward.reward,
                            })}
                        </Text>
                    )}
                </View>

                {/* Streak Stats */}
                <View className="flex-row mx-5 mt-5 gap-3">
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            {data?.streak?.longestStreak || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            {t('achievements.bestStreak')}
                        </Text>
                    </View>
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            {data?.streak?.totalLoginDays || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            {t('achievements.totalDays')}
                        </Text>
                    </View>
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">
                            {data?.earnedCount || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
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
                        <View key={category.key} className="mx-5 mt-4 p-4 rounded-2xl bg-white dark:bg-gray-800">
                            <View className="flex-row items-center gap-2 mb-4">
                                <FontAwesome
                                    name={CATEGORY_ICONS[category.key] as any || 'trophy'}
                                    size={18}
                                    color="#E63946"
                                />
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                    {category.label}
                                </Text>
                            </View>
                            <View className="flex-row flex-wrap gap-3">
                                {categoryBadges.map((badge) => (
                                    <View
                                        key={badge.id}
                                        className={`w-[30%] p-3 rounded-xl items-center ${badge.isEarned
                                            ? 'bg-primary/15'
                                            : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                                            }`}
                                    >
                                        <Text className="text-3xl mb-2">{badge.icon}</Text>
                                        <Text
                                            className={`text-xs font-semibold text-center ${badge.isEarned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                                }`}
                                            numberOfLines={1}
                                        >
                                            {i18n.language === 'bn' && badge.nameBn ? badge.nameBn : badge.name}
                                        </Text>
                                        {badge.isEarned ? (
                                            <Text className="text-xs text-green-600 mt-1">✓ {t('achievements.earned')}</Text>
                                        ) : (
                                            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                +{badge.points} {t('achievements.points')}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
