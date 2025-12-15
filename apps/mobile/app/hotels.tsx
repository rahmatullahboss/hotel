import { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
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

export default function AllHotelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHotels = async () => {
        const { data, error } = await api.getHotels();
        if (!error && data) {
            setHotels(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHotels();
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: t('home.topRated'),
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                    <Text className="mt-3 text-base text-gray-500 dark:text-gray-400">
                        {t('home.loading')}
                    </Text>
                </View>
            ) : hotels.length === 0 ? (
                <View className="flex-1 items-center justify-center p-5">
                    <FontAwesome name="building-o" size={50} color="#9CA3AF" />
                    <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
                        {t('home.noHotels')}
                    </Text>
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
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#E63946"
                        />
                    }
                    ListHeaderComponent={
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {hotels.length} hotels found
                        </Text>
                    }
                />
            )}
        </View>
    );
}
