import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    FadeIn,
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
        scale.value = withSpring(0.92, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    return (
        <AnimatedPressable
            entering={FadeIn.delay(index * 40).duration(200)}
            style={animatedStyle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            className="items-center flex-1"
        >
            {/* Button Container */}
            <View
                className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mb-2.5 border border-gray-100 dark:border-gray-700"
                style={{
                    shadowColor: '#E63946',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 6,
                }}
            >
                {/* Icon Circle */}
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                    <FontAwesome name={icon} size={18} color="#E63946" />
                </View>
            </View>
            <Text
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight"
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}
