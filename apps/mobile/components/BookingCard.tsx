import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    FadeInDown,
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

const STATUS_COLORS = {
    CONFIRMED: { bg: 'bg-teal-500', text: 'text-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-900/30', color: '#0D9488' },
    PENDING: { bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-900/30', color: '#D97706' },
    CANCELLED: { bg: 'bg-red-500', text: 'text-red-500', bgLight: 'bg-red-50 dark:bg-red-900/30', color: '#EF4444' },
    COMPLETED: { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', bgLight: 'bg-gray-100 dark:bg-gray-700', color: '#6B7280' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BookingCard({ booking, index }: BookingCardProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const STATUS_CONFIG = {
        CONFIRMED: { icon: 'check-circle' as const, label: t('bookings.status.confirmed') },
        PENDING: { icon: 'clock-o' as const, label: t('bookings.status.pending') },
        CANCELLED: { icon: 'times-circle' as const, label: t('bookings.status.cancelled') },
        COMPLETED: { icon: 'check' as const, label: t('bookings.status.completed') },
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const status = STATUS_CONFIG[booking.status] || { icon: 'question-circle' as const, label: booking.status || 'Unknown' };
    const colors = STATUS_COLORS[booking.status] || STATUS_COLORS.COMPLETED;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            entering={FadeInDown.delay(index * 80).springify().damping(18)}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push(`/booking/${booking.id}` as any)}
            className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
        >
            {/* Status Bar */}
            <View className={`h-1.5 ${colors.bg}`} />

            <View className="p-4">
                <View className="flex-row items-start mb-4">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1 tracking-tight" numberOfLines={1}>
                            {booking.hotelName}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.roomType}
                        </Text>
                    </View>
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full gap-1.5 ${colors.bgLight}`}>
                        <FontAwesome name={status.icon} size={12} color={colors.color} />
                        <Text className={`text-xs font-bold ${colors.text}`}>
                            {status.label}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-4 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700">
                    <View className="flex-1 items-center">
                        <Text className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold tracking-wide">
                            {t('bookings.checkIn')}
                        </Text>
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {formatDate(booking.checkIn)}
                        </Text>
                    </View>
                    <View className="px-4">
                        <FontAwesome name="arrow-right" size={14} color="#E63946" />
                    </View>
                    <View className="flex-1 items-center">
                        <Text className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1 font-semibold tracking-wide">
                            {t('bookings.checkOut')}
                        </Text>
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {formatDate(booking.checkOut)}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t('bookings.totalPaid')}
                    </Text>
                    <Text className="text-xl font-bold text-primary">
                        ৳{booking.totalPrice?.toLocaleString()}
                    </Text>
                </View>
            </View>
        </AnimatedPressable>
    );
}
