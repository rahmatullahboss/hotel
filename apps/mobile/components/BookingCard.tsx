import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        accentClass: 'bg-emerald-500',
        label: 'Confirmed',
    },
    PENDING: {
        icon: 'clock-o' as const,
        color: '#F59E0B',
        bgClass: 'bg-amber-50 dark:bg-amber-900/30',
        textClass: 'text-amber-600 dark:text-amber-400',
        accentClass: 'bg-amber-500',
        label: 'Pending',
    },
    CANCELLED: {
        icon: 'times-circle' as const,
        color: '#EF4444',
        bgClass: 'bg-red-50 dark:bg-red-900/30',
        textClass: 'text-red-500',
        accentClass: 'bg-red-500',
        label: 'Cancelled',
    },
    COMPLETED: {
        icon: 'check' as const,
        color: '#6B7280',
        bgClass: 'bg-gray-100 dark:bg-gray-700',
        textClass: 'text-gray-500 dark:text-gray-400',
        accentClass: 'bg-gray-400',
        label: 'Completed',
    },
};

export default function BookingCard({ booking }: BookingCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;
    const isPast = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';

    return (
        <TouchableOpacity
            onPress={() => router.push(`/booking/${booking.id}` as any)}
            activeOpacity={0.8}
            className="mb-4"
        >
            <View className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${isPast ? 'opacity-70' : ''}`}>
                {/* Status Accent Bar */}
                <View className={`h-1 ${status.accentClass}`} />

                <View className="p-4">
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-base font-bold text-gray-900 dark:text-white mb-0.5" numberOfLines={1}>
                                {booking.hotelName}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {booking.roomType}
                            </Text>
                        </View>
                        <View className={`flex-row items-center px-2.5 py-1 rounded-full gap-1 ${status.bgClass}`}>
                            <FontAwesome name={status.icon} size={10} color={status.color} />
                            <Text className={`text-xs font-semibold ${status.textClass}`}>
                                {t(`bookings.status.${booking.status.toLowerCase()}`)}
                            </Text>
                        </View>
                    </View>

                    {/* Dates */}
                    <View className="flex-row items-center mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <View className="flex-1 items-center">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold mb-0.5">
                                {t('bookings.checkIn')}
                            </Text>
                            <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(booking.checkIn)}
                            </Text>
                        </View>
                        <View className="px-3">
                            <FontAwesome name="arrow-right" size={12} color="#E63946" />
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold mb-0.5">
                                {t('bookings.checkOut')}
                            </Text>
                            <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(booking.checkOut)}
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {t('bookings.totalPaid')}
                        </Text>
                        <Text className="text-lg font-bold text-primary">
                            ৳{booking.totalPrice?.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
