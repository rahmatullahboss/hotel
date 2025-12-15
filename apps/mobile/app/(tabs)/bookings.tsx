import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface Booking {
    id: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
}

const STATUS_COLORS = {
    CONFIRMED: { bg: 'bg-teal-500', text: 'text-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-900/30' },
    PENDING: { bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-900/30' },
    CANCELLED: { bg: 'bg-red-500', text: 'text-red-500', bgLight: 'bg-red-50 dark:bg-red-900/30' },
    COMPLETED: { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', bgLight: 'bg-gray-100 dark:bg-gray-700' },
};

export default function BookingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const STATUS_CONFIG = {
        CONFIRMED: { icon: 'check-circle' as const, label: t('bookings.status.confirmed') },
        PENDING: { icon: 'clock-o' as const, label: t('bookings.status.pending') },
        CANCELLED: { icon: 'times-circle' as const, label: t('bookings.status.cancelled') },
        COMPLETED: { icon: 'check' as const, label: t('bookings.status.completed') },
    };

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        const { data, error } = await api.getMyBookings();
        if (!error && data) {
            setBookings(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const getStatusColor = (status: Booking['status']) => {
        return STATUS_COLORS[status] || STATUS_COLORS.COMPLETED;
    };

    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center bg-white dark:bg-gray-900"
                style={{ paddingTop: insets.top }}
            >
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View
                className="px-5 pb-6 bg-primary rounded-b-3xl shadow-lg"
                style={{ paddingTop: insets.top + 16 }}
            >
                <Text className="text-2xl font-bold text-white tracking-tight">
                    {t('bookings.title')}
                </Text>
                <Text className="text-sm text-white/85 mt-1.5">
                    {bookings.length} {bookings.length !== 1 ? t('bookings.bookings') : t('bookings.booking')}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
                }
            >
                {bookings.length === 0 ? (
                    <View className="m-5 p-10 rounded-2xl bg-white dark:bg-gray-800 items-center">
                        <View className="w-20 h-20 rounded-full bg-primary/15 items-center justify-center mb-4">
                            <FontAwesome name="suitcase" size={40} color="#E63946" />
                        </View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t('bookings.noTrips')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t('bookings.exploreText')}
                        </Text>
                        <TouchableOpacity
                            className="bg-primary px-7 py-3.5 rounded-full"
                            onPress={() => router.push('/(tabs)/search')}
                        >
                            <Text className="text-white font-semibold text-base">
                                {t('bookings.findHotels')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="p-5">
                        {bookings.map((booking) => {
                            const status = STATUS_CONFIG[booking.status] || { icon: 'question-circle' as const, label: booking.status || 'Unknown' };
                            const colors = getStatusColor(booking.status);
                            return (
                                <TouchableOpacity
                                    key={booking.id}
                                    className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
                                    onPress={() => router.push(`/booking/${booking.id}` as any)}
                                    activeOpacity={0.95}
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
                                                <FontAwesome name={status.icon} size={12} color={booking.status === 'CONFIRMED' ? '#0D9488' : booking.status === 'PENDING' ? '#D97706' : booking.status === 'CANCELLED' ? '#EF4444' : '#6B7280'} />
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
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
