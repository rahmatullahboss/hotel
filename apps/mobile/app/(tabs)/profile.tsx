import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Switch,
    Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
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
        { icon: 'pencil' as const, label: t('editProfile.title'), route: '/edit-profile' },
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

    // Refresh profile when screen comes into focus (e.g., after login)
    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

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
            {/* Header with Gradient */}
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 16 }]}
            >
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
                            <View style={styles.avatarGlow} />
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <FontAwesome name="user" size={36} color="#fff" />
                            </View>
                            <View style={styles.avatarGlow} />
                        </View>
                        <Text style={styles.userName}>{t('profile.guest')}</Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push('/auth/login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginButtonText}>{t('profile.signIn')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </LinearGradient>

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
        paddingBottom: 28,
        alignItems: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    avatarContainer: {
        marginBottom: 14,
        position: 'relative',
    },
    avatarGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -6,
        left: -6,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarPlaceholder: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.3,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    loginButton: {
        marginTop: 14,
        backgroundColor: '#fff',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
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
        paddingVertical: 14,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
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
