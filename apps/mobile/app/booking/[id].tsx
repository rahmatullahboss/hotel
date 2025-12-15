import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface Room {
    id: string;
    name: string;
    type: string;
    basePrice: string;
    dynamicPrice?: number;
    maxGuests: number;
    photos?: string[];
    hotel?: {
        id: string;
        name: string;
        city: string;
    };
}

export default function BookingScreen() {
    const { id: roomId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    // Booking form state
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
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

        setCheckIn(formatDate(tomorrow));
        setCheckOut(formatDate(dayAfter));
    }, []);

    // Fetch room details
    useEffect(() => {
        const fetchRoom = async () => {
            const { data, error } = await api.getRoomDetails(roomId);
            if (!error && data) {
                setRoom(data);
            }
            setLoading(false);
        };
        if (roomId) {
            fetchRoom();
        }
    }, [roomId]);

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

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    const pricePerNight = room?.dynamicPrice || Number(room?.basePrice || 0);
    const totalPrice = pricePerNight * nights;
    const serviceFee = Math.round(totalPrice * 0.05);
    const grandTotal = totalPrice + serviceFee;

    const handleBooking = async () => {
        if (!room) return;

        if (!checkIn || !checkOut) {
            Alert.alert('Error', 'Please select check-in and check-out dates');
            return;
        }

        setBooking(true);

        try {
            const { data, error } = await api.createBooking({
                roomId: room.id,
                checkIn,
                checkOut,
                guests,
                specialRequests,
            });

            if (error) {
                Alert.alert('Booking Failed', error);
            } else {
                Alert.alert(
                    'Booking Confirmed! 🎉',
                    `Your booking at ${room.hotel?.name || 'the hotel'} has been confirmed.`,
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

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    if (!room) {
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
                            source={{
                                uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300',
                            }}
                            className="w-24 h-24 rounded-xl"
                            resizeMode="cover"
                        />
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {room.name || room.type}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {room.hotel?.name}
                            </Text>
                            <View className="flex-row items-center mt-2 gap-2">
                                <FontAwesome name="users" size={12} color="#E63946" />
                                <Text className="text-sm text-gray-600 dark:text-gray-300">
                                    Up to {room.maxGuests} guests
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
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 mb-2">Check-in</Text>
                            <TextInput
                                className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl text-gray-900 dark:text-white"
                                value={checkIn}
                                onChangeText={setCheckIn}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm text-gray-500 mb-2">Check-out</Text>
                            <TextInput
                                className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl text-gray-900 dark:text-white"
                                value={checkOut}
                                onChangeText={setCheckOut}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

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
                                onPress={() => setGuests(Math.min(room.maxGuests, guests + 1))}
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
                        className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-xl text-gray-900 dark:text-white"
                        value={specialRequests}
                        onChangeText={setSpecialRequests}
                        placeholder="Any special requests? (Optional)"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={3}
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
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600 dark:text-gray-400">
                                Service fee (5%)
                            </Text>
                            <Text className="text-gray-900 dark:text-white font-medium">
                                {t('common.currency')}{formatPrice(serviceFee)}
                            </Text>
                        </View>
                        <View className="border-t border-gray-200 dark:border-gray-700 pt-3 flex-row justify-between">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                Total
                            </Text>
                            <Text className="text-xl font-bold text-primary">
                                {t('common.currency')}{formatPrice(grandTotal)}
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
