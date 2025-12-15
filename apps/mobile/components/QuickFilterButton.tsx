import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    FadeInUp,
} from 'react-native-reanimated';

interface QuickFilterButtonProps {
    id: string;
    label: string;
    icon: 'location-arrow' | 'tag' | 'star' | 'heart';
    index: number;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function QuickFilterButton({
    label,
    icon,
    index,
    onPress,
}: QuickFilterButtonProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            entering={FadeInUp.delay(index * 50).springify()}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            className="items-center flex-1"
        >
            {/* 3D Effect Container */}
            <View className="relative mb-2">
                {/* Shadow layer for 3D effect */}
                <View className="absolute top-1 left-0.5 w-14 h-14 rounded-2xl bg-primary/20" />
                {/* Main button */}
                <View className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center shadow-lg border border-gray-100 dark:border-gray-700">
                    <FontAwesome name={icon} size={20} color="#E63946" />
                </View>
            </View>
            <Text
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center"
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}
