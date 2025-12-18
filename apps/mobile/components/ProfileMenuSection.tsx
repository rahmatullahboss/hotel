import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface ProfileMenuItem {
    icon: keyof typeof FontAwesome.glyphMap;
    label: string;
    onPress: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
}

interface ProfileMenuSectionProps {
    title?: string;
    items: ProfileMenuItem[];
}

/**
 * Grouped menu section component with optional title.
 * Renders a card with multiple menu items separated by subtle borders.
 */
export function ProfileMenuSection({ title, items }: ProfileMenuSectionProps) {
    return (
        <View className="mx-5 mt-4">
            {/* Section Title */}
            {title && (
                <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 ml-1">
                    {title}
                </Text>
            )}

            {/* Menu Card */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={item.label}
                        className={`flex-row items-center px-4 py-3.5 ${index < items.length - 1
                                ? 'border-b border-gray-100 dark:border-gray-700'
                                : ''
                            }`}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        {/* Icon Container */}
                        <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-3">
                            <FontAwesome name={item.icon} size={18} color="#E63946" />
                        </View>

                        {/* Label */}
                        <Text className="flex-1 text-base font-medium text-gray-900 dark:text-white">
                            {item.label}
                        </Text>

                        {/* Right Element or Chevron */}
                        {item.rightElement ? (
                            item.rightElement
                        ) : item.showChevron !== false ? (
                            <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
