import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileHeaderProps {
    user: {
        name: string;
        email: string;
        image?: string;
    } | null;
    membershipTier?: string;
    onSignIn?: () => void;
    onEditProfile?: () => void;
    t: (key: string) => string;
}

/**
 * Premium profile header component with gradient background and glassmorphic card.
 * Displays user avatar, name, email, and membership tier.
 */
export function ProfileHeader({
    user,
    membershipTier = 'Member',
    onSignIn,
    onEditProfile,
    t,
}: ProfileHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View className="relative">
            {/* Gradient Background */}
            <LinearGradient
                colors={['#E63946', '#C1121F', '#A4161A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="absolute inset-0"
                style={{ height: 220 + insets.top }}
            />

            {/* Content */}
            <View style={{ paddingTop: insets.top + 20, paddingBottom: 60 }}>
                {user ? (
                    <View className="items-center px-6">
                        {/* Avatar with ring */}
                        <TouchableOpacity
                            onPress={onEditProfile}
                            activeOpacity={0.9}
                            className="relative mb-4"
                        >
                            <View className="w-[100px] h-[100px] rounded-full bg-white/20 items-center justify-center p-1">
                                {user.image ? (
                                    <Image
                                        source={{ uri: user.image }}
                                        className="w-[92px] h-[92px] rounded-full"
                                        style={{ width: 92, height: 92 }}
                                    />
                                ) : (
                                    <View className="w-[92px] h-[92px] rounded-full bg-white/30 items-center justify-center">
                                        <Text className="text-4xl font-bold text-white">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {/* Edit badge */}
                            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white items-center justify-center shadow-md">
                                <FontAwesome name="pencil" size={14} color="#E63946" />
                            </View>
                        </TouchableOpacity>

                        {/* User Info */}
                        <Text className="text-2xl font-bold text-white tracking-tight mb-1">
                            {user.name}
                        </Text>
                        <Text className="text-sm text-white/80 mb-3">
                            {user.email}
                        </Text>

                        {/* Membership Badge */}
                        <View className="flex-row items-center bg-white/20 px-4 py-1.5 rounded-full">
                            <FontAwesome name="star" size={12} color="#FFD700" />
                            <Text className="text-white text-xs font-semibold ml-1.5">
                                {membershipTier}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View className="items-center px-6">
                        {/* Guest Avatar */}
                        <View className="w-[100px] h-[100px] rounded-full bg-white/20 items-center justify-center p-1 mb-4">
                            <View className="w-[92px] h-[92px] rounded-full bg-white/30 items-center justify-center">
                                <FontAwesome name="user" size={40} color="#fff" />
                            </View>
                        </View>

                        <Text className="text-2xl font-bold text-white mb-4">
                            {t('profile.guest')}
                        </Text>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            className="bg-white px-8 py-3 rounded-full shadow-lg"
                            onPress={onSignIn}
                            activeOpacity={0.9}
                        >
                            <Text className="text-primary font-semibold text-sm">
                                {t('profile.signIn')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}
