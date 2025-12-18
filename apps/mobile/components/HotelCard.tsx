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
}

interface HotelCardProps {
    hotel: Hotel;
    index: number;
    distance?: number; // Distance in km for nearby hotels
}

// Get category display info
const getCategoryInfo = (category?: HotelCategory | null) => {
    switch (category) {
        case 'PREMIUM':
            return { label: 'Zinu Premium', color: '#F59E0B', bgColor: 'bg-amber-500' };
        case 'BUSINESS':
            return { label: 'Business', color: '#3B82F6', bgColor: 'bg-blue-500' };
        case 'CLASSIC':
        default:
            return { label: 'Zinu Classic', color: '#10B981', bgColor: 'bg-emerald-500' };
    }
};

export default function HotelCard({ hotel, index, distance }: HotelCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    const handlePress = () => {
        router.push(`/hotel/${hotel.id}`);
    };

    const categoryInfo = getCategoryInfo(hotel.category);

    // Show "Zinu Hotel Name" (brand prefix), vibeCode number shown as badge
    const displayName = hotel.name.toLowerCase().startsWith('zinu') ? hotel.name : `Zinu ${hotel.name}`;

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            className="mb-4 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
            {/* Image Section */}
            <View className="relative bg-gray-200 dark:bg-gray-700">
                <Image
                    source={{
                        uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
                    }}
                    className="w-full h-48"
                    resizeMode="cover"
                    style={{ backgroundColor: '#E5E7EB' }}
                />

                {/* Vibe Category Badge */}
                {hotel.category && (
                    <View
                        className="absolute top-3 left-3 flex-row items-center px-2.5 py-1.5 rounded-lg gap-1.5 max-w-[60%]"
                        style={{ backgroundColor: categoryInfo.color }}
                    >
                        <Text className="text-white text-xs font-bold flex-shrink" numberOfLines={1} ellipsizeMode="tail">
                            {categoryInfo.label}
                        </Text>
                    </View>
                )}

                {/* Rating Badge */}
                <View className="absolute top-3 right-3 flex-row items-center bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg gap-1.5">
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text className="text-gray-900 dark:text-white text-sm font-bold" numberOfLines={1} ellipsizeMode="clip">
                        {Number(hotel.rating || 0).toFixed(1)}
                    </Text>
                </View>

                {/* Distance Badge (for nearby hotels) */}
                {distance !== undefined && (
                    <View className="absolute top-12 right-3 bg-green-500 px-2.5 py-1 rounded-lg">
                        <Text className="text-white text-xs font-bold">
                            {distance.toFixed(1)} km
                        </Text>
                    </View>
                )}

                {/* Location Badge */}
                <View className="absolute bottom-3 left-3 flex-row items-center bg-black/60 px-2.5 py-1.5 rounded-lg gap-1.5">
                    <FontAwesome name="map-marker" size={11} color="#fff" />
                    <Text className="text-white text-xs font-medium min-w-[50px]" style={{ includeFontPadding: false }}>
                        {hotel.city}
                    </Text>
                </View>

                {/* Vibe Code Badge */}
                {hotel.vibeCode && (
                    <View className="absolute bottom-3 right-3 bg-primary/90 px-2.5 py-1.5 rounded-lg">
                        <Text className="text-white text-xs font-bold" numberOfLines={1} ellipsizeMode="clip">
                            {hotel.vibeCode}
                        </Text>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View className="p-4">
                {/* Hotel Name */}
                <Text
                    className="text-lg font-bold text-gray-900 dark:text-white mb-3"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {displayName}
                </Text>

                {/* Price Section */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-shrink mr-3">
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                            {t('home.startingFrom')}
                        </Text>
                        <Text className="text-xl font-bold text-primary" numberOfLines={1}>
                            {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                            <Text className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {' '}{t('common.perNight', '/night')}
                            </Text>
                        </Text>
                    </View>

                    {/* Book Button */}
                    <TouchableOpacity
                        className="bg-primary px-4 py-2 rounded-full"
                        onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/hotel/${hotel.id}`);
                        }}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-sm">
                            {t('hotel.bookNow')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

