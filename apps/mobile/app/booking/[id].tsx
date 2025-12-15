import { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

export default function BookingScreen() {
    const params = useLocalSearchParams<{
        id: string;
        roomName?: string;
        roomType?: string;
        price?: string;
        maxGuests?: string;
        hotelName?: string;
        hotelCity?: string;
        roomImage?: string;
        hotelId?: string;
    }>();

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    // Room data from params
    const roomId = params.id;
    const roomName = params.roomName || 'Room';
    const roomType = params.roomType || 'DOUBLE';
    const pricePerNight = Number(params.price) || 0;
    const maxGuests = Number(params.maxGuests) || 2;
    const hotelName = params.hotelName || 'Hotel';
    const hotelCity = params.hotelCity || '';
    const roomImage = params.roomImage || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300';
    const hotelId = params.hotelId || '';

    // Booking form state
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [checkInDate, setCheckInDate] = useState(new Date());
    const [checkOutDate, setCheckOutDate] = useState(new Date());
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [guests, setGuests] = useState(1);
    const [nights, setNights] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');

    // Set default dates
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        setCheckInDate(tomorrow);
        setCheckOutDate(dayAfter);
        setCheckIn(formatDate(tomorrow));
        setCheckOut(formatDate(dayAfter));
    }, []);

    // Calculate nights when dates change
    useEffect(() => {
        if (checkIn && checkOut) {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            setNights(Math.max(1, diff));
        }
    }, [checkIn, checkOut]);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const handleCheckInChange = (selectedDate: Date) => {
        setCheckInDate(selectedDate);
        setCheckIn(formatDate(selectedDate));
        // Auto-adjust checkout if it's before or same as checkin
        if (selectedDate >= checkOutDate) {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setCheckOutDate(nextDay);
            setCheckOut(formatDate(nextDay));
        }
        setShowCheckInPicker(false);
    };

    const handleCheckOutChange = (selectedDate: Date) => {
        setCheckOutDate(selectedDate);
        setCheckOut(formatDate(selectedDate));
        setShowCheckOutPicker(false);
    };

    // Generate next 60 days for date picker
    const dateOptions = useMemo(() => {
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    const checkOutDateOptions = useMemo(() => {
        const dates: Date[] = [];
        const minDate = new Date(checkInDate);
        minDate.setDate(minDate.getDate() + 1);
        for (let i = 0; i < 60; i++) {
            const date = new Date(minDate);
            date.setDate(minDate.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [checkInDate]);

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    const totalPrice = pricePerNight * nights;

    const handleBooking = async () => {
        if (!checkIn || !checkOut) {
            Alert.alert('Error', 'Please select check-in and check-out dates');
            return;
        }

        if (!hotelId) {
            Alert.alert('Error', 'Hotel information is missing. Please go back and try again.');
            console.error('Missing hotelId in booking params:', params);
            return;
        }

        if (!roomId) {
            Alert.alert('Error', 'Room information is missing.');
            return;
        }

        setBooking(true);

        const bookingData = {
            hotelId,
            roomId,
            checkIn,
            checkOut,
            guests,
            totalAmount: totalPrice,
            guestName: '',
            guestEmail: '',
            guestPhone: '',
            paymentMethod: 'PAY_AT_HOTEL',
        };

        console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));

        try {
            const { data, error } = await api.createBooking(bookingData);

            if (error) {
                Alert.alert('Booking Failed', error);
            } else {
                Alert.alert(
                    'Booking Confirmed! 🎉',
                    `Your booking at ${hotelName} has been confirmed.`,
                    [
                        {
                            text: 'View My Bookings',
                            onPress: () => router.replace('/(tabs)/bookings'),
                        },
                    ]
                );
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    if (!roomId) {
        return (
            <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-gray-900">
                <FontAwesome name="exclamation-circle" size={50} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                    Room not found
                </Text>
                <TouchableOpacity
                    className="mt-4 bg-primary px-6 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Confirm Booking',
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Room Summary */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <View className="flex-row gap-4">
                        <Image
                            source={{ uri: roomImage }}
                            className="w-24 h-24 rounded-xl"
                            resizeMode="cover"
                        />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {roomName}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {hotelName}
                            </Text>
                            {hotelCity && (
                                <View className="flex-row items-center mt-1 gap-1">
                                    <FontAwesome name="map-marker" size={12} color="#9CA3AF" />
                                    <Text className="text-xs text-gray-400">{hotelCity}</Text>
                                </View>
                            )}
                            <View className="flex-row items-center mt-2 gap-2">
                                <FontAwesome name="users" size={12} color="#E63946" />
                                <Text className="text-sm text-gray-600 dark:text-gray-300">
                                    Up to {maxGuests} guests
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Dates Section */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        📅 {t('booking.dates', 'Select Dates')}
                    </Text>

                    <View className="flex-row gap-4">
                        {/* Check-in Date Picker */}
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {t('bookings.checkIn', 'Check-in')}
                            </Text>
                            <TouchableOpacity
                                className="bg-gray-100 dark:bg-gray-700 px-4 py-3.5 rounded-xl flex-row items-center justify-between"
                                onPress={() => setShowCheckInPicker(true)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center gap-2">
                                    <FontAwesome name="calendar" size={16} color="#E63946" />
                                    <Text className="text-gray-900 dark:text-white font-medium">
                                        {formatDisplayDate(checkInDate)}
                                    </Text>
                                </View>
                                <FontAwesome name="chevron-down" size={12} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Check-out Date Picker */}
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {t('bookings.checkOut', 'Check-out')}
                            </Text>
                            <TouchableOpacity
                                className="bg-gray-100 dark:bg-gray-700 px-4 py-3.5 rounded-xl flex-row items-center justify-between"
                                onPress={() => setShowCheckOutPicker(true)}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center gap-2">
                                    <FontAwesome name="calendar" size={16} color="#E63946" />
                                    <Text className="text-gray-900 dark:text-white font-medium">
                                        {formatDisplayDate(checkOutDate)}
                                    </Text>
                                </View>
                                <FontAwesome name="chevron-down" size={12} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Date Picker Modal for Check-in */}
                    <Modal
                        visible={showCheckInPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCheckInPicker(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-96">
                                <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('bookings.checkIn', 'Select Check-in Date')}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowCheckInPicker(false)}>
                                        <FontAwesome name="times" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={dateOptions}
                                    keyExtractor={(item) => item.toISOString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 border-b border-gray-100 dark:border-gray-700 ${formatDate(item) === checkIn ? 'bg-primary/10' : ''}`}
                                            onPress={() => handleCheckInChange(item)}
                                        >
                                            <Text className={`text-base ${formatDate(item) === checkIn ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                                                {formatDisplayDate(item)}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Date Picker Modal for Check-out */}
                    <Modal
                        visible={showCheckOutPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCheckOutPicker(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-96">
                                <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('bookings.checkOut', 'Select Check-out Date')}
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}>
                                        <FontAwesome name="times" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={checkOutDateOptions}
                                    keyExtractor={(item) => item.toISOString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 border-b border-gray-100 dark:border-gray-700 ${formatDate(item) === checkOut ? 'bg-primary/10' : ''}`}
                                            onPress={() => handleCheckOutChange(item)}
                                        >
                                            <Text className={`text-base ${formatDate(item) === checkOut ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                                                {formatDisplayDate(item)}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </View>
                    </Modal>

                    <View className="mt-3 bg-primary/10 p-3 rounded-xl">
                        <Text className="text-center text-primary font-semibold">
                            {nights} night{nights !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                {/* Guests Section */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        👥 {t('booking.guests', 'Number of Guests')}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-700 dark:text-gray-300">Guests</Text>
                        <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                                onPress={() => setGuests(Math.max(1, guests - 1))}
                            >
                                <FontAwesome name="minus" size={14} color="#6B7280" />
                            </TouchableOpacity>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">
                                {guests}
                            </Text>
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                                onPress={() => setGuests(Math.min(maxGuests, guests + 1))}
                            >
                                <FontAwesome name="plus" size={14} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Special Requests */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        ✍️ {t('booking.specialRequests', 'Special Requests')}
                    </Text>
                    <TextInput
                        className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl text-gray-900 dark:text-white h-24"
                        value={specialRequests}
                        onChangeText={setSpecialRequests}
                        placeholder="Any special requests? (Optional)"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Price Breakdown */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        💰 {t('booking.priceBreakdown', 'Price Breakdown')}
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('common.currency')}{formatPrice(pricePerNight)} × {nights} night{nights !== 1 ? 's' : ''}
                            </Text>
                            <Text className="text-gray-900 dark:text-white font-medium">
                                {t('common.currency')}{formatPrice(totalPrice)}
                            </Text>
                        </View>
                        <View className="border-t border-gray-200 dark:border-gray-700 pt-3 flex-row justify-between">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                Total
                            </Text>
                            <Text className="text-xl font-bold text-primary">
                                {t('common.currency')}{formatPrice(totalPrice)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom CTA */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-5 pt-4"
                style={{ paddingBottom: insets.bottom + 16 }}
            >
                <TouchableOpacity
                    className="bg-primary py-4 rounded-2xl items-center flex-row justify-center gap-2"
                    onPress={handleBooking}
                    disabled={booking}
                    activeOpacity={0.9}
                >
                    {booking ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesome name="check-circle" size={18} color="#fff" />
                            <Text className="text-white text-lg font-bold">
                                Confirm Booking
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
