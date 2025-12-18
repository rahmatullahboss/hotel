import { View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface QuickFilterButtonProps {
    id: string;
    label: string;
    icon: 'location-arrow' | 'tag' | 'star' | 'heart';
    index: number;
    onPress: () => void;
}

const ACCENT_COLOR = '#E63946';

// Icon configuration matching hotel details amenity style
const ICON_CONFIG: Record<string, { icon: string }> = {
    'location-arrow': { icon: 'map-marker' },
    'tag': { icon: 'tag' },
    'star': { icon: 'diamond' },
    'heart': { icon: 'heart' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function QuickFilterButton({
    label,
    icon,
    onPress,
}: QuickFilterButtonProps) {
    const config = ICON_CONFIG[icon] || { icon: 'building' };

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={animatedStyle}
            className="items-center flex-1"
        >
            {/* Icon Container - matching hotel details amenity style */}
            <View
                className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                style={{
                    backgroundColor: '#F8F9FA',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <FontAwesome
                    name={config.icon as any}
                    size={22}
                    color={ACCENT_COLOR}
                />
            </View>
            {/* Label */}
            <Text
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center"
                numberOfLines={1}
                style={{
                    fontSize: 11,
                    letterSpacing: 0.2,
                }}
            >
                {label}
            </Text>
        </AnimatedPressable>
    );
}
