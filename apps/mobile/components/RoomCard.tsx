import React from 'react';
import {
    View,
    Text,
    Image,
    Pressable,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const ACCENT_COLOR = '#E63946';

// Room amenity icons - keys map to translation keys
const ROOM_AMENITY_CONFIG: Record<string, { icon: string; key: string }> = {
    'AC': { icon: 'snowflake-o', key: 'ac' },
    'WiFi': { icon: 'wifi', key: 'wifi' },
    'TV': { icon: 'television', key: 'tv' },
    'Minibar': { icon: 'glass', key: 'minibar' },
    'Balcony': { icon: 'leaf', key: 'balcony' },
    'Sea View': { icon: 'ship', key: 'seaView' },
    'City View': { icon: 'building', key: 'cityView' },
    'Pool View': { icon: 'tint', key: 'poolView' },
    'King Bed': { icon: 'bed', key: 'kingBed' },
    'Twin Beds': { icon: 'bed', key: 'twinBeds' },
    'Suite': { icon: 'star', key: 'suite' },
    'Jacuzzi': { icon: 'bath', key: 'jacuzzi' },
    'Kitchen': { icon: 'cutlery', key: 'kitchen' },
    'Safe': { icon: 'lock', key: 'safe' },
};

// Default room amenities to show if none exist
const DEFAULT_ROOM_AMENITIES = ['AC', 'WiFi', 'TV'];

interface RoomCardProps {
    room: {
        id: string;
        name?: string;
        type: string;
        photos?: string[];
        maxGuests: number;
        dynamicPrice?: number | string | null;
        basePrice: number | string;
        amenities?: string[];
        availableCount?: number;
        roomIds?: string[];
    };
    hotelName: string;
    hotelCity: string;
    hotelId: string;
    checkIn: string;
    checkOut: string;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function RoomCard({
    room,
    hotelName,
    hotelCity,
    hotelId,
    checkIn,
    checkOut,
    onPress,
}: RoomCardProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.995, { damping: 20, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
    };

    const formatPrice = (price: number | undefined | null) => {
        const numPrice = Number(price || 0);
        return numPrice.toLocaleString('en-US');
    };

    const price = Number(room.dynamicPrice || room.basePrice);
    const roomImage = room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400';
    const roomName = room.name || room.type;

    // Get amenities to display
    const displayAmenities = (room.amenities || DEFAULT_ROOM_AMENITIES).slice(0, 3);

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animatedStyle]}
        >
            <View
                className="bg-white rounded-3xl mb-4 overflow-hidden"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                {/* Room Image */}
                <View className="relative">
                    <Image
                        source={{ uri: roomImage }}
                        className="w-full"
                        style={{ height: 160 }}
                        resizeMode="cover"
                    />
                    {/* Availability Badge */}
                    {room.availableCount !== undefined && room.availableCount > 0 && (
                        <View
                            className="absolute top-3 left-3 px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.9)' }}
                        >
                            <Text className="text-white text-xs font-semibold">
                                {room.availableCount === 1
                                    ? t('room.roomLeft', { count: room.availableCount })
                                    : t('room.roomsLeft', { count: room.availableCount })
                                }
                            </Text>
                        </View>
                    )}
                    {/* Price Badge */}
                    <View
                        className="absolute bottom-3 right-3 px-4 py-2 rounded-xl"
                        style={{ backgroundColor: ACCENT_COLOR }}
                    >
                        <Text className="text-white text-lg font-bold">
                            ৳{formatPrice(price)}
                        </Text>
                        <Text className="text-white/70 text-xs text-center">
                            {t('room.perNight')}
                        </Text>
                    </View>
                </View>

                {/* Room Details */}
                <View className="p-4">
                    {/* Room Name */}
                    <Text className="text-lg font-bold text-gray-900 mb-2" numberOfLines={1}>
                        {roomName}
                    </Text>

                    {/* Amenities Row */}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                        {displayAmenities.map((amenity, index) => {
                            const config = ROOM_AMENITY_CONFIG[amenity] || { icon: 'check', key: amenity.toLowerCase() };
                            return (
                                <View
                                    key={`${amenity}-${index}`}
                                    className="flex-row items-center px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: '#F3F4F6' }}
                                >
                                    <FontAwesome
                                        name={config.icon as any}
                                        size={12}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-600 text-xs ml-1.5 font-medium">
                                        {t(`amenities.${config.key}`, { defaultValue: amenity })}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Bottom Row */}
                    <View className="flex-row items-center justify-between">
                        {/* Guest Capacity */}
                        <View className="flex-row items-center">
                            <View
                                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                                style={{ backgroundColor: '#FEF2F2' }}
                            >
                                <FontAwesome name="user" size={14} color={ACCENT_COLOR} />
                            </View>
                            <Text className="text-gray-600 text-sm">
                                {t('room.upToGuests', { count: room.maxGuests })} {t('room.guests')}
                            </Text>
                        </View>

                        {/* Book Button */}
                        <View
                            className="flex-row items-center px-4 py-2 rounded-full"
                            style={{ backgroundColor: '#FEF2F2' }}
                        >
                            <Text className="text-sm font-semibold mr-1" style={{ color: ACCENT_COLOR }}>
                                {t('room.book')}
                            </Text>
                            <FontAwesome name="chevron-right" size={10} color={ACCENT_COLOR} />
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
