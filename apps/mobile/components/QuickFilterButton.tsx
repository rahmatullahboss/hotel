import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface QuickFilterButtonProps {
    id: string;
    label: string;
    icon: 'location-arrow' | 'tag' | 'star' | 'heart';
    index: number;
    onPress: () => void;
}

export default function QuickFilterButton({
    label,
    icon,
    onPress,
}: QuickFilterButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="items-center flex-1"
        >
            <View className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mb-2 border border-gray-100 dark:border-gray-700">
                <FontAwesome name={icon} size={20} color="#E63946" />
            </View>
            <Text
                className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center"
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
