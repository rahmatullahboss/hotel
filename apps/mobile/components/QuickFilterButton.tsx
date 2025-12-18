import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface QuickFilterButtonProps {
    id: string;
    label: string;
    icon: 'location-arrow' | 'tag' | 'star' | 'heart';
    index: number;
    onPress: () => void;
}

// Icon configuration for each filter type
const ICON_CONFIG = {
    'location-arrow': { emoji: '📍', color: '#3B82F6' },
    'tag': { emoji: '💰', color: '#10B981' },
    'star': { emoji: '⭐', color: '#F59E0B' },
    'heart': { emoji: '💕', color: '#EC4899' },
};

export default function QuickFilterButton({
    label,
    icon,
    onPress,
}: QuickFilterButtonProps) {
    const config = ICON_CONFIG[icon] || { emoji: '🏨', color: '#E63946' };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="items-center flex-1"
        >
            {/* Icon Container with soft shadow */}
            <View
                className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mb-2"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <Text className="text-2xl">{config.emoji}</Text>
            </View>
            {/* Label */}
            <Text
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center"
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
