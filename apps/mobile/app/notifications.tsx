import { useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MdNotifications, MdEmail, MdLocalOffer, MdCheckCircle } from 'react-icons/md';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

interface NotificationPrefs {
    bookingConfirmation: boolean;
    checkInInstructions: boolean;
    promotions: boolean;
}

export default function NotificationsScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [prefs, setPrefs] = useState<NotificationPrefs>({
        bookingConfirmation: true,
        checkInInstructions: true,
        promotions: true,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchPreferences = useCallback(async () => {
        const { data, error } = await api.getNotificationPreferences();
        if (data) {
            setPrefs(data);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPreferences();
        }, [fetchPreferences])
    );

    const handleToggle = async (key: keyof NotificationPrefs) => {
        const newValue = !prefs[key];
        setUpdating(key);

        // Optimistic update
        setPrefs((prev) => ({ ...prev, [key]: newValue }));

        const { data, error } = await api.updateNotificationPreferences({
            [key]: newValue,
        });

        if (error) {
            // Revert on error
            setPrefs((prev) => ({ ...prev, [key]: !newValue }));
        }

        setUpdating(null);
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const notificationItems = [
        {
            key: 'bookingConfirmation' as const,
            icon: MdCheckCircle,
            title: t('notifications.bookingConfirmation'),
            description: t('notifications.bookingConfirmationDesc'),
        },
        {
            key: 'checkInInstructions' as const,
            icon: MdEmail,
            title: t('notifications.checkInInstructions'),
            description: t('notifications.checkInInstructionsDesc'),
        },
        {
            key: 'promotions' as const,
            icon: MdLocalOffer,
            title: t('notifications.promotions'),
            description: t('notifications.promotionsDesc'),
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('notifications.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <MdNotifications size={32} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>{t('notifications.headerTitle')}</Text>
                    <Text style={styles.headerSubtitle}>{t('notifications.headerSubtitle')}</Text>
                </View>

                {/* Settings */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    {notificationItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <View
                                key={item.key}
                                style={[
                                    styles.settingItem,
                                    {
                                        backgroundColor: 'transparent',
                                        borderBottomColor: colors.border,
                                        borderBottomWidth: index < notificationItems.length - 1 ? 1 : 0,
                                    },
                                ]}
                            >
                                <View style={[styles.iconWrapper, { backgroundColor: `${Colors.primary}15` }]}>
                                    <Icon size={20} color={Colors.primary} />
                                </View>
                                <View style={[styles.settingContent, { backgroundColor: 'transparent' }]}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                                        {item.description}
                                    </Text>
                                </View>
                                <Switch
                                    value={prefs[item.key]}
                                    onValueChange={() => handleToggle(item.key)}
                                    disabled={updating === item.key}
                                    trackColor={{ false: '#D1D5DB', true: Colors.primary }}
                                    thumbColor="#FFFFFF"
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Info */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        {t('notifications.infoText')}
                    </Text>
                </View>

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
    header: {
        backgroundColor: Colors.primary,
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    settingContent: {
        flex: 1,
        marginRight: 12,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingDesc: {
        fontSize: 12,
    },
    infoCard: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        padding: 16,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    },
});
