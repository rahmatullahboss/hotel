import { View, Text, Pressable, Dimensions, ImageBackground } from 'react-native';
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CityCard({ name, image, hotels, index, onPress }: CityCardProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    const cityImage = CITY_IMAGES[name];

    return (
        <AnimatedPressable
            entering={FadeIn.delay(index * 40).duration(200)}
            style={[animatedStyle, { width: (width - 52) / 2 }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <View
                className="rounded-2xl overflow-hidden h-36"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    elevation: 8,
                }}
            >
                {cityImage ? (
                    <ImageBackground
                        source={{ uri: cityImage }}
                        className="flex-1 justify-end"
                        resizeMode="cover"
                    >
                        {/* Gradient Overlay */}
                        <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Content */}
                        <View className="p-4">
                            <Text className="text-white text-lg font-bold mb-0.5">
                                {name}
                            </Text>
                            <View className="flex-row items-center gap-1.5">
                                <FontAwesome name="building-o" size={10} color="rgba(255,255,255,0.8)" />
                                <Text className="text-white/80 text-xs font-medium">
                                    {hotels} {t('search.hotels')}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>
                ) : (
                    <View className="flex-1 bg-gray-100 dark:bg-gray-800 justify-center items-center p-4">
                        <Text className="text-5xl mb-2">{image}</Text>
                        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                            {name}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {hotels} {t('search.hotels')}
                        </Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}
