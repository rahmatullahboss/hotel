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

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 320;

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const scrollY = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    const {
        hotel,
        rooms,
        loading,
        error,
        isSaved,
        savingState,
        handleToggleSave,
    } = useBooking(id);

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

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
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
            >
                <Image
                    source={{
                        uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                    }}
                    style={{ width, height: HEADER_HEIGHT }}
                    resizeMode="cover"
                />

                {/* Custom Header Buttons */}
                <View
                    style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16 }}
                    className="flex-row justify-between"
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
                            onPress={() => shareHotel({
                                hotelId: hotel.id,
                                hotelName: hotel.vibeCode ? `Vibe ${hotel.name}` : hotel.name,
                                city: hotel.city,
                                rating: Number(hotel.rating),
                            })}
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
            </Animated.View>

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
                            {/* Rating Badge */}
                            <View className="flex-row items-center bg-black/80 px-3 py-1.5 rounded-lg gap-1.5">
                                <FontAwesome name="star" size={14} color="#FFD700" />
                                <Text className="text-white text-sm font-bold">
                                    {Number(hotel.rating || 0).toFixed(1)}
                                </Text>
                            </View>
                            {/* Vibe Code Badge */}
                            {hotel.vibeCode && (
                                <View className="bg-primary px-3 py-1.5 rounded-lg">
                                    <Text className="text-white text-sm font-bold">
                                        {hotel.vibeCode}
                                    </Text>
                                </View>
                            )}
                            {/* Category Badge */}
                            {hotel.category && (
                                <View
                                    className="px-3 py-1.5 rounded-lg"
                                    style={{
                                        backgroundColor: hotel.category === 'PREMIUM' ? '#F59E0B'
                                            : hotel.category === 'BUSINESS' ? '#3B82F6'
                                                : '#10B981'
                                    }}
                                >
                                    <Text className="text-white text-sm font-bold">
                                        {hotel.category === 'PREMIUM' ? 'Premium'
                                            : hotel.category === 'BUSINESS' ? 'Business'
                                                : 'Classic'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Hotel Name with Vibe brand prefix (code shown as badge) */}
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {hotel.vibeCode ? `Vibe ${hotel.name}` : hotel.name}
                        </Text>

                        {/* Location with Navigate Button */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center gap-2 flex-1">
                                <FontAwesome name="map-marker" size={16} color="#E63946" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400 flex-1" numberOfLines={2}>
                                    {hotel.address}, {hotel.city}
                                </Text>
                            </View>
                            {hotel.latitude && hotel.longitude && (
                                <TouchableOpacity
                                    onPress={() => openNavigation({
                                        latitude: parseFloat(hotel.latitude!),
                                        longitude: parseFloat(hotel.longitude!),
                                        name: hotel.name,
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
                        <Text className="text-base text-gray-700 dark:text-gray-300 leading-6 mb-5">
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
                                            className="px-5 py-2 rounded-full bg-gray-100 dark:bg-gray-800"
                                        >
                                            <Text className="text-sm text-gray-700 dark:text-gray-300">
                                                {amenity}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        )}
                    </View>

                    {/* Rooms Section */}
                    <View className="px-5 pb-5">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {t('hotel.availableRooms')}
                        </Text>

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
                                    className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                                >
                                    {/* Image with badges */}
                                    <View className="relative">
                                        <Image
                                            source={{
                                                uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
                                            }}
                                            className="w-full h-44"
                                            resizeMode="cover"
                                        />
                                        {/* Room Type Badge */}
                                        <View className="absolute top-3 left-3 bg-primary px-3 py-1.5 rounded-lg">
                                            <Text className="text-white text-xs font-bold">
                                                {room.type}
                                            </Text>
                                        </View>
                                        {/* Available Count Badge - OYO/Booking.com style */}
                                        {room.availableCount !== undefined && room.availableCount > 0 && (
                                            <View className="absolute top-3 right-3 bg-orange-500 px-2.5 py-1.5 rounded-lg">
                                                <Text className="text-white text-xs font-bold">
                                                    {room.availableCount} {room.availableCount === 1 ? 'room' : 'rooms'} left
                                                </Text>
                                            </View>
                                        )}
                                        {/* Guest Badge - move below if available count shown */}
                                        {(room.availableCount === undefined || room.availableCount === 0) && (
                                            <View className="absolute top-3 right-3 flex-row items-center bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg gap-1.5">
                                                <FontAwesome name="users" size={11} color="#E63946" />
                                                <Text className="text-gray-900 dark:text-white text-sm font-bold">
                                                    {room.maxGuests}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Content */}
                                    <View className="p-4">
                                        {/* Room Name & Guest Count */}
                                        <View className="flex-row items-center justify-between mb-3">
                                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                                {room.name || room.type}
                                            </Text>
                                            {room.availableCount !== undefined && room.availableCount > 0 && (
                                                <View className="flex-row items-center gap-1">
                                                    <FontAwesome name="users" size={11} color="#6B7280" />
                                                    <Text className="text-gray-500 text-sm">
                                                        {t('hotel.upToGuests', { count: room.maxGuests })}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Price and Book Section */}
                                        <View className="flex-row items-center justify-between">
                                            <View>
                                                {room.dynamicPrice && room.dynamicPrice < Number(room.basePrice) && (
                                                    <Text className="text-xs line-through text-gray-400">
                                                        {t('common.currency')}{formatPrice(Number(room.basePrice))}
                                                    </Text>
                                                )}
                                                <Text className="text-xl font-bold text-primary">
                                                    {t('common.currency')}{formatPrice(Number(room.dynamicPrice || room.basePrice || 0))}
                                                    <Text className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        {' '}{t('common.perNight')}
                                                    </Text>
                                                </Text>
                                            </View>

                                            {/* Book Button */}
                                            <TouchableOpacity
                                                className={`px-5 py-2.5 rounded-full ${room.isAvailable !== false ? 'bg-primary' : 'bg-gray-400'}`}
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
                                                        // Pass roomIds for auto room assignment
                                                        roomIds: room.roomIds ? JSON.stringify(room.roomIds) : '',
                                                    }
                                                } as any)}
                                                activeOpacity={0.85}
                                            >
                                                <Text className="text-white font-bold text-sm">
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
