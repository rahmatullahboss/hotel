import { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '@/lib/api';
import HotelCard from '@/components/HotelCard';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
}

export default function SearchResultsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { city, query } = useLocalSearchParams<{ city?: string; query?: string }>();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHotels = async () => {
        // Pass city to API for proper server-side filtering
        const { data, error } = await api.getHotels({ city: city || undefined });
        if (!error && data) {
            // Additional client-side filtering if needed
            if (query && !city) {
                const filtered = data.filter((hotel: Hotel) =>
                    hotel.name.toLowerCase().includes(query.toLowerCase()) ||
                    hotel.city.toLowerCase().includes(query.toLowerCase())
                );
                setHotels(filtered);
            } else {
                setHotels(data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHotels();
    }, [city, query]);

    const title = city || query || 'Hotels';

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: `Hotels in ${title}`,
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            ) : hotels.length === 0 ? (
                <View className="flex-1 items-center justify-center p-5">
                    <FontAwesome name="search" size={50} color="#9CA3AF" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                        No hotels found
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Try searching for a different location
                    </Text>
                    <TouchableOpacity
                        className="mt-6 bg-primary px-6 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={hotels}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <HotelCard hotel={item} index={index} />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found in {title}
                        </Text>
                    }
                />
            )}
        </View>
    );
}
