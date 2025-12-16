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
import api, { getToken } from '@/lib/api';

// Payment method types (excluding standalone wallet - it's now a partial option)
type PaymentMethod = 'PAY_AT_HOTEL' | 'BKASH' | 'NAGAD' | 'CARD';

const PAYMENT_METHODS: { id: PaymentMethod; nameKey: string; icon: string; advancePercent: number; available: boolean }[] = [
    { id: 'PAY_AT_HOTEL', nameKey: 'payAtHotel', icon: 'building', advancePercent: 20, available: true },
    { id: 'BKASH', nameKey: 'bKash', icon: 'mobile', advancePercent: 100, available: true },
    { id: 'NAGAD', nameKey: 'nagad', icon: 'mobile', advancePercent: 100, available: false },
    { id: 'CARD', nameKey: 'card', icon: 'credit-card-alt', advancePercent: 100, available: false },
];

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

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PAY_AT_HOTEL');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loadingWallet, setLoadingWallet] = useState(true);
    const [useWalletPartial, setUseWalletPartial] = useState(false); // Use wallet for partial payment

    // First booking discount state
    const [isFirstBooking, setIsFirstBooking] = useState(false);
    const [firstBookingDiscount, setFirstBookingDiscount] = useState(0);

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

    // Fetch wallet balance and first booking eligibility
    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const { data, error } = await api.getWallet();
                if (data && !error) {
                    setWalletBalance(data.balance);
                }
            } catch (err) {
                console.log('Error fetching wallet:', err);
            } finally {
                setLoadingWallet(false);
            }
        };
        fetchWallet();
    }, []);

    // Check first booking eligibility
    useEffect(() => {
        const checkFirstBooking = async () => {
            try {
                const { data } = await api.checkFirstBookingEligibility();
                if (data?.eligible) {
                    setIsFirstBooking(true);
                }
            } catch (err) {
                console.log('Error checking first booking:', err);
            }
        };
        checkFirstBooking();
    }, []);

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

    const subtotalPrice = pricePerNight * nights;
    // Calculate first booking discount (20% with max ৳1000)
    const calculatedDiscount = isFirstBooking ? Math.min(Math.round(subtotalPrice * 0.2), 1000) : 0;
    const totalPrice = subtotalPrice - calculatedDiscount;

    const handleBooking = async () => {
        // Check if user is authenticated
        const token = await getToken();
        if (!token) {
            Alert.alert(
                t('booking.loginRequired'),
                t('booking.loginRequiredMessage'),
                [
                    {
                        text: t('booking.cancel'),
                        style: 'cancel',
                    },
                    {
                        text: t('booking.signIn'),
                        onPress: () => router.push('/auth/login'),
                    },
                ]
            );
            return;
        }

        if (!checkIn || !checkOut) {
            Alert.alert(t('common.error'), t('booking.selectDates'));
            return;
        }

        if (!hotelId) {
            Alert.alert(t('common.error'), t('booking.missingHotelInfo'));
            console.error('Missing hotelId in booking params:', params);
            return;
        }

        if (!roomId) {
            Alert.alert(t('common.error'), t('booking.missingRoomInfo'));
            return;
        }

        // Calculate wallet usage
        const walletAmountToUse = useWalletPartial ? Math.min(walletBalance, totalPrice) : 0;
        const remainingAmount = totalPrice - walletAmountToUse;

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
            paymentMethod: walletAmountToUse >= totalPrice ? 'WALLET' : paymentMethod,
            // Split payment fields
            useWalletBalance: useWalletPartial && walletAmountToUse > 0,
            walletAmount: walletAmountToUse,
        };

        console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));

        try {
            const { data, error } = await api.createBooking(bookingData);

            if (error) {
                Alert.alert(t('common.error'), error);
            } else if (data?.requiresPayment && data?.advanceAmount) {
                // Wallet doesn't cover 20% advance - redirect to payment screen
                router.replace({
                    pathname: '/advance-payment',
                    params: {
                        bookingId: data.bookingId,
                        amount: String(data.advanceAmount),
                        hotelName: hotelName,
                    },
                });
            } else {
                // Booking confirmed (wallet covered the advance or full payment)
                Alert.alert(
                    t('booking.confirmed'),
                    t('booking.confirmedMessage', { hotel: hotelName }),
                    [
                        {
                            text: t('booking.viewBookings'),
                            onPress: () => router.replace('/(tabs)/bookings'),
                        },
                    ]
                );
            }
        } catch (err) {
            Alert.alert(t('common.error'), t('booking.somethingWentWrong'));
        } finally {
            setBooking(false);
        }
    };

    if (!roomId) {
        return (
            <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-gray-900">
                <FontAwesome name="exclamation-circle" size={50} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                    {t('hotel.roomNotFound')}
                </Text>
                <TouchableOpacity
                    className="mt-4 bg-primary px-6 py-3 rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold">{t('hotel.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: t('booking.confirmBooking'),
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
                                    {t('booking.upToGuests', { count: maxGuests })}
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
                                        {t('booking.selectCheckInDate')}
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
                                        {t('booking.selectCheckOutDate')}
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
                            {i18n.language === 'bn' ? nights.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]) : nights} {nights !== 1 ? t('booking.nights') : t('booking.night')}
                        </Text>
                    </View>
                </View>

                {/* Guests Section */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        👥 {t('booking.guests', 'Number of Guests')}
                    </Text>

                    <View className="flex-row items-center justify-between">
                        <Text className="text-gray-700 dark:text-gray-300">{t('booking.guestsLabel')}</Text>
                        <View className="flex-row items-center gap-4">
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                                onPress={() => setGuests(Math.max(1, guests - 1))}
                            >
                                <FontAwesome name="minus" size={14} color="#6B7280" />
                            </TouchableOpacity>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white w-8 text-center">
                                {i18n.language === 'bn' ? guests.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]) : guests}
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
                        placeholder={t('booking.specialRequestsPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Use Wallet Balance Section */}
                {walletBalance > 0 && (
                    <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2">
                                    <FontAwesome name="credit-card" size={18} color="#E63946" />
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        {t('booking.useWalletBalance', 'Use Wallet Balance')}
                                    </Text>
                                </View>
                                <Text className="text-sm text-gray-500 mt-1">
                                    {t('booking.walletAvailable', 'Available')}: {t('common.currency')}{formatPrice(walletBalance)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                className={`w-14 h-8 rounded-full p-1 ${useWalletPartial ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                onPress={() => setUseWalletPartial(!useWalletPartial)}
                                activeOpacity={0.8}
                            >
                                <View
                                    className={`w-6 h-6 rounded-full bg-white shadow ${useWalletPartial ? 'ml-6' : 'ml-0'}`}
                                />
                            </TouchableOpacity>
                        </View>

                        {useWalletPartial && (
                            <View className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-green-700 dark:text-green-400 font-medium">
                                        {t('booking.walletDeduction', 'Wallet Deduction')}
                                    </Text>
                                    <Text className="text-green-700 dark:text-green-400 font-bold">
                                        -{t('common.currency')}{formatPrice(Math.min(walletBalance, totalPrice))}
                                    </Text>
                                </View>
                                {walletBalance < totalPrice && (
                                    <Text className="text-xs text-green-600 dark:text-green-500 mt-1">
                                        {t('booking.remainingToPay', 'Remaining to pay')}: {t('common.currency')}{formatPrice(totalPrice - walletBalance)}
                                    </Text>
                                )}
                                {walletBalance >= totalPrice && (
                                    <Text className="text-xs text-green-600 dark:text-green-500 mt-1">
                                        ✓ {t('booking.fullyCoveredByWallet', 'Fully covered by wallet!')}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Payment Method Selection - Only show if there's remaining amount */}
                {(!useWalletPartial || walletBalance < totalPrice) && (
                    <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            💳 {useWalletPartial ? t('booking.payRemaining', 'Pay Remaining Amount') : t('booking.paymentMethod', 'Payment Method')}
                        </Text>

                        <View className="gap-3">
                            {PAYMENT_METHODS.map((method) => {
                                const isSelected = paymentMethod === method.id;
                                const isDisabled = !method.available;

                                return (
                                    <TouchableOpacity
                                        key={method.id}
                                        className={`p-4 rounded-xl border-2 ${isSelected
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-gray-700'
                                            } ${isDisabled ? 'opacity-50' : ''}`}
                                        onPress={() => !isDisabled && setPaymentMethod(method.id)}
                                        disabled={isDisabled}
                                        activeOpacity={0.7}
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                <FontAwesome
                                                    name={method.icon as any}
                                                    size={18}
                                                    color={isSelected ? '#fff' : '#6B7280'}
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-2">
                                                    <Text className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {t(`booking.${method.nameKey}`, method.nameKey)}
                                                    </Text>
                                                    {!method.available && (
                                                        <View className="px-2 py-0.5 rounded-full bg-gray-100">
                                                            <Text className="text-xs text-gray-500">
                                                                {t('common.comingSoon', 'Coming Soon')}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text className="text-xs text-gray-500 mt-0.5">
                                                    {method.id === 'PAY_AT_HOTEL'
                                                        ? t('booking.advanceRequired', '20% advance required')
                                                        : t('booking.fullPayment', 'Full payment required')
                                                    }
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <FontAwesome name="check-circle" size={22} color="#E63946" />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Price Breakdown */}
                <View className="bg-white dark:bg-gray-800 p-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        💰 {t('booking.priceBreakdown', 'Price Breakdown')}
                    </Text>

                    <View className="gap-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600 dark:text-gray-400">
                                {t('common.currency')}{formatPrice(pricePerNight)} × {i18n.language === 'bn' ? nights.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]) : nights} {nights !== 1 ? t('booking.nights') : t('booking.night')}
                            </Text>
                            <Text className="text-gray-900 dark:text-white font-medium">
                                {t('common.currency')}{formatPrice(subtotalPrice)}
                            </Text>
                        </View>

                        {/* First Booking Discount */}
                        {isFirstBooking && calculatedDiscount > 0 && (
                            <View className="flex-row justify-between bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl -mx-1">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-lg">🎉</Text>
                                    <Text className="text-yellow-700 dark:text-yellow-400 font-semibold">
                                        {i18n.language === 'bn' ? 'প্রথম বুকিং ছাড় (২০%)' : 'First Booking Discount (20%)'}
                                    </Text>
                                </View>
                                <Text className="text-yellow-700 dark:text-yellow-400 font-bold">
                                    -{t('common.currency')}{formatPrice(calculatedDiscount)}
                                </Text>
                            </View>
                        )}

                        {/* Wallet deduction */}
                        {useWalletPartial && walletBalance > 0 && (
                            <View className="flex-row justify-between">
                                <Text className="text-green-600 dark:text-green-400">
                                    {t('booking.walletDeduction', 'Wallet Deduction')}
                                </Text>
                                <Text className="text-green-600 dark:text-green-400 font-medium">
                                    -{t('common.currency')}{formatPrice(Math.min(walletBalance, totalPrice))}
                                </Text>
                            </View>
                        )}

                        <View className="border-t border-gray-200 dark:border-gray-700 pt-3 flex-row justify-between">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {useWalletPartial ? t('booking.remainingTotal', 'Remaining Total') : t('booking.total')}
                            </Text>
                            <Text className="text-xl font-bold text-primary">
                                {t('common.currency')}{formatPrice(useWalletPartial ? Math.max(0, totalPrice - walletBalance) : totalPrice)}
                            </Text>
                        </View>

                        {/* Show advance amount for Pay at Hotel - only if wallet doesn't cover 20% */}
                        {paymentMethod === 'PAY_AT_HOTEL' && (() => {
                            const requiredAdvance = Math.round(totalPrice * 0.2);
                            const walletCoversAdvance = useWalletPartial && walletBalance >= requiredAdvance;
                            const remainingAdvance = useWalletPartial
                                ? Math.max(0, requiredAdvance - walletBalance)
                                : requiredAdvance;
                            const payAtHotelAmount = totalPrice - (useWalletPartial ? Math.min(walletBalance, totalPrice) : 0) - remainingAdvance;

                            if (walletCoversAdvance) {
                                // Wallet covers 20% advance - no additional payment needed
                                return (
                                    <View className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mt-2">
                                        <Text className="text-green-700 dark:text-green-400 font-semibold text-center">
                                            ✓ {t('booking.advanceCoveredByWallet', 'Advance covered by wallet!')}
                                        </Text>
                                        <Text className="text-xs text-green-600 dark:text-green-500 mt-1 text-center">
                                            {t('booking.payAtHotelRemaining', { amount: `${t('common.currency')}${formatPrice(Math.max(0, totalPrice - walletBalance))}` })}
                                        </Text>
                                    </View>
                                );
                            } else if (remainingAdvance > 0) {
                                // Need to pay remaining advance
                                return (
                                    <View className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mt-2">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-green-700 dark:text-green-400 font-semibold">
                                                {t('booking.payNow', 'Pay Now (20%)')}
                                            </Text>
                                            <Text className="text-green-700 dark:text-green-400 font-bold">
                                                {t('common.currency')}{formatPrice(remainingAdvance)}
                                            </Text>
                                        </View>
                                        <Text className="text-xs text-green-600 dark:text-green-500 mt-1">
                                            {t('booking.payRemainingAtHotel', { amount: `${t('common.currency')}${formatPrice(payAtHotelAmount)}` })}
                                        </Text>
                                    </View>
                                );
                            }
                            return null;
                        })()}

                        {/* Show fully covered message - for non Pay at Hotel methods */}
                        {paymentMethod !== 'PAY_AT_HOTEL' && useWalletPartial && walletBalance >= totalPrice && (
                            <View className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mt-2">
                                <Text className="text-green-700 dark:text-green-400 font-semibold text-center">
                                    ✓ {t('booking.fullyCoveredByWallet', 'Fully covered by wallet!')}
                                </Text>
                            </View>
                        )}
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
                                {t('booking.confirmBooking')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
