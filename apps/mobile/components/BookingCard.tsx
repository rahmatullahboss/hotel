import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface Booking {
    id: string;
    hotelName: string;
    hotelLocation?: string;
    hotelImage?: string;
    roomName?: string;
    roomType?: string; // Legacy support
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN' | 'CHECKED_OUT';
    totalAmount?: string | number;
    totalPrice?: number; // Legacy support
    paymentMethod?: string;
    paymentStatus?: string;
    bookingFee?: string | number;
    bookingFeeStatus?: string;
    guestName?: string;
    qrCode?: string; // JSON string with booking/hotel/room IDs for check-in
}

interface BookingCardProps {
    booking: Booking;
    index?: number;
}

const STATUS_CONFIG = {
    CONFIRMED: {
        icon: 'check-circle' as const,
        color: '#10B981',
        bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        accentClass: 'bg-emerald-500',
    },
    PENDING: {
        icon: 'clock-o' as const,
        color: '#F59E0B',
        bgClass: 'bg-amber-50 dark:bg-amber-900/30',
        textClass: 'text-amber-600 dark:text-amber-400',
        accentClass: 'bg-amber-500',
    },
    CANCELLED: {
        icon: 'times-circle' as const,
        color: '#EF4444',
        bgClass: 'bg-red-50 dark:bg-red-900/30',
        textClass: 'text-red-500',
        accentClass: 'bg-red-500',
    },
    COMPLETED: {
        icon: 'check' as const,
        color: '#6B7280',
        bgClass: 'bg-gray-100 dark:bg-gray-700',
        textClass: 'text-gray-500 dark:text-gray-400',
        accentClass: 'bg-gray-400',
    },
    CHECKED_IN: {
        icon: 'sign-in' as const,
        color: '#3B82F6',
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        textClass: 'text-blue-600 dark:text-blue-400',
        accentClass: 'bg-blue-500',
    },
    CHECKED_OUT: {
        icon: 'sign-out' as const,
        color: '#6B7280',
        bgClass: 'bg-gray-100 dark:bg-gray-700',
        textClass: 'text-gray-500 dark:text-gray-400',
        accentClass: 'bg-gray-400',
    },
};

const PAYMENT_METHOD_LABELS: Record<string, { key: string; icon: string }> = {
    PAY_AT_HOTEL: { key: 'payAtHotel', icon: 'building' },
    BKASH: { key: 'bKash', icon: 'mobile' },
    NAGAD: { key: 'nagad', icon: 'mobile' },
    CARD: { key: 'card', icon: 'credit-card-alt' },
    WALLET: { key: 'wallet', icon: 'money' },
};

export default function BookingCard({ booking }: BookingCardProps) {
    const { t, i18n } = useTranslation();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null) return '0';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return '0';
        if (i18n.language === 'bn') {
            return numPrice.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return numPrice.toLocaleString('en-US');
    };

    const calculateNights = () => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const diff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(1, diff);
    };

    const handlePress = () => {
        // Pass booking data for instant display while fetching fresh data
        router.push({
            pathname: '/booking-details/[id]',
            params: {
                id: booking.id,
                hotelName: booking.hotelName,
                hotelLocation: booking.hotelLocation || '',
                hotelImage: booking.hotelImage || '',
                roomName: roomName,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                status: booking.status,
                totalAmount: String(totalPrice),
            },
        });
    };

    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;
    const isPast = booking.status === 'COMPLETED' || booking.status === 'CANCELLED' || booking.status === 'CHECKED_OUT';
    const totalPrice = booking.totalAmount ?? booking.totalPrice ?? 0;
    const roomName = booking.roomName ?? booking.roomType ?? 'Room';
    const nights = calculateNights();
    const paymentInfo = PAYMENT_METHOD_LABELS[booking.paymentMethod || 'PAY_AT_HOTEL'];

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="mb-4"
        >
            <View className={`rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 ${isPast ? 'opacity-70' : ''}`}>
                {/* Status Accent Bar */}
                <View className={`h-1 ${status.accentClass}`} />

                <View className="p-4">
                    {/* Header with Image */}
                    <View className="flex-row gap-3 mb-3">
                        {/* Hotel Image */}
                        <Image
                            source={{ uri: booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200' }}
                            className="w-20 h-20 rounded-xl"
                            resizeMode="cover"
                        />

                        {/* Hotel Info */}
                        <View className="flex-1">
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1 mr-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={1}>
                                        {booking.hotelName}
                                    </Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
                                        {roomName}
                                    </Text>
                                    {booking.hotelLocation && (
                                        <View className="flex-row items-center mt-1 gap-1">
                                            <FontAwesome name="map-marker" size={10} color="#9CA3AF" />
                                            <Text className="text-xs text-gray-400" numberOfLines={1}>
                                                {booking.hotelLocation}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                {/* Status Badge */}
                                <View className={`flex-row items-center px-2 py-1 rounded-full gap-1 ${status.bgClass}`}>
                                    <FontAwesome name={status.icon} size={10} color={status.color} />
                                    <Text className={`text-[10px] font-semibold ${status.textClass}`}>
                                        {t(`bookings.status.${booking.status.toLowerCase()}`)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Dates Row */}
                    <View className="flex-row items-center mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <View className="flex-1 items-center">
                            <Text className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold mb-0.5">
                                {t('bookings.checkIn')}
                            </Text>
                            <Text className="text-sm font-bold text-gray-900 dark:text-white">
                                {formatDate(booking.checkIn)}
                            </Text>
                        </View>
                        <View className="px-2 items-center">
                            <View className="bg-primary/10 px-2 py-1 rounded-full">
                                <Text className="text-[10px] font-bold text-primary">
                                    {i18n.language === 'bn' ? nights.toString().replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]) : nights} {nights === 1 ? t('booking.night', 'night') : t('booking.nights', 'nights')}
                                </Text>
                            </View>
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

                    {/* Footer - Price & Expand */}
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                {t('bookings.totalPaid', 'Total')}
                            </Text>
                            <Text className="text-lg font-bold text-primary">
                                ৳{formatPrice(totalPrice)}
                            </Text>
                        </View>

                        <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
