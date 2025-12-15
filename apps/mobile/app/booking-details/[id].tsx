import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '@/lib/api';

interface BookingDetails {
    id: string;
    hotelName: string;
    hotelLocation?: string;
    hotelImage?: string;
    roomName?: string;
    roomType?: string;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'CHECKED_IN' | 'CHECKED_OUT';
    totalAmount?: string | number;
    totalPrice?: number;
    paymentMethod?: string;
    paymentStatus?: string;
    bookingFee?: string | number;
    bookingFeeStatus?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    qrCode?: string;
    numberOfNights?: number;
}

const STATUS_CONFIG = {
    CONFIRMED: { icon: 'check-circle' as const, color: '#10B981', bgClass: 'bg-emerald-50 dark:bg-emerald-900/30', textClass: 'text-emerald-600 dark:text-emerald-400' },
    PENDING: { icon: 'clock-o' as const, color: '#F59E0B', bgClass: 'bg-amber-50 dark:bg-amber-900/30', textClass: 'text-amber-600 dark:text-amber-400' },
    CANCELLED: { icon: 'times-circle' as const, color: '#EF4444', bgClass: 'bg-red-50 dark:bg-red-900/30', textClass: 'text-red-500' },
    COMPLETED: { icon: 'check' as const, color: '#6B7280', bgClass: 'bg-gray-100 dark:bg-gray-700', textClass: 'text-gray-500 dark:text-gray-400' },
    CHECKED_IN: { icon: 'sign-in' as const, color: '#3B82F6', bgClass: 'bg-blue-50 dark:bg-blue-900/30', textClass: 'text-blue-600 dark:text-blue-400' },
    CHECKED_OUT: { icon: 'sign-out' as const, color: '#6B7280', bgClass: 'bg-gray-100 dark:bg-gray-700', textClass: 'text-gray-500 dark:text-gray-400' },
};

export default function BookingDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        const { data, error } = await api.getBooking(id!);
        if (!error && data) setBooking(data);
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined || price === null) return '0';
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(numPrice)) return '0';
        return i18n.language === 'bn'
            ? numPrice.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)])
            : numPrice.toLocaleString('en-US');
    };

    const calculateNights = () => {
        if (!booking) return 1;
        if (booking.numberOfNights) return booking.numberOfNights;
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    if (!booking) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('common.error')}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                    {t('bookingDetail.notFound', 'Booking not found')}
                </Text>
            </View>
        );
    }

    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.COMPLETED;
    const totalPrice = booking.totalAmount ?? booking.totalPrice ?? 0;
    const roomName = booking.roomName ?? booking.roomType ?? 'Room';
    const nights = calculateNights();
    const showQR = booking.status === 'CONFIRMED' || booking.status === 'PENDING';

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('bookingDetail.title', 'Booking Details'),
                    headerStyle: { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
                    headerTintColor: isDark ? '#FFFFFF' : '#1F2937',
                }}
            />
            <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Hotel Image */}
                <Image
                    source={{ uri: booking.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                    className="w-full h-56"
                    resizeMode="cover"
                />

                <View className="p-5 -mt-6">
                    {/* Hotel Info Card */}
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg mb-4">
                        <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-1 mr-3">
                                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {booking.hotelName}
                                </Text>
                                {booking.hotelLocation && (
                                    <View className="flex-row items-center gap-1">
                                        <FontAwesome name="map-marker" size={12} color="#9CA3AF" />
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                                            {booking.hotelLocation}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View className={`flex-row items-center px-3 py-1.5 rounded-full gap-1.5 ${status.bgClass}`}>
                                <FontAwesome name={status.icon} size={12} color={status.color} />
                                <Text className={`text-xs font-semibold ${status.textClass}`}>
                                    {t(`bookings.status.${booking.status.toLowerCase()}`)}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-base text-gray-600 dark:text-gray-300 mb-2">{roomName}</Text>

                        {/* Dates */}
                        <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mt-2">
                            <View className="flex-1 items-center">
                                <Text className="text-xs text-gray-400 uppercase font-semibold mb-1">{t('bookings.checkIn')}</Text>
                                <Text className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(booking.checkIn)}</Text>
                            </View>
                            <View className="px-3 items-center">
                                <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                                    <Text className="text-xs font-bold text-primary">
                                        {i18n.language === 'bn' ? nights.toString().replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]) : nights} {nights === 1 ? t('booking.night') : t('booking.nights')}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-1 items-center">
                                <Text className="text-xs text-gray-400 uppercase font-semibold mb-1">{t('bookings.checkOut')}</Text>
                                <Text className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(booking.checkOut)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payment Info */}
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4">
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                            {t('booking.paymentMethod', 'Payment')}
                        </Text>
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-600 dark:text-gray-300">{t('bookings.totalPaid', 'Total')}</Text>
                            <Text className="text-xl font-bold text-primary">৳{formatPrice(totalPrice)}</Text>
                        </View>
                        {booking.paymentMethod && (
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-500 dark:text-gray-400 text-sm">{t('booking.paymentMethod', 'Method')}</Text>
                                <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                    {t(`booking.${booking.paymentMethod === 'PAY_AT_HOTEL' ? 'payAtHotel' : booking.paymentMethod?.toLowerCase()}`, booking.paymentMethod)}
                                </Text>
                            </View>
                        )}
                        {booking.paymentMethod === 'PAY_AT_HOTEL' && booking.bookingFee && (
                            <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-green-600 dark:text-green-400 text-sm">{t('booking.advancePaid', 'Advance Paid')}</Text>
                                    <Text className="text-green-600 dark:text-green-400 font-semibold">৳{formatPrice(booking.bookingFee)}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Guest Info */}
                    {booking.guestName && (
                        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4">
                            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                                {t('booking.guestName', 'Guest')}
                            </Text>
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center">
                                    <FontAwesome name="user" size={16} color="#6B7280" />
                                </View>
                                <View>
                                    <Text className="text-base font-medium text-gray-900 dark:text-white">{booking.guestName}</Text>
                                    {booking.guestPhone && (
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">{booking.guestPhone}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Booking ID */}
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4">
                        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            {t('booking.bookingId', 'Booking ID')}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {booking.id.slice(0, 8).toUpperCase()}
                        </Text>
                    </View>

                    {/* QR Code for Check-in */}
                    {showQR && (
                        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4 items-center">
                            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
                                {t('booking.checkInQR', 'Check-in QR Code')}
                            </Text>
                            <View className="bg-white p-4 rounded-2xl">
                                <QRCode
                                    value={booking.qrCode || JSON.stringify({ bookingId: booking.id })}
                                    size={200}
                                    backgroundColor="white"
                                    color="#1D3557"
                                />
                            </View>
                            <Text className="text-xs text-gray-400 mt-4 text-center px-4">
                                {t('booking.showQRAtHotel', 'Show this QR code at the hotel reception')}
                            </Text>
                        </View>
                    )}

                    {/* Self Check-in Button */}
                    {showQR && (
                        <TouchableOpacity
                            onPress={() => router.push('/qr-scanner')}
                            className="bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2 mb-4"
                            activeOpacity={0.8}
                        >
                            <FontAwesome name="qrcode" size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold text-base">
                                {t('qrScanner.title', 'Self Check-in/out')}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View className="h-8" />
                </View>
            </ScrollView>
        </>
    );
}
