import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

export default function AdvancePaymentScreen() {
    const params = useLocalSearchParams<{
        bookingId: string;
        amount: string;
        hotelName?: string;
    }>();

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(20 * 60); // 20 minutes in seconds
    const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD'>('BKASH');

    const bookingId = params.bookingId || '';
    const amount = Number(params.amount) || 0;
    const hotelName = params.hotelName || 'Hotel';

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) {
            Alert.alert(
                t('payment.expired', 'Booking Expired'),
                t('payment.expiredMessage', 'Your booking hold has expired. Please try booking again.'),
                [
                    {
                        text: t('common.ok', 'OK'),
                        onPress: () => router.replace('/(tabs)/bookings'),
                    },
                ]
            );
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, router, t]);

    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        if (i18n.language === 'bn') {
            const bnMinutes = minutes.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
            const bnSeconds = seconds.toString().padStart(2, '0').replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
            return `${bnMinutes}:${bnSeconds}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    const handlePayment = async () => {
        setLoading(true);

        try {
            const { data, error } = await api.initiatePayment(bookingId, amount);

            if (error) {
                Alert.alert(t('common.error'), error);
                return;
            }

            if (data?.success && data.redirectUrl) {
                // Open bKash payment page in browser
                const canOpen = await Linking.canOpenURL(data.redirectUrl);
                if (canOpen) {
                    await Linking.openURL(data.redirectUrl);
                    // After payment, user will be redirected back
                    // For now, navigate to bookings to check status
                    Alert.alert(
                        t('payment.redirecting', 'Payment Started'),
                        t('payment.checkStatusAfter', 'Complete the payment in the browser. Then check your bookings for status.'),
                        [
                            {
                                text: t('booking.viewBookings'),
                                onPress: () => router.replace('/(tabs)/bookings'),
                            },
                        ]
                    );
                } else {
                    Alert.alert(t('common.error'), t('payment.cannotOpen', 'Cannot open payment page'));
                }
            } else {
                Alert.alert(t('common.error'), data?.error || t('payment.failed', 'Payment initiation failed'));
            }
        } catch (err) {
            Alert.alert(t('common.error'), t('payment.failed', 'Payment initiation failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        Alert.alert(
            t('payment.skipTitle', 'Skip Payment?'),
            t('payment.skipMessage', 'Your booking will remain pending and may be cancelled if payment is not completed within 20 minutes.'),
            [
                {
                    text: t('common.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('payment.skipConfirm', 'Skip for Now'),
                    onPress: () => router.replace('/(tabs)/bookings'),
                    style: 'destructive',
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: t('payment.title', 'Complete Payment'),
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            <View className="flex-1 p-4">
                {/* Timer Warning */}
                <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center gap-2 mb-2">
                        <FontAwesome name="clock-o" size={18} color="#F59E0B" />
                        <Text className="text-yellow-700 dark:text-yellow-400 font-semibold">
                            {t('payment.roomHeld', 'Room Held for You')}
                        </Text>
                    </View>
                    <Text className="text-3xl font-bold text-yellow-700 dark:text-yellow-400 text-center my-2">
                        {formatCountdown()}
                    </Text>
                    <Text className="text-sm text-yellow-600 dark:text-yellow-500 text-center">
                        {t('payment.completeToConfirm', 'Complete payment to confirm your booking')}
                    </Text>
                </View>

                {/* Amount Card */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-gray-500 dark:text-gray-400 text-center mb-1">
                        {t('payment.advanceAmount', '20% Advance Payment')}
                    </Text>
                    <Text className="text-4xl font-bold text-primary text-center">
                        {t('common.currency')}{formatPrice(amount)}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                        {hotelName}
                    </Text>
                </View>

                {/* Payment Method Selection */}
                <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t('payment.selectMethod', 'Select Payment Method')}
                    </Text>

                    <TouchableOpacity
                        className={`flex-row items-center gap-4 p-4 rounded-xl border-2 mb-3 ${paymentMethod === 'BKASH'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700'
                            }`}
                        onPress={() => setPaymentMethod('BKASH')}
                        activeOpacity={0.7}
                    >
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${paymentMethod === 'BKASH' ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                            <FontAwesome
                                name="mobile"
                                size={20}
                                color={paymentMethod === 'BKASH' ? '#fff' : '#6B7280'}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className={`font-semibold ${paymentMethod === 'BKASH' ? 'text-primary' : 'text-gray-900 dark:text-white'
                                }`}>
                                {t('booking.bKash', 'bKash')}
                            </Text>
                            <Text className="text-xs text-gray-500">
                                {t('payment.instantPayment', 'Instant mobile payment')}
                            </Text>
                        </View>
                        {paymentMethod === 'BKASH' && (
                            <FontAwesome name="check-circle" size={22} color="#E63946" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-row items-center gap-4 p-4 rounded-xl border-2 opacity-50 ${paymentMethod === 'NAGAD'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700'
                            }`}
                        disabled
                        activeOpacity={0.7}
                    >
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${paymentMethod === 'NAGAD' ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                            <FontAwesome
                                name="mobile"
                                size={20}
                                color="#6B7280"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 font-semibold">
                                {t('booking.nagad', 'Nagad')}
                            </Text>
                            <Text className="text-xs text-gray-400">
                                {t('common.comingSoon', 'Coming Soon')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Info Note */}
                <View className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-4">
                    <View className="flex-row items-start gap-2">
                        <FontAwesome name="info-circle" size={16} color="#3B82F6" />
                        <Text className="flex-1 text-sm text-blue-700 dark:text-blue-400">
                            {t('payment.infoNote', 'After payment, the remaining amount will be paid at the hotel during check-in.')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom CTA */}
            <View
                className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-5 pt-4"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <TouchableOpacity
                    className="bg-primary py-4 rounded-2xl items-center flex-row justify-center gap-2 mb-3"
                    onPress={handlePayment}
                    disabled={loading}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesome name="credit-card" size={18} color="#fff" />
                            <Text className="text-white text-lg font-bold">
                                {t('payment.payNow', 'Pay Now')} - {t('common.currency')}{formatPrice(amount)}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="py-3 items-center"
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text className="text-gray-500 dark:text-gray-400">
                        {t('payment.payLater', 'Pay Later')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
