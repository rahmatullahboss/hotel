import { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
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
    payAtHotel?: boolean;
}

// Filter options - labels will be translated in component
const FILTER_KEYS = [
    { id: 'all', labelKey: 'allHotels.filters.all', icon: 'th-large' },
    { id: 'budget', labelKey: 'allHotels.filters.budget', icon: 'money', color: '#10B981' },
    { id: 'premium', labelKey: 'allHotels.filters.premium', icon: 'star', color: '#F59E0B' },
    { id: 'topRated', labelKey: 'allHotels.filters.topRated', icon: 'thumbs-up', color: '#3B82F6' },
];

// Sort options - labels will be translated in component
const SORT_KEYS = [
    { id: 'rating', labelKey: 'allHotels.sort.rating' },
    { id: 'priceLow', labelKey: 'allHotels.sort.priceLow' },
    { id: 'priceHigh', labelKey: 'allHotels.sort.priceHigh' },
];

const BUDGET_MAX = 3000;
const PREMIUM_MIN = 8000;

export default function AllHotelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    const fetchHotels = async () => {
        // Request higher limit to get all hotels
        const { data, error } = await api.getHotels({ limit: 100 });
        if (!error && data) {
            setAllHotels(data);
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

    // Apply filter and sort
    const filteredHotels = useMemo(() => {
        let result = [...allHotels];

        // Apply filter
        if (activeFilter === 'budget') {
            result = result.filter(h => (h.lowestPrice || 0) <= BUDGET_MAX);
        } else if (activeFilter === 'premium') {
            result = result.filter(h => (h.lowestPrice || 0) >= PREMIUM_MIN);
        } else if (activeFilter === 'topRated') {
            result = result.filter(h => parseFloat(String(h.rating)) >= 4.5);
        }

        // Apply sort
        if (sortBy === 'rating') {
            result.sort((a, b) => parseFloat(String(b.rating)) - parseFloat(String(a.rating)));
        } else if (sortBy === 'priceLow') {
            result.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
        } else if (sortBy === 'priceHigh') {
            result.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
        }

        return result;
    }, [allHotels, activeFilter, sortBy]);

    const renderFilters = () => (
        <View className="mb-4">
            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
            >
                {FILTER_KEYS.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        className={`flex-row items-center px-4 py-2 rounded-full gap-2 ${activeFilter === filter.id
                            ? 'bg-primary'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                        onPress={() => setActiveFilter(filter.id)}
                        style={activeFilter === filter.id ? {} : {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                        }}
                    >
                        <FontAwesome
                            name={filter.icon as any}
                            size={14}
                            color={activeFilter === filter.id ? '#fff' : (filter.color || '#6B7280')}
                        />
                        <Text
                            className={`text-sm font-semibold ${activeFilter === filter.id
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                            style={{ includeFontPadding: false }}
                        >
                            {t(filter.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <View className="flex-row items-center mt-3 flex-wrap gap-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">{t('allHotels.sort.label')}</Text>
                {SORT_KEYS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        className={`flex-row items-center px-3 py-1.5 rounded-lg ${sortBy === option.id
                            ? 'bg-gray-800 dark:bg-gray-200'
                            : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        onPress={() => setSortBy(option.id)}
                    >
                        <Text
                            className={`text-sm font-medium ${sortBy === option.id
                                ? 'text-white dark:text-gray-900'
                                : 'text-gray-600 dark:text-gray-300'
                                }`}
                            style={{ includeFontPadding: false }}
                        >
                            {t(option.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Results count */}
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {t(filteredHotels.length === 1 ? 'allHotels.hotelFound' : 'allHotels.hotelsFound', { count: filteredHotels.length })}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: t('allHotels.title'),
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
            ) : allHotels.length === 0 ? (
                <View className="flex-1 items-center justify-center p-5">
                    <FontAwesome name="building-o" size={50} color="#9CA3AF" />
                    <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
                        {t('home.noHotels')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHotels}
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
                    ListHeaderComponent={renderFilters}
                    ListEmptyComponent={
                        <View className="items-center py-12">
                            <FontAwesome name="search" size={40} color="#9CA3AF" />
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                                {t('allHotels.noMatch')}
                            </Text>
                            <TouchableOpacity
                                className="mt-4 px-4 py-2 bg-primary rounded-full"
                                onPress={() => setActiveFilter('all')}
                            >
                                <Text className="text-white font-semibold">{t('allHotels.clearFilters')}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}
