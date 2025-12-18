import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

/**
 * Advance Payment Screen - Currently Disabled
 * 
 * TODO: This screen will be enabled when payment gateway (bKash/Nagad) is implemented.
 * For now, all bookings are Pay at Hotel only.
 */
export default function AdvancePaymentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // Redirect to bookings since payment is not functional
    useEffect(() => {
        // Auto-redirect after 3 seconds
        const timer = setTimeout(() => {
            router.replace('/(tabs)/bookings');
        }, 3000);
        return () => clearTimeout(timer);
    }, [router]);

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

            <View className="flex-1 items-center justify-center p-6">
                {/* Coming Soon Message */}
                <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center shadow-lg mx-4">
                    <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-6">
                        <FontAwesome name="credit-card" size={36} color="#3B82F6" />
                    </View>

                    <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {t('common.comingSoon', 'Coming Soon')}
                    </Text>

                    <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
                        {t('payment.gatewayComingSoon', 'Online payment will be available soon. For now, please pay at the hotel during check-in.')}
                    </Text>

                    <TouchableOpacity
                        className="bg-primary py-4 px-8 rounded-2xl"
                        onPress={() => router.replace('/(tabs)/bookings')}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-bold text-lg">
                            {t('booking.viewBookings', 'View My Bookings')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Info Note */}
                <View className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mx-4">
                    <View className="flex-row items-center gap-2">
                        <FontAwesome name="info-circle" size={16} color="#3B82F6" />
                        <Text className="flex-1 text-sm text-blue-700 dark:text-blue-400">
                            {t('booking.payAtHotelFull', 'Pay full amount at hotel check-in')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

/*
 * =============================================================================
 * ORIGINAL CODE - COMMENTED OUT UNTIL PAYMENT GATEWAY IS IMPLEMENTED
 * =============================================================================
 * 
 * TODO: Uncomment this code when bKash/Nagad payment gateway integration is complete
 * 
 * import { useState, useEffect } from 'react';
 * import {
 *     View,
 *     Text,
 *     TouchableOpacity,
 *     ActivityIndicator,
 *     Alert,
 *     Linking,
 * } from 'react-native';
 * import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
 * import { useSafeAreaInsets } from 'react-native-safe-area-context';
 * import FontAwesome from '@expo/vector-icons/FontAwesome';
 * import { useTranslation } from 'react-i18next';
 * import api from '@/lib/api';
 * 
 * export default function AdvancePaymentScreen() {
 *     const params = useLocalSearchParams<{
 *         bookingId: string;
 *         amount: string;
 *         hotelName?: string;
 *     }>();
 * 
 *     const router = useRouter();
 *     const insets = useSafeAreaInsets();
 *     const { t, i18n } = useTranslation();
 * 
 *     const [loading, setLoading] = useState(false);
 *     const [countdown, setCountdown] = useState(20 * 60); // 20 minutes in seconds
 *     const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD'>('BKASH');
 * 
 *     const bookingId = params.bookingId || '';
 *     const amount = Number(params.amount) || 0;
 *     const hotelName = params.hotelName || 'Hotel';
 * 
 *     // Countdown timer
 *     useEffect(() => {
 *         if (countdown <= 0) {
 *             Alert.alert(
 *                 t('payment.expired', 'Booking Expired'),
 *                 t('payment.expiredMessage', 'Your booking hold has expired. Please try booking again.'),
 *                 [
 *                     {
 *                         text: t('common.ok', 'OK'),
 *                         onPress: () => router.replace('/(tabs)/bookings'),
 *                     },
 *                 ]
 *             );
 *             return;
 *         }
 * 
 *         const timer = setInterval(() => {
 *             setCountdown((prev) => prev - 1);
 *         }, 1000);
 * 
 *         return () => clearInterval(timer);
 *     }, [countdown, router, t]);
 * 
 *     // ... rest of the original code ...
 * }
 */

