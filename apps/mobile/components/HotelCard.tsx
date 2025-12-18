import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

type HotelCategory = 'CLASSIC' | 'PREMIUM' | 'BUSINESS';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    vibeCode?: string | null;
    category?: HotelCategory | null;
    serialNumber?: number | null;
    reviewCount?: number;
}

interface HotelCardProps {
    hotel: Hotel;
    index: number;
    distance?: number;
}

// Get category display info based on price
const getCategoryInfo = (hotel: Hotel) => {
    const price = Number(hotel.lowestPrice || 0);
    const isPremium = price >= 8000;

    if (isPremium) {
        return { label: 'Premium', color: '#F59E0B', bgClass: 'bg-amber-500' };
    }
    return { label: 'Classic', color: '#10B981', bgClass: 'bg-emerald-500' };
};

export default function HotelCard({ hotel, index, distance }: HotelCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const categoryInfo = getCategoryInfo(hotel);

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    // Display name with Zinu branding
    const displayName = hotel.name.toLowerCase().startsWith('zinu')
        ? hotel.name
        : `Zinu ${hotel.name.replace(/^Vibe\s+/i, '')}`;

    // Generate Zinu ID
    const zinuId = hotel.vibeCode
        ? hotel.vibeCode
        : hotel.serialNumber
            ? `ZN${hotel.serialNumber.toString().padStart(4, '0')}`
            : `ZN${(index + 1).toString().padStart(4, '0')}`;

    const handlePress = () => {
        router.push({
            pathname: `/hotel/${hotel.id}`,
            params: { zinuId }
        });
    };

    const rating = Number(hotel.rating || 0).toFixed(1);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.95}
            className="mb-4"
        >
            <View
                className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                {/* Image Section */}
                <View className="relative">
                    <Image
                        source={{
                            uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
                        }}
                        className="w-full h-52"
                        resizeMode="cover"
                        style={{ backgroundColor: '#F1F5F9' }}
                    />

                    {/* Top Overlay - Category & Rating */}
                    <View className="absolute top-3 left-3 right-3 flex-row justify-between">
                        {/* Category Badge */}
                        <View
                            className="flex-row items-center px-2.5 py-1.5 rounded-lg"
                            style={{ backgroundColor: categoryInfo.color }}
                        >
                            <Text className="text-white text-xs font-bold">
                                {categoryInfo.label}
                            </Text>
                        </View>

                        {/* Rating Badge */}
                        <View className="flex-row items-center bg-white/95 px-2.5 py-1.5 rounded-lg gap-1">
                            <FontAwesome name="star" size={11} color="#FBBF24" />
                            <Text className="text-gray-900 text-xs font-bold">
                                {rating}
                            </Text>
                        </View>
                    </View>

                    {/* Distance Badge (for nearby hotels) */}
                    {distance !== undefined && (
                        <View className="absolute top-12 right-3 bg-blue-500 px-2.5 py-1 rounded-lg">
                            <Text className="text-white text-xs font-bold">
                                {distance.toFixed(1)} km
                            </Text>
                        </View>
                    )}

                    {/* Bottom Overlay - ID Badge */}
                    <View className="absolute bottom-3 right-3 bg-primary px-2.5 py-1.5 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                            {zinuId}
                        </Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="p-4">
                    {/* Hotel Name */}
                    <Text
                        className="text-lg font-bold text-gray-900 dark:text-white mb-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {displayName}
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center mb-3">
                        <FontAwesome name="map-marker" size={12} color="#94A3B8" />
                        <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">
                            {hotel.city}
                        </Text>
                    </View>

                    {/* Price & Book Row */}
                    <View className="flex-row items-end justify-between">
                        <View>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                                {t('home.startingFrom')}
                            </Text>
                            <View className="flex-row items-baseline">
                                <Text className="text-2xl font-bold text-primary">
                                    {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                                </Text>
                                <Text className="text-sm text-gray-400 dark:text-gray-500 ml-1">
                                    {t('common.perNight', '/night')}
                                </Text>
                            </View>
                        </View>

                        {/* Book Button */}
                        <TouchableOpacity
                            className="bg-primary px-5 py-2.5 rounded-xl"
                            onPress={(e) => {
                                e.stopPropagation();
                                handlePress();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold text-sm">
                                {t('hotel.bookNow')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
