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
import { useBookingDates } from '@/contexts/BookingDatesContext';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;
const ACCENT_COLOR = '#E63946';

// Amenity icons matching reference design
const AMENITY_CONFIG: Record<string, { icon: string; label: string }> = {
    'WiFi': { icon: '📶', label: 'WiFi' },
    'AC': { icon: '❄️', label: 'AC' },
    'Parking': { icon: '🅿️', label: 'Parking' },
    'Pool': { icon: '🏊', label: 'Pool' },
    'Gym': { icon: '💪', label: 'Gym' },
    'Restaurant': { icon: '🍽️', label: 'Dinner' },
    'Spa': { icon: '💆', label: 'Spa' },
    'Hot Tub': { icon: '🛁', label: 'Hot Tub' },
    'Room Service': { icon: '🛎️', label: 'Service' },
    'Breakfast': { icon: '🍳', label: 'Breakfast' },
};

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    const { checkIn, checkOut, setDates, formatCheckIn, formatCheckOut } = useBookingDates();

    const {
        hotel,
        rooms,
        loading,
        error,
        isSaved,
        savingState,
        handleToggleSave,
    } = useBooking(id, { checkIn: formatCheckIn(), checkOut: formatCheckOut() });

    const formatPrice = (price: number | undefined | null) => {
        const numPrice = Number(price || 0);
        return numPrice.toLocaleString('en-US');
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color={ACCENT_COLOR} />
            </View>
        );
    }

    if (error || !hotel) {
        return (
            <View className="flex-1 items-center justify-center p-5 bg-white">
                <Text className="text-base mb-4 text-gray-900">
                    {error || t('hotel.notFound')}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: ACCENT_COLOR }}>{t('hotel.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Get the lowest price room
    const lowestPriceRoom = rooms.length > 0
        ? rooms.reduce((min, r) => (r.dynamicPrice || r.basePrice) < (min.dynamicPrice || min.basePrice) ? r : min, rooms[0])
        : null;

    const price = lowestPriceRoom
        ? Number(lowestPriceRoom.dynamicPrice || lowestPriceRoom.basePrice)
        : Number(hotel.lowestPrice || 0);

    // Get amenity display items
    const displayAmenities = (hotel.amenities || []).slice(0, 4).map((a, i) => {
        const config = AMENITY_CONFIG[a] || { icon: '✨', label: a };
        return { ...config, key: `${a}-${i}` };
    });

    // Add default amenities if none exist
    if (displayAmenities.length === 0) {
        displayAmenities.push(
            { icon: '🛏️', label: '2 Beds', key: 'beds' },
            { icon: '🍽️', label: 'Dinner', key: 'dinner' },
            { icon: '🛁', label: 'Hot Tub', key: 'hottub' },
            { icon: '❄️', label: '1 Ac', key: 'ac' }
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Image Section */}
                <View className="relative" style={{ height: HEADER_HEIGHT }}>
                    <Image
                        source={{
                            uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                        }}
                        style={{ width, height: HEADER_HEIGHT }}
                        resizeMode="cover"
                    />

                    {/* Header Buttons */}
                    <View
                        style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16 }}
                        className="flex-row justify-between"
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <FontAwesome name="chevron-left" size={16} color="#1F2937" />
                        </TouchableOpacity>

                        {/* Title & Menu */}
                        <Text className="text-lg font-bold text-white">Details</Text>

                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-white items-center justify-center"
                            activeOpacity={0.8}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3,
                            }}
                        >
                            <FontAwesome name="ellipsis-v" size={16} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    {/* Rating Badge */}
                    <View
                        className="absolute top-4 left-4 flex-row items-center px-2.5 py-1.5 rounded-lg gap-1"
                        style={{ backgroundColor: '#F59E0B', marginTop: insets.top + 48 }}
                    >
                        <FontAwesome name="star" size={12} color="#fff" />
                        <Text className="text-white font-bold text-sm">
                            {Number(hotel.rating).toFixed(1)}
                        </Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-5 pt-5 pb-32">
                    {/* Location */}
                    <View className="flex-row items-center gap-1 mb-2">
                        <FontAwesome name="map-marker" size={14} color={ACCENT_COLOR} />
                        <Text className="text-sm text-gray-500">{hotel.city}</Text>
                    </View>

                    {/* Hotel Name */}
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {hotel.name}
                    </Text>

                    {/* Price */}
                    <View className="flex-row items-baseline mb-6">
                        <Text className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                            ${formatPrice(price)}
                        </Text>
                        <Text className="text-gray-400 ml-1">/ night</Text>
                    </View>

                    {/* What We Offer */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        What We Offer
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                        className="mb-6"
                    >
                        {displayAmenities.map((amenity) => (
                            <View
                                key={amenity.key}
                                className="px-4 py-2.5 rounded-full bg-gray-100 flex-row items-center gap-2"
                            >
                                <Text className="text-base">{amenity.icon}</Text>
                                <Text className="text-sm font-medium text-gray-700">
                                    {amenity.label}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Description */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">
                        Description
                    </Text>
                    <Text className="text-sm text-gray-500 leading-6 mb-2">
                        {hotel.description || `Set in ${hotel.city}, this beautiful hotel offers accommodation with a garden, private parking and a shared lounge.`}
                    </Text>
                    <TouchableOpacity>
                        <Text className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
                            Show more
                        </Text>
                    </TouchableOpacity>

                    {/* Rooms Preview */}
                    {rooms.length > 0 && (
                        <View className="mt-8">
                            <Text className="text-lg font-bold text-gray-900 mb-4">
                                Available Rooms
                            </Text>
                            {rooms.slice(0, 2).map((room) => (
                                <TouchableOpacity
                                    key={room.id}
                                    className="bg-gray-50 rounded-2xl p-4 mb-3 flex-row"
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
                                >
                                    <Image
                                        source={{ uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }}
                                        className="w-20 h-20 rounded-xl"
                                    />
                                    <View className="flex-1 ml-3 justify-center">
                                        <Text className="font-bold text-gray-900">{room.name || room.type}</Text>
                                        <Text className="text-xs text-gray-400 mt-1">👥 Up to {room.maxGuests} guests</Text>
                                        <Text className="font-bold mt-1" style={{ color: ACCENT_COLOR }}>
                                            ${formatPrice(room.dynamicPrice || room.basePrice)}/night
                                        </Text>
                                    </View>
                                    <FontAwesome name="chevron-right" size={14} color="#9CA3AF" style={{ alignSelf: 'center' }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 flex-row items-center justify-between"
                style={{
                    paddingBottom: insets.bottom + 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                {/* Message Button */}
                <TouchableOpacity
                    className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center"
                >
                    <FontAwesome name="comment-o" size={20} color="#374151" />
                </TouchableOpacity>

                {/* Book Now Button */}
                <TouchableOpacity
                    className="flex-1 ml-4 py-4 rounded-full items-center"
                    style={{
                        backgroundColor: ACCENT_COLOR,
                        shadowColor: ACCENT_COLOR,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                    onPress={() => {
                        if (lowestPriceRoom) {
                            router.push({
                                pathname: '/booking/[id]',
                                params: {
                                    id: lowestPriceRoom.id,
                                    roomName: lowestPriceRoom.name || lowestPriceRoom.type,
                                    roomType: lowestPriceRoom.type,
                                    price: String(lowestPriceRoom.dynamicPrice || lowestPriceRoom.basePrice || 0),
                                    maxGuests: String(lowestPriceRoom.maxGuests),
                                    hotelName: hotel.name,
                                    hotelCity: hotel.city,
                                    roomImage: lowestPriceRoom.photos?.[0] || '',
                                    hotelId: hotel.id,
                                    checkIn: formatCheckIn(),
                                    checkOut: formatCheckOut(),
                                    roomIds: lowestPriceRoom.roomIds ? JSON.stringify(lowestPriceRoom.roomIds) : '',
                                }
                            } as any);
                        } else {
                            Alert.alert('No Rooms', 'No rooms available for booking');
                        }
                    }}
                >
                    <Text className="text-white font-bold text-lg">Book Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
