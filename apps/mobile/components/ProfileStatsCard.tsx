import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface StatItem {
    icon: 'suitcase' | 'credit-card' | 'star';
    value: string | number;
    label: string;
    onPress?: () => void;
}

interface ProfileStatsCardProps {
    stats: StatItem[];
}

/**
 * Horizontal stats card displaying key user metrics.
 * Shows bookings count, wallet balance, and loyalty points.
 */
export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
    return (
        <View className="mx-5 -mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <View className="flex-row py-5">
                {stats.map((stat, index) => (
                    <React.Fragment key={stat.label}>
                        <TouchableOpacity
                            className="flex-1 items-center"
                            onPress={stat.onPress}
                            activeOpacity={stat.onPress ? 0.7 : 1}
                        >
                            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-2">
                                <FontAwesome name={stat.icon} size={18} color="#E63946" />
                            </View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </Text>
                            <Text
                                className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center px-1"
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {stat.label}
                            </Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        {index < stats.length - 1 && (
                            <View className="w-px h-16 bg-gray-200 dark:bg-gray-700 self-center" />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );
}
