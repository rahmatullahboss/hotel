import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import api, { removeToken } from '@/lib/api';
import { changeLanguage } from '@/i18n';

interface User {
    name: string;
    email: string;
    image?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const MENU_ITEMS = [
        { icon: 'pencil' as const, label: t('editProfile.title'), route: '/edit-profile' },
        { icon: 'qrcode' as const, label: t('qrScanner.title'), route: '/qr-scanner' },
        { icon: 'suitcase' as const, label: t('profile.menu.myTrips'), route: '/(tabs)/bookings' },
        { icon: 'credit-card' as const, label: t('profile.menu.wallet'), route: '/wallet' },
        { icon: 'gift' as const, label: t('profile.menu.referral'), route: '/referral' },
        { icon: 'trophy' as const, label: t('profile.menu.achievements'), route: '/achievements' },
        { icon: 'heart-o' as const, label: t('profile.menu.savedHotels'), route: '/saved' },
        { icon: 'bell-o' as const, label: t('profile.menu.notifications'), route: '/notifications' },
        { icon: 'tag' as const, label: t('profile.menu.offersRewards'), route: '/offers' },
        { icon: 'question-circle-o' as const, label: t('profile.menu.helpSupport'), route: '/help' },
    ];

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const fetchProfile = async () => {
        const { data, error } = await api.getProfile();
        if (data) {
            setUser(data);
        } else if (error) {
            // Clear user if not authenticated or API fails
            setUser(null);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        // Clear user state immediately for instant UI update
        setUser(null);
        await removeToken();
        router.replace('/');
    };

    const handleLanguageChange = async (lang: 'en' | 'bn') => {
        await changeLanguage(lang);
    };

    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center bg-white dark:bg-gray-900"
                style={{ paddingTop: insets.top }}
            >
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View
                className="px-5 pb-7 items-center bg-primary rounded-b-3xl shadow-lg"
                style={{ paddingTop: insets.top + 16 }}
            >
                {user ? (
                    <>
                        <View className="mb-3.5 relative">
                            {user.image ? (
                                <Image
                                    source={{ uri: user.image }}
                                    className="w-22 h-22 rounded-full border-4 border-white/50"
                                    style={{ width: 88, height: 88 }}
                                />
                            ) : (
                                <View className="w-22 h-22 rounded-full bg-white/35 items-center justify-center border-4 border-white/50" style={{ width: 88, height: 88 }}>
                                    <Text className="text-4xl font-bold text-white">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                            <View className="absolute -top-1.5 -left-1.5 w-24 h-24 rounded-full bg-white/10" style={{ width: 100, height: 100 }} />
                        </View>
                        <Text className="text-2xl font-bold text-white tracking-tight">
                            {user.name}
                        </Text>
                        <Text className="text-sm text-white/85 mt-1">{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View className="mb-3.5 relative">
                            <View className="w-22 h-22 rounded-full bg-white/35 items-center justify-center border-4 border-white/50" style={{ width: 88, height: 88 }}>
                                <FontAwesome name="user" size={36} color="#fff" />
                            </View>
                            <View className="absolute -top-1.5 -left-1.5 w-24 h-24 rounded-full bg-white/10" style={{ width: 100, height: 100 }} />
                        </View>
                        <Text className="text-2xl font-bold text-white">{t('profile.guest')}</Text>
                        <TouchableOpacity
                            className="mt-3.5 bg-white px-8 py-3 rounded-full shadow-md"
                            onPress={() => router.push('/auth/login')}
                            activeOpacity={0.8}
                        >
                            <Text className="text-primary font-semibold text-sm">
                                {t('profile.signIn')}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Language Selector */}
                <View className="mx-5 mt-5 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <View className="flex-row items-center p-4 pb-2">
                        <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                            <FontAwesome name="language" size={18} color="#E63946" />
                        </View>
                        <Text className="text-base font-medium text-gray-900 dark:text-white">
                            {t('profile.language')}
                        </Text>
                    </View>
                    <View className="flex-row px-4 pb-4 gap-3">
                        <TouchableOpacity
                            className={`flex-1 py-2.5 px-4 rounded-lg border items-center ${i18n.language === 'en'
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 dark:border-gray-600'
                                }`}
                            onPress={() => handleLanguageChange('en')}
                        >
                            <Text
                                className={`text-sm font-semibold ${i18n.language === 'en' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {t('profile.english')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2.5 px-4 rounded-lg border items-center ${i18n.language === 'bn'
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200 dark:border-gray-600'
                                }`}
                            onPress={() => handleLanguageChange('bn')}
                        >
                            <Text
                                className={`text-sm font-semibold ${i18n.language === 'bn' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {t('profile.bengali')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Theme Toggle */}
                <View className="mx-5 mt-3 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <View className="flex-row items-center p-4">
                        <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
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

                {/* Menu Items */}
                <View className="mx-5 mt-3 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            className={`flex-row items-center p-4 py-3.5 ${index < MENU_ITEMS.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                                }`}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <View className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                                <FontAwesome name={item.icon} size={18} color="#E63946" />
                            </View>
                            <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">
                                {item.label}
                            </Text>
                            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                {user && (
                    <TouchableOpacity
                        className="mx-5 mt-4 flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 gap-2.5"
                        onPress={handleLogout}
                    >
                        <FontAwesome name="sign-out" size={18} color="#EF4444" />
                        <Text className="text-base font-semibold text-red-500">
                            {t('profile.logout')}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* App Info */}
                <View className="items-center p-6">
                    <Text className="text-xs text-gray-400 dark:text-gray-500">
                        Zinu Rooms v1.0.0
                    </Text>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
