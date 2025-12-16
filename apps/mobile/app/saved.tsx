import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '@/lib/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface SavedHotelItem {
    id: string;
    hotelId: string;
    savedAt: string;
    hotel: {
        id: string;
        name: string;
        city: string;
        coverImage: string | null;
        rating: number | null;
        reviewCount: number;
        lowestDynamicPrice: number | null;
    };
}

export default function SavedHotelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [savedHotels, setSavedHotels] = useState<SavedHotelItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedHotels = useCallback(async () => {
        const { data, error } = await api.getSavedHotels();
        if (data) {
            setSavedHotels(data.savedHotels);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSavedHotels();
        }, [fetchSavedHotels])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedHotels();
    };

    const handleUnsave = async (hotelId: string) => {
        await api.unsaveHotel(hotelId);
        setSavedHotels((prev) => prev.filter((item) => item.hotelId !== hotelId));
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-gray-900">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: t('saved.title'),
                        headerStyle: { backgroundColor: '#E63946' },
                        headerTintColor: '#fff',
                    }}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('saved.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
                }
            >
                {savedHotels.length > 0 ? (
                    <View className="flex-row flex-wrap justify-between">
                        {savedHotels.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="rounded-xl mb-4 overflow-hidden bg-white dark:bg-gray-800 shadow-md"
                                style={{ width: CARD_WIDTH }}
                                onPress={() => router.push(`/hotel/${item.hotelId}`)}
                                activeOpacity={0.8}
                            >
                                <View className="relative">
                                    {item.hotel.coverImage ? (
                                        <Image
                                            source={{ uri: item.hotel.coverImage }}
                                            className="w-full h-28"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-28 items-center justify-center bg-gray-200 dark:bg-gray-700">
                                            <FontAwesome name="building-o" size={32} color="#9CA3AF" />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
                                        onPress={() => handleUnsave(item.hotelId)}
                                    >
                                        <FontAwesome name="heart" size={16} color="#E63946" />
                                    </TouchableOpacity>
                                </View>
                                <View className="p-3">
                                    <Text
                                        className="text-sm font-semibold text-gray-900 dark:text-white mb-1"
                                        numberOfLines={2}
                                    >
                                        {item.hotel.name}
                                    </Text>
                                    <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                        {item.hotel.city}
                                    </Text>
                                    {item.hotel.rating && (
                                        <View className="flex-row items-center mb-1.5">
                                            <Text className="text-xs font-semibold">⭐ {item.hotel.rating.toFixed(1)}</Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                ({item.hotel.reviewCount})
                                            </Text>
                                        </View>
                                    )}
                                    {item.hotel.lowestDynamicPrice && (
                                        <Text className="text-sm font-bold text-primary">
                                            {t('common.currency')}{item.hotel.lowestDynamicPrice.toLocaleString()}
                                            <Text className="text-xs font-normal">{t('common.perNight')}</Text>
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="items-center justify-center py-20">
                        <FontAwesome name="heart-o" size={64} color="#9CA3AF" />
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                            {t('saved.noSavedHotels')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center px-10">
                            {t('saved.emptyDescription')}
                        </Text>
                        <TouchableOpacity
                            className="mt-6 bg-primary px-6 py-3 rounded-full"
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text className="text-white font-semibold text-sm">
                                {t('saved.exploreHotels')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
