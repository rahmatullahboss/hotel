import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Switch,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '@/lib/api';

interface NotificationPrefs {
    bookingConfirmation: boolean;
    checkInInstructions: boolean;
    promotions: boolean;
}

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [prefs, setPrefs] = useState<NotificationPrefs>({
        bookingConfirmation: true,
        checkInInstructions: true,
        promotions: true,
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);

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

    const handleTestNotification = async () => {
        setTesting(true);
        try {
            // First check if tokens are registered
            const { data: tokenData } = await api.checkPushTokens();
            console.log('Token check:', tokenData);

            if (!tokenData?.hasTokens) {
                Alert.alert(
                    'No Push Token',
                    `No push tokens found for your account. UserId: ${tokenData?.userId || 'unknown'}`,
                    [{ text: 'OK' }]
                );
                setTesting(false);
                return;
            }

            // Send test notification
            const { data, error } = await api.testNotification();
            console.log('Test notification result:', data, error);

            if (data?.success) {
                Alert.alert(
                    '✓ Notification Sent',
                    `Test notification sent to ${data.tokensFound} device(s). Check your notification tray!`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Failed',
                    data?.message || error || 'Could not send notification',
                    [{ text: 'OK' }]
                );
            }
        } catch (err) {
            console.error('Test notification error:', err);
            Alert.alert('Error', 'Failed to test notification');
        }
        setTesting(false);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-gray-900">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: t('notifications.title'),
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

    const notificationItems = [
        {
            key: 'bookingConfirmation' as const,
            icon: 'check-circle' as const,
            title: t('notifications.bookingConfirmation'),
            description: t('notifications.bookingConfirmationDesc'),
        },
        {
            key: 'checkInInstructions' as const,
            icon: 'envelope-o' as const,
            title: t('notifications.checkInInstructions'),
            description: t('notifications.checkInInstructionsDesc'),
        },
        {
            key: 'promotions' as const,
            icon: 'tag' as const,
            title: t('notifications.promotions'),
            description: t('notifications.promotionsDesc'),
        },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('notifications.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="bg-primary py-8 px-5 items-center rounded-b-3xl mb-5">
                    <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4">
                        <FontAwesome name="bell" size={28} color="#fff" />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2">
                        {t('notifications.headerTitle')}
                    </Text>
                    <Text className="text-white/80 text-sm text-center">
                        {t('notifications.headerSubtitle')}
                    </Text>
                </View>

                {/* Settings */}
                <View className="mx-5 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                    {notificationItems.map((item, index) => (
                        <View
                            key={item.key}
                            className={`flex-row items-center p-4 ${index < notificationItems.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                                }`}
                        >
                            <View className="w-10 h-10 rounded-xl bg-primary/15 items-center justify-center mr-3.5">
                                <FontAwesome name={item.icon} size={18} color="#E63946" />
                            </View>
                            <View className="flex-1 mr-3">
                                <Text className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                                    {item.title}
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.description}
                                </Text>
                            </View>
                            <Switch
                                value={prefs[item.key]}
                                onValueChange={() => handleToggle(item.key)}
                                disabled={updating === item.key}
                                trackColor={{ false: '#D1D5DB', true: '#E63946' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    ))}
                </View>

                {/* Test Notification */}
                <View className="mx-5 mt-5">
                    <TouchableOpacity
                        onPress={handleTestNotification}
                        disabled={testing}
                        className="flex-row items-center justify-center p-4 rounded-xl bg-blue-500"
                        activeOpacity={0.8}
                    >
                        {testing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <FontAwesome name="bell-o" size={18} color="#fff" />
                                <Text className="text-white font-semibold ml-2">
                                    Send Test Notification
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Tap to verify notifications are working properly
                    </Text>
                </View>

                {/* Info */}
                <View className="mx-5 mt-5 rounded-xl p-4 bg-white dark:bg-gray-800">
                    <Text className="text-xs text-gray-500 dark:text-gray-400 text-center leading-5">
                        {t('notifications.infoText')}
                    </Text>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}

