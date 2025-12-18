import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
    Alert,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useBooking } from '@/hooks/useBooking';
import { useBookingDates } from '@/contexts/BookingDatesContext';
import { shareHotel } from '@/lib/share';
import RoomCard from '@/components/RoomCard';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.5;
const ACCENT_COLOR = '#E63946';

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

    // Image gallery state
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

    // Handle share action
    const handleShare = useCallback(async () => {
        if (!hotel) return;
        try {
            await shareHotel({
                hotelId: hotel.id,
                hotelName: hotel.name,
                city: hotel.city,
                rating: hotel.rating ? Number(hotel.rating) : undefined,
            });
        } catch (error) {
            // User cancelled or share failed
            console.log('Share cancelled or failed');
        }
    }, [hotel]);

    // Handle preview image tap
    const handleImageTap = useCallback((index: number) => {
        setSelectedImageIndex(index);
    }, []);

    // Handle close image modal
    const handleCloseImageModal = useCallback(() => {
        setSelectedImageIndex(null);
    }, []);

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
        : Number((hotel as any).lowestPrice || 0);

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
                <View className="relative" style={{ height: HERO_HEIGHT }}>
                    <FlatList
                        data={previewImages}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => `hero-${index}`}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity activeOpacity={0.9} onPress={() => handleImageTap(index)}>
                                <Image
                                    source={{ uri: item }}
                                    style={{ width, height: HERO_HEIGHT }}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        )}
                        onMomentumScrollEnd={(e) => {
                            // Optional: Update current index state if needed for dots
                        }}
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

                        {/* Share Button */}
                        <TouchableOpacity
                            onPress={handleShare}
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
                            <FontAwesome name="share" size={16} color="#fff" />
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
                            backgroundColor: ACCENT_COLOR,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                        }}
                    >
                        <Text className="text-xl font-bold text-white">
                            ৳ {formatPrice(price)}
                        </Text>
                        <Text className="text-xs text-white/70 text-center">{t('hotel.perNight')}</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-5 pt-6 pb-32">
                    {/* Overview Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">
                        {t('hotel.overview')}
                    </Text>
                    <Text
                        className="text-sm text-gray-500 leading-6"
                        numberOfLines={isDescriptionExpanded ? undefined : 3}
                    >
                        {hotel.description || t('hotel.defaultDescription', { name: hotel.name, city: hotel.city })}
                    </Text>
                    <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                        <Text className="text-sm font-semibold mt-1 mb-6" style={{ color: ACCENT_COLOR }}>
                            {isDescriptionExpanded ? t('hotel.readLess') : t('hotel.readMore')}
                        </Text>
                    </TouchableOpacity>

                    {/* Amenities Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        {t('hotel.amenities')}
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
                                className="items-center px-2"
                            >
                                <View
                                    className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                                    style={{ backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E5E7EB' }}
                                >
                                    <FontAwesome
                                        name={amenity.icon as any}
                                        size={22}
                                        color={ACCENT_COLOR}
                                    />
                                </View>
                                <Text
                                    className="text-gray-600 text-center text-xs"
                                    style={{ paddingBottom: 4 }}
                                >
                                    {amenity.label}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>



                    {/* Available Rooms */}
                    {rooms.length > 0 && (
                        <View className="mt-6">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-bold text-gray-900">
                                    {t('hotel.availableRooms')}
                                </Text>
                                {rooms.length > 3 && (
                                    <Text className="text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                                        {t('hotel.viewAll')} ({rooms.length})
                                    </Text>
                                )}
                            </View>
                            {rooms.slice(0, 3).map((room) => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    hotelName={hotel.name}
                                    hotelCity={hotel.city}
                                    hotelId={hotel.id}
                                    checkIn={formatCheckIn()}
                                    checkOut={formatCheckOut()}
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
                                />
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
                    disabled={savingState === true}
                >
                    {savingState === true ? (
                        <ActivityIndicator size="small" color={ACCENT_COLOR} />
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

            {/* Full Screen Image Gallery Modal */}
            <Modal
                visible={selectedImageIndex !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseImageModal}
            >
                <View className="flex-1 bg-black">
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={handleCloseImageModal}
                        style={{
                            position: 'absolute',
                            top: insets.top + 16,
                            right: 16,
                            zIndex: 10,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FontAwesome name="close" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Image Counter */}
                    <View
                        style={{
                            position: 'absolute',
                            top: insets.top + 16,
                            left: 16,
                            zIndex: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                        }}
                    >
                        <Text className="text-white text-sm font-medium">
                            {(selectedImageIndex ?? 0) + 1} / {previewImages.length}
                        </Text>
                    </View>

                    {/* Scrollable Images */}
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{ x: (selectedImageIndex ?? 0) * width, y: 0 }}
                        className="flex-1"
                    >
                        {previewImages.map((imageUri, index) => (
                            <View
                                key={`fullscreen-${index}`}
                                style={{ width, height: '100%' }}
                                className="items-center justify-center"
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: width - 32, height: height * 0.6 }}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Thumbnail Navigation */}
                    <View
                        style={{ paddingBottom: insets.bottom + 16 }}
                        className="px-4"
                    >
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {previewImages.map((imageUri, index) => (
                                <TouchableOpacity
                                    key={`thumb-${index}`}
                                    onPress={() => setSelectedImageIndex(index)}
                                    style={{
                                        borderWidth: selectedImageIndex === index ? 2 : 0,
                                        borderColor: ACCENT_COLOR,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: 60, height: 60, borderRadius: 6 }}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
