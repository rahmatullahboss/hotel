import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import BookingCard from '@/components/BookingCard';

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

const STATUS_COLORS = {
    CONFIRMED: { bg: 'bg-teal-500', text: 'text-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-900/30' },
    PENDING: { bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-900/30' },
    CANCELLED: { bg: 'bg-red-500', text: 'text-red-500', bgLight: 'bg-red-50 dark:bg-red-900/30' },
    COMPLETED: { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', bgLight: 'bg-gray-100 dark:bg-gray-700' },
    CHECKED_IN: { bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-900/30' },
    CHECKED_OUT: { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', bgLight: 'bg-gray-100 dark:bg-gray-700' },
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
        CHECKED_IN: { icon: 'sign-in' as const, label: t('bookings.status.checkedIn', 'Checked In') },
        CHECKED_OUT: { icon: 'sign-out' as const, label: t('bookings.status.checkedOut', 'Checked Out') },
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
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-white tracking-tight">
                            {t('bookings.title')}
                        </Text>
                        <Text className="text-sm text-white/85 mt-1.5">
                            {bookings.length} {bookings.length !== 1 ? t('bookings.bookings') : t('bookings.booking')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/qr-scanner')}
                        className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <FontAwesome name="qrcode" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
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
                        <FlatList
                            data={bookings}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <BookingCard booking={item} index={index} />
                            )}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
