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

// Modern icon configuration with gradients and colors
const ICON_CONFIG: Record<string, { icon: string; bgColor: string; iconColor: string }> = {
    'location-arrow': {
        icon: 'map-marker',
        bgColor: '#EFF6FF',
        iconColor: '#3B82F6',
    },
    'tag': {
        icon: 'tag',
        bgColor: '#ECFDF5',
        iconColor: '#10B981',
    },
    'star': {
        icon: 'diamond',
        bgColor: '#FEF3C7',
        iconColor: '#F59E0B',
    },
    'heart': {
        icon: 'heart',
        bgColor: '#FDF2F8',
        iconColor: '#EC4899',
    },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function QuickFilterButton({
    label,
    icon,
    onPress,
}: QuickFilterButtonProps) {
    const config = ICON_CONFIG[icon] || {
        icon: 'building',
        bgColor: '#FEF2F2',
        iconColor: '#E63946',
    };

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
            {/* Modern Icon Container */}
            <View
                className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                style={{
                    backgroundColor: config.bgColor,
                    shadowColor: config.iconColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <FontAwesome
                    name={config.icon as any}
                    size={22}
                    color={config.iconColor}
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
