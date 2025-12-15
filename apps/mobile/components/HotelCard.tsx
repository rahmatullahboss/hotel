import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
}

interface HotelCardProps {
    hotel: Hotel;
    index: number;
}

export default function HotelCard({ hotel, index }: HotelCardProps) {
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

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            className="mb-4 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
        >
            {/* Image Section */}
            <View className="relative">
                <Image
                    source={{
                        uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
                    }}
                    className="w-full h-48"
                    resizeMode="cover"
                />

                {/* Rating Badge */}
                <View className="absolute top-3 right-3 flex-row items-center bg-white dark:bg-gray-900 px-2.5 py-1.5 rounded-lg gap-1.5">
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                    <Text className="text-gray-900 dark:text-white text-sm font-bold">
                        {Number(hotel.rating || 0).toFixed(1)}
                    </Text>
                </View>

                {/* Location Badge */}
                <View className="absolute bottom-3 left-3 flex-row items-center bg-black/60 px-3 py-1.5 rounded-lg gap-1.5">
                    <FontAwesome name="map-marker" size={11} color="#fff" />
                    <Text className="text-white text-xs font-medium" numberOfLines={1}>
                        {hotel.city}
                    </Text>
                </View>
            </View>

            {/* Content Section */}
            <View className="p-4">
                {/* Hotel Name */}
                <Text
                    className="text-lg font-bold text-gray-900 dark:text-white mb-3"
                    numberOfLines={1}
                >
                    {hotel.name}
                </Text>

                {/* Price Section */}
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                            {t('home.startingFrom')}
                        </Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-xl font-bold text-primary">
                                {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                                /night
                            </Text>
                        </View>
                    </View>

                    {/* Book Button */}
                    <View className="bg-primary px-4 py-2 rounded-full">
                        <Text className="text-white font-bold text-sm">
                            {t('hotel.bookNow')}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
