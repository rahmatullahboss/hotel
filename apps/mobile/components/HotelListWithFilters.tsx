import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import HotelCard from '@/components/HotelCard';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    latitude?: string;
    longitude?: string;
    distance?: number;
    payAtHotel?: boolean;
}

interface HotelListWithFiltersProps {
    hotels: Hotel[];
    loading?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    ListHeaderComponent?: React.ReactElement;
    noResultsMessage?: string;
    defaultSortBy?: 'rating' | 'priceLow' | 'priceHigh' | 'distance';
}

// Filter options
const FILTER_KEYS = [
    { id: 'all', labelKey: 'allHotels.filters.all', icon: 'th-large' },
    { id: 'budget', labelKey: 'allHotels.filters.budget', icon: 'money', color: '#10B981' },
    { id: 'premium', labelKey: 'allHotels.filters.premium', icon: 'star', color: '#F59E0B' },
    { id: 'topRated', labelKey: 'allHotels.filters.topRated', icon: 'thumbs-up', color: '#3B82F6' },
];

// Sort options (distance is added dynamically when applicable)
const BASE_SORT_KEYS = [
    { id: 'rating', labelKey: 'allHotels.sort.rating' },
    { id: 'priceLow', labelKey: 'allHotels.sort.priceLow' },
    { id: 'priceHigh', labelKey: 'allHotels.sort.priceHigh' },
];

const DISTANCE_SORT_KEY = { id: 'distance', labelKey: 'allHotels.sort.distance' };

const BUDGET_MAX = 3000;
const PREMIUM_MIN = 8000;

export default function HotelListWithFilters({
    hotels,
    loading = false,
    refreshing = false,
    onRefresh,
    ListHeaderComponent,
    noResultsMessage,
    defaultSortBy
}: HotelListWithFiltersProps) {
    const { t } = useTranslation();
    const [activeFilter, setActiveFilter] = useState('all');

    // Check if hotels have distance data (from nearby search)
    const hasDistanceData = hotels.some(h => h.distance !== undefined);

    // Determine initial sort: use defaultSortBy if provided, otherwise use distance if available, else rating
    const initialSortBy = defaultSortBy || (hasDistanceData ? 'distance' : 'rating');
    const [sortBy, setSortBy] = useState(initialSortBy);

    // Build sort keys - include distance only when hotels have distance data
    const SORT_KEYS = hasDistanceData
        ? [DISTANCE_SORT_KEY, ...BASE_SORT_KEYS]
        : BASE_SORT_KEYS;

    // Apply filter and sort
    const filteredHotels = useMemo(() => {
        let result = [...hotels];

        // Apply filter
        if (activeFilter === 'budget') {
            result = result.filter(h => (h.lowestPrice || 0) <= BUDGET_MAX);
        } else if (activeFilter === 'premium') {
            result = result.filter(h => (h.lowestPrice || 0) >= PREMIUM_MIN);
        } else if (activeFilter === 'topRated') {
            result = result.filter(h => parseFloat(String(h.rating)) >= 4.5);
        }

        // Apply sort
        if (sortBy === 'distance') {
            // Sort by distance (nearest first)
            result.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        } else if (sortBy === 'rating') {
            result.sort((a, b) => parseFloat(String(b.rating)) - parseFloat(String(a.rating)));
        } else if (sortBy === 'priceLow') {
            result.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
        } else if (sortBy === 'priceHigh') {
            result.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
        }

        return result;
    }, [hotels, activeFilter, sortBy]);

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
                        className={`flex-row items-center px-4 py-3 rounded-full gap-2 ${activeFilter === filter.id
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
                            style={{ lineHeight: 22, textAlignVertical: 'center' }}
                        >
                            {t(filter.labelKey)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <View className="flex-row items-center mt-3">
                <Text
                    className="text-sm text-gray-500 dark:text-gray-400 mr-2"
                    style={{ lineHeight: 22 }}
                >
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
                            onPress={() => setSortBy(option.id as 'rating' | 'priceLow' | 'priceHigh' | 'distance')}
                            className={`px-4 py-3 rounded-full border ${sortBy === option.id
                                ? 'bg-primary border-primary'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }`}
                        >
                            <Text
                                className={`text-sm font-medium ${sortBy === option.id
                                    ? 'text-white'
                                    : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                style={{ lineHeight: 22 }}
                            >
                                {t(option.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Results count */}
            <Text
                className="text-sm text-gray-500 dark:text-gray-400 mt-3"
                style={{ lineHeight: 22, textAlignVertical: 'center' }}
            >
                {t(filteredHotels.length === 1 ? 'allHotels.hotelFound' : 'allHotels.hotelsFound', { count: filteredHotels.length })}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#E63946" />
                <Text className="mt-3 text-base text-gray-500 dark:text-gray-400">
                    {t('home.loading')}
                </Text>
            </View>
        );
    }

    if (hotels.length === 0) {
        return (
            <View className="flex-1 items-center justify-center p-5">
                <FontAwesome name="building-o" size={50} color="#9CA3AF" />
                <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
                    {noResultsMessage || t('home.noHotels')}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={filteredHotels}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
                <HotelCard
                    hotel={item}
                    index={index}
                    distance={item.distance}
                />
            )}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#E63946"
                    />
                ) : undefined
            }
            ListHeaderComponent={
                <View>
                    {ListHeaderComponent}
                    {renderFilters()}
                </View>
            }
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
    );
}
