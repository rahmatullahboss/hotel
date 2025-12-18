import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import api, { removeToken } from '@/lib/api';
import { changeLanguage } from '@/i18n';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileStatsCard } from '@/components/ProfileStatsCard';
import { ProfileMenuSection, ProfileMenuItem } from '@/components/ProfileMenuSection';

interface User {
    name: string;
    email: string;
    image?: string;
}

interface WalletData {
    balance: number;
    points: number;
    tier: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { t, i18n } = useTranslation();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState<WalletData>({ balance: 0, points: 0, tier: 'BRONZE' });
    const [bookingsCount, setBookingsCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
            fetchWalletData();
            fetchBookingsCount();
        }, [])
    );

    const fetchProfile = async () => {
        const { data, error } = await api.getProfile();
        if (data) {
            setUser(data);
        } else if (error) {
            setUser(null);
        }
        setLoading(false);
    };

    const fetchWalletData = async () => {
        const { data } = await api.getWallet();
        if (data) {
            setWalletData({
                balance: data.balance || 0,
                points: data.loyalty?.points || 0,
                tier: data.loyalty?.tier || 'BRONZE',
            });
        }
    };

    const fetchBookingsCount = async () => {
        const { data } = await api.getMyBookings();
        if (data) {
            setBookingsCount(data.length);
        }
    };

    const handleLogout = async () => {
        setUser(null);
        await removeToken();
        router.replace('/');
    };

    const handleLanguageChange = async (lang: 'en' | 'bn') => {
        await changeLanguage(lang);
    };

    // Menu sections configuration
    const accountItems: ProfileMenuItem[] = [
        {
            icon: 'pencil',
            label: t('editProfile.title'),
            onPress: () => router.push('/edit-profile'),
        },
        {
            icon: 'qrcode',
            label: t('qrScanner.title'),
            onPress: () => router.push('/qr-scanner'),
        },
    ];

    const travelItems: ProfileMenuItem[] = [
        {
            icon: 'suitcase',
            label: t('profile.menu.myTrips'),
            onPress: () => router.push('/(tabs)/bookings'),
        },
        {
            icon: 'heart-o',
            label: t('profile.menu.savedHotels'),
            onPress: () => router.push('/saved'),
        },
    ];

    const rewardsItems: ProfileMenuItem[] = [
        {
            icon: 'credit-card',
            label: t('profile.menu.wallet'),
            onPress: () => router.push('/wallet'),
        },
        {
            icon: 'gift',
            label: t('profile.menu.referral'),
            onPress: () => router.push('/referral'),
        },
        {
            icon: 'trophy',
            label: t('profile.menu.achievements'),
            onPress: () => router.push('/achievements'),
        },
        {
            icon: 'tag',
            label: t('profile.menu.offersRewards'),
            onPress: () => router.push('/achievements'),
        },
    ];

    const supportItems: ProfileMenuItem[] = [
        {
            icon: 'bell-o',
            label: t('profile.menu.notifications'),
            onPress: () => router.push('/notifications'),
        },
        {
            icon: 'question-circle-o',
            label: t('profile.menu.helpSupport'),
            onPress: () => router.push('/help'),
        },
    ];

    // Stats configuration
    const stats = [
        {
            icon: 'suitcase' as const,
            value: bookingsCount,
            label: t('profile.stats.bookings', 'Bookings'),
            onPress: () => router.push('/(tabs)/bookings'),
        },
        {
            icon: 'credit-card' as const,
            value: `৳${walletData.balance}`,
            label: t('profile.stats.wallet', 'Wallet'),
            onPress: () => router.push('/wallet'),
        },
        {
            icon: 'star' as const,
            value: walletData.points,
            label: t('profile.stats.points', 'Points'),
            onPress: () => router.push('/achievements'),
        },
    ];

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Premium Header */}
                <ProfileHeader
                    user={user}
                    membershipTier={walletData.tier}
                    onSignIn={() => router.push('/auth/login')}
                    onEditProfile={() => router.push('/edit-profile')}
                    t={t}
                />

                {/* Stats Card */}
                {user && <ProfileStatsCard stats={stats} />}

                {/* Account Section */}
                {user && (
                    <ProfileMenuSection
                        title={t('profile.sections.account', 'Account')}
                        items={accountItems}
                    />
                )}

                {/* Travel Section */}
                {user && (
                    <ProfileMenuSection
                        title={t('profile.sections.travel', 'Bookings & Travel')}
                        items={travelItems}
                    />
                )}

                {/* Rewards Section */}
                {user && (
                    <ProfileMenuSection
                        title={t('profile.sections.rewards', 'Wallet & Rewards')}
                        items={rewardsItems}
                    />
                )}

                {/* Preferences Section */}
                <View className="mx-5 mt-4">
                    <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                        {t('profile.sections.preferences', 'Preferences')}
                    </Text>

                    <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                        {/* Language Selector */}
                        <View className="px-4 py-3.5 border-b border-gray-100 dark:border-gray-700">
                            <View className="flex-row items-center mb-3">
                                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                                    <FontAwesome name="language" size={18} color="#E63946" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    {t('profile.language')}
                                </Text>
                            </View>
                            <View className="flex-row gap-3 ml-13">
                                <TouchableOpacity
                                    className={`flex-1 py-2.5 rounded-xl items-center ${i18n.language === 'en'
                                        ? 'bg-primary'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                    onPress={() => handleLanguageChange('en')}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${i18n.language === 'en'
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {t('profile.english')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 py-2.5 rounded-xl items-center ${i18n.language === 'bn'
                                        ? 'bg-primary'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                        }`}
                                    onPress={() => handleLanguageChange('bn')}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${i18n.language === 'bn'
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        {t('profile.bengali')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Dark Mode Toggle */}
                        <View className="flex-row items-center px-4 py-3.5">
                            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                                <FontAwesome name="moon-o" size={18} color="#E63946" />
                            </View>
                            <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">
                                {t('profile.darkMode')}
                            </Text>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: '#D1D5DB', true: '#E63946' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Support Section */}
                <ProfileMenuSection
                    title={t('profile.sections.support', 'Support')}
                    items={supportItems}
                />

                {/* Logout Button */}
                {user && (
                    <View className="mx-5 mt-6">
                        <TouchableOpacity
                            className="flex-row items-center justify-center py-4 rounded-2xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <FontAwesome name="sign-out" size={18} color="#EF4444" />
                            <Text className="text-base font-semibold text-red-500 ml-2">
                                {t('profile.logout')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* App Info Footer */}
                <View className="items-center py-8">
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                        Zinu Rooms v1.0.0
                    </Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://digitalcare.site')}
                        activeOpacity={0.7}
                        className="mt-2"
                    >
                        <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Made with ❤️ by <Text style={{ color: '#E63946', fontWeight: 'bold' }}>DigitalCare</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
