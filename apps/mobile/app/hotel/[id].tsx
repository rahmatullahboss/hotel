import { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBooking } from '@/hooks/useBooking';
import { shareHotel } from '@/lib/share';
import { openNavigation } from '@/lib/navigation';
import { useBookingDates } from '@/contexts/BookingDatesContext';
import DateSelectionBar from '@/components/DateSelectionBar';
import NearbyAttractions from '@/components/NearbyAttractions';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 320;

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const { checkIn, checkOut, setDates, formatCheckIn, formatCheckOut } = useBookingDates();

    const {
        hotel,
        rooms,
        loading,
        roomsLoading,
        error,
        isSaved,
        savingState,
        handleToggleSave,
    } = useBooking(id, { checkIn: formatCheckIn(), checkOut: formatCheckOut() });

    // Parallax effect
    const headerTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT / 2],
        extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.5, 1],
        extrapolate: 'clamp',
    });

    const formatPrice = (price: number | undefined | null) => {
        const numPrice = Number(price || 0);
        if (i18n.language === 'bn') {
            return numPrice.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return numPrice.toLocaleString('en-US');
    };

    // Branding helper
    const getCategoryInfo = (data: typeof hotel) => {
        if (!data) return { label: 'Zinu Classic', color: '#10B981', textColor: '#FFFFFF' };

        // Cast to any to avoid TS error if price is missing in type definition
        const price = Number((data as any).price || data.rooms?.[0]?.basePrice || 0);
        // CRITICAL UPDATE: Premium is ONLY based on price >= 8000, NOT rating
        const isPremium = price >= 8000;

        if (isPremium) {
            return {
                label: 'Zinu Premium',
                color: '#F59E0B', // Amber-500
                textColor: '#FFFFFF'
            };
        }
        return {
            label: 'Zinu Classic',
            color: '#10B981', // Emerald-500
            textColor: '#FFFFFF'
        };
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    if (error || !hotel) {
        return (
            <View className="flex-1 items-center justify-center p-5 bg-white dark:bg-gray-900">
                <Text className="text-base mb-4 text-gray-900 dark:text-white">
                    {error || t('hotel.notFound')}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-primary">{t('hotel.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const brandInfo = getCategoryInfo(hotel);
    const displayName = hotel.name.startsWith('Zinu') ? hotel.name : `Zinu ${hotel.name.replace(/^Vibe\s+/i, '')}`;

    // Get Zinu ID from params (passed from HotelCard) or fallback to vibeCode/serialNumber
    // We try to use the param first for consistency
    const params = useLocalSearchParams();
    const passedZinuId = params.zinuId as string;

    // Fallback generation matching HotelCard logic
    // If we have backend serialNumber, use it. Otherwise fallback to hash.
    const backendCodes = (hotel as any).vibeCode || ((hotel as any).serialNumber ? `ZN${(hotel as any).serialNumber.toString().padStart(4, '0')}` : null);
    const fallbackId = `ZN${hotel.id.slice(0, 4).toUpperCase()}`;
    const zinuId = passedZinuId || backendCodes || fallbackId;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['bottom']}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Parallax Header Image */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_HEIGHT,
                    transform: [{ translateY: headerTranslate }, { scale: headerScale }],
                    zIndex: 0,
                }}
                pointerEvents="none"
            >
                <Image
                    source={{
                        uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                    }}
                    style={{ width, height: HEADER_HEIGHT }}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Header Buttons - Separate layer for proper touch handling */}
            <View
                style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, zIndex: 100 }}
                className="flex-row justify-between"
                pointerEvents="box-none"
            >
                {/* Back Button */}
                <TouchableOpacity
                    className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="arrow-left" size={18} color="#fff" />
                </TouchableOpacity>

                {/* Save & Share Buttons */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
                        onPress={async () => {
                            try {
                                await shareHotel({
                                    hotelId: hotel.id,
                                    hotelName: displayName,
                                    city: hotel.city,
                                    rating: Number(hotel.rating),
                                });
                            } catch (error) {
                                console.error('Share error:', error);
                                Alert.alert(
                                    t('common.error', 'Error'),
                                    t('common.shareFailed', 'Failed to share. Please try again.')
                                );
                            }
                        }}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="share" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
                        onPress={handleToggleSave}
                        disabled={savingState}
                        activeOpacity={0.8}
                    >
                        <FontAwesome
                            name={isSaved ? 'heart' : 'heart-o'}
                            size={22}
                            color={isSaved ? '#E63946' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Content Card */}
                <View className="bg-white dark:bg-gray-900 -mt-6 rounded-t-3xl min-h-screen">
                    {/* Hotel Info Section */}
                    <View className="p-5">
                        {/* Badges Row */}
                        <View className="flex-row items-center gap-2 mb-3 flex-wrap">
                            {/* Category Badge */}
                            <View
                                className="px-3 py-1.5 rounded-lg"
                                style={{ backgroundColor: brandInfo.color }}
                            >
                                <Text className="text-white text-sm font-bold">
                                    {brandInfo.label}
                                </Text>
                            </View>

                            {/* Zinu ID Badge */}
                            <View className="bg-red-600 px-3 py-1.5 rounded-lg">
                                <Text className="text-white text-sm font-bold">
                                    {zinuId}
                                </Text>
                            </View>

                            {/* Rating Badge */}
                            <View className="flex-row items-center bg-black/80 px-3 py-1.5 rounded-lg gap-1.5">
                                <FontAwesome name="star" size={14} color="#FFD700" />
                                <Text className="text-white text-sm font-bold">
                                    {Number(hotel.rating || 0).toFixed(1)}
                                </Text>
                            </View>
                        </View>

                        {/* Hotel Name with Zinu brand prefix */}
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {displayName}
                        </Text>

                        {/* Location with Navigate Button */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2 flex-1">
                                <FontAwesome name="map-marker" size={16} color="#E63946" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                                    {hotel.address}, {hotel.city}
                                </Text>
                            </View>
                            {hotel.latitude && hotel.longitude && (
                                <TouchableOpacity
                                    onPress={() => openNavigation({
                                        latitude: parseFloat(hotel.latitude!),
                                        longitude: parseFloat(hotel.longitude!),
                                        name: displayName,
                                        address: hotel.address,
                                    })}
                                    className="flex-row items-center gap-2 bg-blue-500 px-3 py-2 rounded-full ml-2"
                                    activeOpacity={0.8}
                                >
                                    <FontAwesome name="location-arrow" size={12} color="#fff" />
                                    <Text className="text-white text-xs font-semibold">
                                        {t('hotel.navigate', 'Navigate')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Description */}
                        <Text className="text-base text-gray-700 dark:text-gray-300 leading-6 mb-5" numberOfLines={5}>
                            {hotel.description}
                        </Text>

                        {/* Amenities */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                            <>
                                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {t('hotel.amenities')}
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 8, paddingRight: 20 }}
                                    className="mb-4"
                                >
                                    {hotel.amenities.map((amenity, index) => (
                                        <View
                                            key={index}
                                            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                                        >
                                            <Text className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {amenity}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* Nearby Places */}
                        <NearbyAttractions
                            hotelLat={hotel.latitude ? parseFloat(hotel.latitude) : undefined}
                            hotelLng={hotel.longitude ? parseFloat(hotel.longitude) : undefined}
                            city={hotel.city}
                        />

                        {/* Date Selection - Sticky */}
                        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
                            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                {t('booking.dates', 'Select your dates')}
                            </Text>
                            <DateSelectionBar
                                checkIn={checkIn}
                                checkOut={checkOut}
                                onDatesChange={setDates}
                                variant="light"
                            />
                        </View>
                    </View>

                    {/* Rooms Section */}
                    <View className="px-5 pb-5">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('hotel.availableRooms')}
                            </Text>
                            {roomsLoading && (
                                <View className="flex-row items-center gap-2">
                                    <ActivityIndicator size="small" color="#E63946" />
                                    <Text className="text-xs text-gray-500">
                                        {t('common.loading', 'Loading...')}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {rooms.length === 0 ? (
                            <View className="p-6 rounded-xl bg-gray-100 dark:bg-gray-800 items-center">
                                <FontAwesome name="bed" size={32} color="#9CA3AF" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {t('hotel.noRooms')}
                                </Text>
                            </View>
                        ) : (
                            rooms.map((room) => (
                                <View
                                    key={room.id}
                                    className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800"
                                    style={{
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.08,
                                        shadowRadius: 12,
                                        elevation: 4,
                                    }}
                                >
                                    {/* Image with badges */}
                                    <View className="relative">
                                        <Image
                                            source={{
                                                uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
                                            }}
                                            className="w-full h-48"
                                            resizeMode="cover"
                                        />
                                        {/* Room Type Badge */}
                                        <View className="absolute top-3 left-3 bg-primary px-3 py-1.5 rounded-lg max-w-[60%]">
                                            <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                                {room.type}
                                            </Text>
                                        </View>
                                        {/* Available Count Badge */}
                                        {room.availableCount !== undefined && room.availableCount > 0 && (
                                            <View className="absolute top-3 right-3 bg-orange-500 px-2.5 py-1.5 rounded-lg">
                                                <Text className="text-white text-xs font-bold">
                                                    {room.availableCount} left
                                                </Text>
                                            </View>
                                        )}
                                        {/* Guest Badge */}
                                        {(room.availableCount === undefined || room.availableCount === 0) && (
                                            <View className="absolute top-3 right-3 flex-row items-center bg-white/95 px-2.5 py-1.5 rounded-lg gap-1.5">
                                                <Text className="text-sm">👥</Text>
                                                <Text className="text-gray-900 text-sm font-bold">
                                                    {room.maxGuests}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Content */}
                                    <View className="p-5">
                                        {/* Room Name & Guest Count */}
                                        <View className="flex-row items-center justify-between mb-4">
                                            <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
                                                {room.name || room.type}
                                            </Text>
                                            {room.availableCount !== undefined && room.availableCount > 0 && (
                                                <View className="flex-row items-center gap-1.5">
                                                    <Text className="text-sm">👥</Text>
                                                    <Text className="text-gray-500 text-sm font-medium">
                                                        {t('hotel.upToGuests', { count: room.maxGuests })}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Price and Book Section */}
                                        <View className="flex-row items-end justify-between">
                                            <View>
                                                {room.dynamicPrice && room.dynamicPrice < Number(room.basePrice) && (
                                                    <Text className="text-xs line-through text-gray-400 mb-0.5">
                                                        {t('common.currency')}{formatPrice(Number(room.basePrice))}
                                                    </Text>
                                                )}
                                                <View className="flex-row items-baseline">
                                                    <Text className="text-2xl font-bold text-primary">
                                                        {t('common.currency')}{formatPrice(Number(room.dynamicPrice || room.basePrice || 0))}
                                                    </Text>
                                                    <Text className="text-sm text-gray-400 dark:text-gray-500 ml-1">
                                                        {t('common.perNight')}
                                                    </Text>
                                                </View>
                                                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {t('common.taxAndFees', { amount: `৳${formatPrice(Math.round(Number(room.dynamicPrice || room.basePrice || 0) * 0.15))}` })}
                                                </Text>
                                            </View>

                                            {/* Book Button */}
                                            <TouchableOpacity
                                                className={`px-6 py-3 rounded-xl ${room.isAvailable !== false ? 'bg-primary' : 'bg-gray-400'}`}
                                                disabled={room.isAvailable === false}
                                                onPress={() => router.push({
                                                    pathname: '/booking/[id]',
                                                    params: {
                                                        id: room.id,
                                                        roomName: room.name || room.type,
                                                        roomType: room.type,
                                                        price: String(room.dynamicPrice || room.basePrice || 0),
                                                        maxGuests: String(room.maxGuests),
                                                        hotelName: hotel.name,
                                                        hotelCity: hotel.city,
                                                        roomImage: room.photos?.[0] || '',
                                                        hotelId: hotel.id,
                                                        checkIn: formatCheckIn(),
                                                        checkOut: formatCheckOut(),
                                                        roomIds: room.roomIds ? JSON.stringify(room.roomIds) : '',
                                                    }
                                                } as any)}
                                                activeOpacity={0.85}
                                                style={room.isAvailable !== false ? {
                                                    shadowColor: '#E63946',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                    elevation: 5,
                                                } : {}}
                                            >
                                                <Text className="text-white font-bold text-base">
                                                    {room.isAvailable !== false ? t('hotel.bookNow') : t('bookings.status.booked')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}
