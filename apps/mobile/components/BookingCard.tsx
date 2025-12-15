import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

interface Booking {
    id: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
}

interface BookingCardProps {
    booking: Booking;
    index: number;
}

const STATUS_CONFIG = {
    CONFIRMED: {
        icon: 'check-circle' as const,
        color: '#10B981',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        accentClass: 'bg-emerald-500',
    },
    PENDING: {
        icon: 'clock-o' as const,
        color: '#F59E0B',
        bgClass: 'bg-amber-50 dark:bg-amber-900/20',
        textClass: 'text-amber-600 dark:text-amber-400',
        accentClass: 'bg-amber-500',
    },
    CANCELLED: {
        icon: 'times-circle' as const,
        color: '#EF4444',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-500',
        accentClass: 'bg-red-500',
    },
    COMPLETED: {
        icon: 'check' as const,
        color: '#6B7280',
        bgClass: 'bg-gray-100 dark:bg-gray-700',
        textClass: 'text-gray-600 dark:text-gray-400',
        accentClass: 'bg-gray-500',
    },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BookingCard({ booking, index }: BookingCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const scale = useSharedValue(1);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' });
        return { day, month };
    };

    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;
    const checkIn = formatDate(booking.checkIn);
    const checkOut = formatDate(booking.checkOut);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            entering={FadeIn.delay(index * 50).duration(250)}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push(`/booking/${booking.id}` as any)}
            className="mb-4"
        >
            <View
                className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.1,
                    shadowRadius: 16,
                    elevation: 8,
                }}
            >
                {/* Status Accent Bar */}
                <View className={`h-1 ${status.accentClass}`} />

                <View className="p-5">
                    {/* Header: Hotel Name + Status */}
                    <View className="flex-row items-start justify-between mb-4">
                        <View className="flex-1 mr-3">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                                {booking.hotelName}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.roomType}
                            </Text>
                        </View>
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full gap-1.5 ${status.bgClass}`}>
                            <FontAwesome name={status.icon} size={11} color={status.color} />
                            <Text className={`text-xs font-bold ${status.textClass}`}>
                                {t(`bookings.status.${booking.status.toLowerCase()}`)}
                            </Text>
                        </View>
                    </View>

                    {/* Date Cards */}
                    <View className="flex-row items-center mb-4">
                        {/* Check In */}
                        <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center">
                            <Text className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-bold tracking-wider mb-1">
                                {t('bookings.checkIn')}
                            </Text>
                            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                {checkIn.day}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {checkIn.month}
                            </Text>
                        </View>

                        {/* Arrow */}
                        <View className="px-3">
                            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                                <FontAwesome name="long-arrow-right" size={14} color="#E63946" />
                            </View>
                        </View>

                        {/* Check Out */}
                        <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 items-center">
                            <Text className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-bold tracking-wider mb-1">
                                {t('bookings.checkOut')}
                            </Text>
                            <Text className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                {checkOut.day}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {checkOut.month}
                            </Text>
                        </View>
                    </View>

                    {/* Footer: Price */}
                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                        <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {t('bookings.totalPaid')}
                        </Text>
                        <Text className="text-xl font-extrabold text-primary">
                            ৳{booking.totalPrice?.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
