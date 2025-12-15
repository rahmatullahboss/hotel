import { View, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface CityCardProps {
    name: string;
    image: string;
    hotels: string;
    index: number;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CityCard({ name, image, hotels, index, onPress }: CityCardProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            entering={FadeInUp.delay(index * 60).springify().damping(18)}
            style={[animatedStyle, { width: (width - 52) / 2 }]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            className="p-4 rounded-2xl bg-white dark:bg-gray-800 items-center shadow-lg"
        >
            {/* Decorative glow effect */}
            <View className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />

            <Text className="text-4xl mb-2">{image}</Text>
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                {name}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
                {hotels} {t('search.hotels')}
            </Text>
        </AnimatedPressable>
    );
}
