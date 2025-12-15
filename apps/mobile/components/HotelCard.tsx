import { useRouter } from 'expo-router';
import { View, Text, Image, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    FadeIn,
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
        scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    const handlePress = () => {
        router.push(`/hotel/${hotel.id}`);
    };

    return (
        <AnimatedPressable
            entering={FadeIn.delay(index * 50).duration(300)}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            className="mb-5"
        >
            {/* Main Card Container with Premium Shadow */}
            <View className="rounded-3xl overflow-hidden bg-white dark:bg-gray-800"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 24,
                    elevation: 12,
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
                    />

                    {/* Gradient Overlay */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Rating Badge - Top Right */}
                    <View className="absolute top-4 right-4 flex-row items-center bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-full gap-1.5"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }}
                    >
                        <FontAwesome name="star" size={12} color="#F59E0B" />
                        <Text className="text-gray-900 dark:text-white text-sm font-bold">
                            {Number(hotel.rating || 0).toFixed(1)}
                        </Text>
                    </View>

                    {/* Location Badge - Bottom */}
                    <View className="absolute bottom-4 left-4 flex-row items-center gap-1.5">
                        <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center">
                            <FontAwesome name="map-marker" size={12} color="#fff" />
                        </View>
                        <Text className="text-white text-sm font-medium" numberOfLines={1}>
                            {hotel.city}
                        </Text>
                    </View>
                </View>

                {/* Content Section */}
                <View className="p-5">
                    {/* Hotel Name */}
                    <Text
                        className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight"
                        numberOfLines={1}
                    >
                        {hotel.name}
                    </Text>

                    {/* Divider */}
                    <View className="h-px bg-gray-100 dark:bg-gray-700 mb-3" />

                    {/* Price Section */}
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-1">
                                {t('home.startingFrom')}
                            </Text>
                            <View className="flex-row items-baseline gap-1">
                                <Text className="text-2xl font-extrabold text-primary">
                                    {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                                </Text>
                                <Text className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                                    {t('common.perNight')}
                                </Text>
                            </View>
                        </View>

                        {/* Book Button */}
                        <View className="bg-primary px-5 py-2.5 rounded-full">
                            <Text className="text-white font-bold text-sm">
                                {t('hotel.bookNow')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}
