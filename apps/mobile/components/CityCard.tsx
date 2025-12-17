import { View, Text, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface CityCardProps {
    name: string;
    image: string;
    hotels: string;
    index: number;
    onPress: () => void;
}

// City images from Unsplash
const CITY_IMAGES: Record<string, string> = {
    'Dhaka': 'https://images.unsplash.com/photo-1677405639498-6c89c08db798?w=400',
    'Chittagong': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
    "Cox's Bazar": 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'Sylhet': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    'Rajshahi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    'Khulna': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
};

export default function CityCard({ name, image, hotels, onPress }: CityCardProps) {
    const { t } = useTranslation();
    const cityImage = CITY_IMAGES[name];

    return (
        <TouchableOpacity
            style={{ width: (width - 52) / 2 }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View className="rounded-2xl overflow-hidden h-32 border border-gray-100 dark:border-gray-700">
                {cityImage ? (
                    <ImageBackground
                        source={{ uri: cityImage }}
                        className="flex-1 justify-end"
                        resizeMode="cover"
                    >
                        {/* Gradient Overlay */}
                        <View className="absolute inset-0 bg-black/40" />

                        {/* Content */}
                        <View className="p-3">
                            <Text className="text-white text-base font-bold" numberOfLines={1}>
                                {name}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <FontAwesome name="building-o" size={10} color="rgba(255,255,255,0.8)" />
                                <Text className="text-white/80 text-xs" numberOfLines={1}>
                                    {hotels} {t('search.hotels')}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                ) : (
                    <View className="flex-1 bg-gray-100 dark:bg-gray-800 justify-center items-center p-4">
                        <Text className="text-4xl mb-2">{image}</Text>
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                            {hotels} {t('search.hotels')}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}
