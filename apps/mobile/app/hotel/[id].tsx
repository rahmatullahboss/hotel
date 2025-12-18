import { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBooking } from '@/hooks/useBooking';
import { useBookingDates } from '@/contexts/BookingDatesContext';
import { Alert } from 'react-native';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.5;
const NAVY_BLUE = '#1D3557';

// Amenity icons matching reference design
const AMENITY_CONFIG: Record<string, { icon: string; label: string }> = {
    'WiFi': { icon: 'wifi', label: 'Free Wifi' },
    'AC': { icon: 'snowflake-o', label: 'AC' },
    'Parking': { icon: 'car', label: 'Parking' },
    'Pool': { icon: 'tint', label: 'Pool' },
    'Gym': { icon: 'heartbeat', label: 'Gym' },
    'Restaurant': { icon: 'cutlery', label: 'Restaurant' },
    'Spa': { icon: 'leaf', label: 'Spa' },
    'Hot Tub': { icon: 'bath', label: 'Hot Tub' },
    'Room Service': { icon: 'bell', label: 'Service' },
    'Breakfast': { icon: 'coffee', label: 'Breakfast' },
    'Bar': { icon: 'glass', label: 'Bar' },
    'Business': { icon: 'briefcase', label: 'Business' },
    'Sunning': { icon: 'sun-o', label: 'Sunning' },
};

// Default amenities if none exist
const DEFAULT_AMENITIES = [
    { icon: 'sun-o', label: 'Sunning', key: 'sunning' },
    { icon: 'wifi', label: 'Free Wifi', key: 'wifi' },
    { icon: 'cutlery', label: 'Restaurant', key: 'restaurant' },
    { icon: 'glass', label: 'Bar', key: 'bar' },
    { icon: 'briefcase', label: 'Business', key: 'business' },
];

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
                <ActivityIndicator size="large" color={NAVY_BLUE} />
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
                    <Text style={{ color: NAVY_BLUE }}>{t('hotel.goBack')}</Text>
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
    const displayAmenities = (hotel.amenities || []).slice(0, 6).map((a, i) => {
        const config = AMENITY_CONFIG[a] || { icon: 'star', label: a };
        return { ...config, key: `${a}-${i}` };
    });

    // Use default amenities if none exist
    const amenities = displayAmenities.length > 0 ? displayAmenities : DEFAULT_AMENITIES;

    // Get preview images
    const previewImages = hotel.images?.length > 0
        ? hotel.images.slice(0, 6)
        : [hotel.coverImage || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'];

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Image Section with Overlay */}
                <View className="relative" style={{ height: HERO_HEIGHT }}>
                    <Image
                        source={{
                            uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                        }}
                        style={{ width, height: HERO_HEIGHT }}
                        resizeMode="cover"
                    />

                    {/* Gradient Overlay */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: HERO_HEIGHT * 0.5,
                        }}
                    />

                    {/* Header with Semi-transparent Buttons */}
                    <View
                        style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16 }}
                        className="flex-row items-center justify-between"
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FontAwesome name="chevron-left" size={16} color="#fff" />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text className="text-lg font-semibold text-white">Detail Hotels</Text>

                        {/* Menu Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FontAwesome name="ellipsis-h" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Hotel Info Overlay at Bottom */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            left: 20,
                            right: 20,
                        }}
                    >
                        {/* Hotel Name */}
                        <Text className="text-2xl font-bold text-white mb-1" numberOfLines={2}>
                            {hotel.name}
                        </Text>

                        {/* Location */}
                        <View className="flex-row items-center gap-1">
                            <FontAwesome name="map-marker" size={14} color="#fff" />
                            <Text className="text-sm text-white/80">{hotel.city}</Text>
                        </View>
                    </View>

                    {/* Price Badge */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            backgroundColor: NAVY_BLUE,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text className="text-xl font-bold text-white">
                            ${formatPrice(price)}
                        </Text>
                        <Text className="text-xs text-white/70 text-center">/Night</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-5 pt-6 pb-32">
                    {/* Overview Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">
                        Overview
                    </Text>
                    <Text className="text-sm text-gray-500 leading-6 mb-6" numberOfLines={3}>
                        {hotel.description || `${hotel.name} is a highly recommended property in ${hotel.city}. Experience great layout and amazing views...`}
                    </Text>

                    {/* Amenities Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Amenities
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 24 }}
                        className="mb-6"
                    >
                        {amenities.map((amenity) => (
                            <View
                                key={amenity.key}
                                className="items-center"
                                style={{ minWidth: 70 }}
                            >
                                <View
                                    className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                                    style={{ backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E5E7EB' }}
                                >
                                    <FontAwesome
                                        name={amenity.icon as any}
                                        size={22}
                                        color={NAVY_BLUE}
                                    />
                                </View>
                                <Text className="text-xs text-gray-600 text-center" numberOfLines={1}>
                                    {amenity.label}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Preview Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Preview
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                        className="mb-6"
                    >
                        {previewImages.map((imageUri, index) => (
                            <TouchableOpacity
                                key={`preview-${index}`}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    className="rounded-xl"
                                    style={{ width: 80, height: 80 }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Available Rooms */}
                    {rooms.length > 0 && (
                        <View className="mt-4">
                            <Text className="text-lg font-bold text-gray-900 mb-4">
                                Available Rooms
                            </Text>
                            {rooms.slice(0, 3).map((room) => (
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
                                        <Text className="font-bold mt-1" style={{ color: NAVY_BLUE }}>
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
                className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 flex-row items-center"
                style={{
                    paddingBottom: insets.bottom + 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                {/* Favorite/Heart Button */}
                <TouchableOpacity
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{ borderWidth: 1.5, borderColor: '#E5E7EB' }}
                    onPress={handleToggleSave}
                    disabled={savingState === 'saving'}
                >
                    {savingState === 'saving' ? (
                        <ActivityIndicator size="small" color={NAVY_BLUE} />
                    ) : (
                        <FontAwesome
                            name={isSaved ? "heart" : "heart-o"}
                            size={22}
                            color={isSaved ? "#E63946" : "#374151"}
                        />
                    )}
                </TouchableOpacity>

                {/* Book Now Button */}
                <TouchableOpacity
                    className="flex-1 ml-4 py-4 rounded-full items-center"
                    style={{
                        backgroundColor: NAVY_BLUE,
                        shadowColor: NAVY_BLUE,
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
