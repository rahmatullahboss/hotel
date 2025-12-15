import { useRouter } from 'expo-router';
import { View, Text, Image, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HotelCard({ hotel, index }: HotelCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const scale = useSharedValue(1);

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handlePress = () => {
        router.push(`/hotel/${hotel.id}`);
    };

    return (
        <AnimatedPressable
            entering={FadeInDown.delay(index * 80).springify().damping(18)}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800"
        >
            {/* Glassmorphism shadow effect */}
            <View className="absolute -inset-1 bg-primary/5 rounded-2xl blur-xl" />

            {/* Card Content */}
            <View className="relative shadow-lg">
                {/* Image */}
                <View className="relative">
                    <Image
                        source={{
                            uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
                        }}
                        className="w-full h-44"
                        resizeMode="cover"
                    />
                    {/* Rating Badge */}
                    <View className="absolute top-3 right-3 flex-row items-center bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg gap-1">
                        <FontAwesome name="star" size={11} color="#FFD700" />
                        <Text className="text-white text-sm font-bold">
                            {Number(hotel.rating || 0).toFixed(1)}
                        </Text>
                    </View>
                    {/* Premium Badge Overlay */}
                    <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                </View>

                {/* Info Section */}
                <View className="p-4">
                    <Text
                        className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight"
                        numberOfLines={1}
                    >
                        {hotel.name}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mb-3">
                        <FontAwesome name="map-marker" size={12} color="#9CA3AF" />
                        <Text
                            className="text-sm text-gray-500 dark:text-gray-400 flex-1"
                            numberOfLines={1}
                        >
                            {hotel.city}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-gray-500 dark:text-gray-400">
                            {t('home.startingFrom')}
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-xl font-bold text-primary">
                                {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                {t('common.perNight')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
