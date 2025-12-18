import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    TouchableOpacity,
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

const PAGE_SIZE = 10;

// Filter options
const FILTER_KEYS = [
    { id: 'all', labelKey: 'allHotels.filters.all', icon: 'th-large' },
    { id: 'budget', labelKey: 'allHotels.filters.budget', icon: 'money', color: '#10B981' },
    { id: 'premium', labelKey: 'allHotels.filters.premium', icon: 'star', color: '#F59E0B' },
    { id: 'topRated', labelKey: 'allHotels.filters.topRated', icon: 'thumbs-up', color: '#3B82F6' },
];

// Sort options
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
    const [displayedHotels, setDisplayedHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'rating' | 'priceLow' | 'priceHigh'>('rating');

    // Fetch all hotels once
    const fetchHotels = useCallback(async () => {
        const { data, error } = await api.getHotels({ limit: 500 });
        if (!error && data) {
            setAllHotels(data);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    // Filter and sort hotels
    const getFilteredSortedHotels = useCallback(() => {
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

    // Update displayed hotels when filter/sort changes or on initial load
    useEffect(() => {
        const filtered = getFilteredSortedHotels();
        const initial = filtered.slice(0, PAGE_SIZE);
        setDisplayedHotels(initial);
        setPage(1);
        setHasMore(filtered.length > PAGE_SIZE);
    }, [allHotels, activeFilter, sortBy, getFilteredSortedHotels]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchHotels();
    };

    const loadMore = () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        const filtered = getFilteredSortedHotels();
        const nextPage = page + 1;
        const startIndex = page * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const nextBatch = filtered.slice(startIndex, endIndex);

        if (nextBatch.length > 0) {
            setDisplayedHotels(prev => [...prev, ...nextBatch]);
            setPage(nextPage);
            setHasMore(endIndex < filtered.length);
        } else {
            setHasMore(false);
        }
        setLoadingMore(false);
    };

    const renderFilters = () => (
        <View className="mb-4 px-4">
            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
            >
                {FILTER_KEYS.map((filter) => (
                    <TouchableOpacity
                        key={filter.id}
                        className={`flex-row items-center rounded-full gap-2 ${activeFilter === filter.id
                            ? 'bg-primary'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                            }`}
                        onPress={() => setActiveFilter(filter.id)}
                        style={{
                            paddingHorizontal: 24,
                            paddingVertical: 8,
                        }}
                    >
                        <FontAwesome
                            name={filter.icon as any}
                            size={14}
                            color={activeFilter === filter.id ? '#fff' : (filter.color || '#6B7280')}
                        />
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '600',
                                color: activeFilter === filter.id ? '#fff' : '#374151',
                                flexShrink: 0,
                            }}
                        >
                            {t(filter.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <View className="flex-row items-center mt-3">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {t('allHotels.sort.label')}
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                >
                    {SORT_KEYS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => setSortBy(option.id as 'rating' | 'priceLow' | 'priceHigh')}
                            className={`rounded-full border ${sortBy === option.id
                                ? 'bg-primary border-primary'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                            style={{
                                paddingHorizontal: 24,
                                paddingVertical: 6,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: sortBy === option.id ? '#fff' : '#4B5563',
                                    flexShrink: 0,
                                }}
                            >
                                {t(option.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results count */}
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                {t(getFilteredSortedHotels().length === 1 ? 'allHotels.hotelFound' : 'allHotels.hotelsFound', { count: getFilteredSortedHotels().length })}
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#E63946" />
                <Text className="text-sm text-gray-500 mt-2">{t('common.loadingMore', 'Loading more...')}</Text>
            </View>
        );
    };

    if (loading) {
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
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                    <Text className="mt-3 text-base text-gray-500 dark:text-gray-400">
                        {t('home.loading')}
                    </Text>
                </View>
            </View>
        );
    }

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

            <FlatList
                data={displayedHotels}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View className="px-4">
                        <HotelCard hotel={item} index={index} />
                    </View>
                )}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#E63946"
                    />
                }
                ListHeaderComponent={renderFilters()}
                ListFooterComponent={renderFooter()}
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
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
            />
        </View>
    );
}
