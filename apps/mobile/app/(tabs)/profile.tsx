import { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Switch,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
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
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const MENU_ITEMS = [
        { icon: 'suitcase' as const, label: t('profile.menu.myTrips'), route: '/(tabs)/bookings' },
        { icon: 'heart-o' as const, label: t('profile.menu.savedHotels'), route: '/saved' },
        { icon: 'credit-card' as const, label: t('profile.menu.paymentMethods'), route: '/payment-methods' },
        { icon: 'bell-o' as const, label: t('profile.menu.notifications'), route: '/notifications' },
        { icon: 'gift' as const, label: t('profile.menu.offersRewards'), route: '/offers' },
        { icon: 'question-circle-o' as const, label: t('profile.menu.helpSupport'), route: '/help' },
    ];

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data } = await api.getProfile();
        if (data) {
            setUser(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await removeToken();
        router.replace('/');
    };

    const handleLanguageChange = async (lang: 'en' | 'bn') => {
        await changeLanguage(lang);
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: Colors.primary }]}>
                {user ? (
                    <>
                        <View style={styles.avatarContainer}>
                            {user.image ? (
                                <Image source={{ uri: user.image }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <FontAwesome name="user" size={32} color="#fff" />
                            </View>
                        </View>
                        <Text style={styles.userName}>{t('profile.guest')}</Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push('/auth/login')}
                        >
                            <Text style={styles.loginButtonText}>{t('profile.signIn')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Language Selector */}
                <View style={[styles.themeSection, { backgroundColor: colors.card }]}>
                    <View style={[styles.languageRow, { backgroundColor: 'transparent' }]}>
                        <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.primary}10` }]}>
                            <FontAwesome name="language" size={18} color={Colors.primary} />
                        </View>
                        <Text style={[styles.menuLabel, { color: colors.text }]}>{t('profile.language')}</Text>
                    </View>
                    <View style={[styles.languageOptions, { backgroundColor: 'transparent' }]}>
                        <TouchableOpacity
                            style={[
                                styles.languageOption,
                                i18n.language === 'en' && styles.languageOptionActive
                            ]}
                            onPress={() => handleLanguageChange('en')}
                        >
                            <Text style={[
                                styles.languageText,
                                { color: i18n.language === 'en' ? Colors.primary : colors.textSecondary }
                            ]}>
                                {t('profile.english')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.languageOption,
                                i18n.language === 'bn' && styles.languageOptionActive
                            ]}
                            onPress={() => handleLanguageChange('bn')}
                        >
                            <Text style={[
                                styles.languageText,
                                { color: i18n.language === 'bn' ? Colors.primary : colors.textSecondary }
                            ]}>
                                {t('profile.bengali')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Theme Toggle */}
                <View style={[styles.themeSection, { backgroundColor: colors.card }]}>
                    <View style={[styles.themeRow, { backgroundColor: 'transparent' }]}>
                        <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.primary}10` }]}>
                            <FontAwesome name="moon-o" size={18} color={Colors.primary} />
                        </View>
                        <Text style={[styles.menuLabel, { color: colors.text }]}>{t('profile.darkMode')}</Text>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                {
                                    backgroundColor: colors.card,
                                    borderBottomColor: colors.border,
                                    borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                                }
                            ]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.primary}10` }]}>
                                <FontAwesome name={item.icon} size={18} color={Colors.primary} />
                            </View>
                            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                            <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                {user && (
                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={handleLogout}
                    >
                        <FontAwesome name="sign-out" size={18} color={Colors.light.error} />
                        <Text style={[styles.logoutText, { color: Colors.light.error }]}>{t('profile.logout')}</Text>
                    </TouchableOpacity>
                )}

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                        Vibe Hospitality v1.0.0
                    </Text>
                </View>

                <View style={{ height: 20 }} />
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    loginButton: {
        marginTop: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
    },
    loginButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    themeSection: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    themeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    languageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    languageOptions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    languageOption: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center',
    },
    languageOptionActive: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}10`,
    },
    languageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    menuSection: {
        margin: 20,
        marginTop: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
    },
    appInfo: {
        alignItems: 'center',
        padding: 24,
    },
    appVersion: {
        fontSize: 12,
    },
});
