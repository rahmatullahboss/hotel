import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
// import * as Location from 'expo-location';
import HotelCard from '@/components/HotelCard';
import SearchFiltersModal, { FilterValues } from '@/components/SearchFiltersModal';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    latitude?: string;
    longitude?: string;
}

// City images - Real photos of Bangladeshi landmarks from Unsplash
const CITY_IMAGES: { [key: string]: string } = {
    'Dhaka': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400', // Lalbagh Fort, Dhaka
    'Chittagong': 'https://images.unsplash.com/photo-1590766940554-634f72d97d63?w=400', // Patenga Beach, Chittagong
    "Cox's Bazar": 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400', // Cox's Bazar sea beach
    'Sylhet': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400', // Sylhet tea gardens
    'Rajshahi': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', // Rajshahi heritage
    'Khulna': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', // Sundarbans, Khulna
    'Rangpur': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400', // Rangpur fields
    'Mymensingh': 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400', // Mymensingh countryside
};

const POPULAR_CITIES = [
    { name: 'Dhaka', hotels: 6 },
    { name: 'Chittagong', hotels: 4 },
    { name: "Cox's Bazar", hotels: 5 },
    { name: 'Sylhet', hotels: 4 },
    { name: 'Rajshahi', hotels: 3 },
    { name: 'Khulna', hotels: 3 },
    { name: 'Rangpur', hotels: 2 },
    { name: 'Mymensingh', hotels: 2 },
];

// Quick filter options
const QUICK_FILTERS = [
    { id: 'nearby', emoji: '📍', label: 'Near Me', color: '#10B981' },
    { id: 'budget', emoji: '💰', label: 'Budget', color: '#3B82F6' },
    { id: 'luxury', emoji: '⭐', label: 'Premium', color: '#F59E0B' },
    { id: 'couple', emoji: '💕', label: 'Couple', color: '#EC4899' },
];

// Price thresholds
const BUDGET_MAX = 3000;
const PREMIUM_MIN = 8000;

// Haversine distance formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function SearchScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t, i18n } = useTranslation();
    const { filter } = useLocalSearchParams<{ filter?: string }>();

    const [searchQuery, setSearchQuery] = useState('');
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(filter || null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState<FilterValues>({
        minPrice: 0,
        maxPrice: 20000,
        minRating: 0,
        payAtHotel: false,
        amenities: [],
    });

    // Fetch all hotels on mount
    useEffect(() => {
        const fetchHotels = async () => {
            const { data, error } = await api.getHotels();
            if (!error && data) {
                setAllHotels(data);
            }
            setLoading(false);
        };
        fetchHotels();
    }, []);

    // Apply filter when filter param changes
    useEffect(() => {
        if (filter && allHotels.length > 0) {
            handleFilter(filter);
        }
    }, [filter, allHotels]);

    // Search suggestions as you type
    useEffect(() => {
        if (searchQuery.length >= 1) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    // Get search suggestions (cities + hotels)
    const getSuggestions = useCallback(() => {
        if (searchQuery.length < 1) return [];

        const query = searchQuery.toLowerCase();
        const citySuggestions = POPULAR_CITIES
            .filter(c => c.name.toLowerCase().includes(query))
            .map(c => ({ type: 'city', name: c.name, count: c.hotels }));

        const hotelSuggestions = allHotels
            .filter(h => h.name.toLowerCase().includes(query))
            .slice(0, 3)
            .map(h => ({ type: 'hotel', name: h.name, id: h.id, city: h.city }));

        return [...citySuggestions, ...hotelSuggestions].slice(0, 6);
    }, [searchQuery, allHotels]);

    const handleCitySelect = (city: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push({
            pathname: '/search-results',
            params: { city },
        } as any);
    };

    const handleHotelSelect = (hotelId: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push(`/hotel/${hotelId}` as any);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.length >= 2) {
            setShowSuggestions(false);
            setSearching(true);
            const filtered = allHotels.filter((hotel) =>
                hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hotel.city.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHotels(filtered);
        }
    };

    const handleNearMe = async () => {
        router.push({ pathname: '/search-results', params: { nearby: 'true' } });
    };


    const handleFilter = async (filterId: string) => {
        if (filterId === 'nearby') {
            handleNearMe();
            return;
        }

        setActiveFilter(filterId);
        setSearching(true);

        let filtered: Hotel[] = [];

        if (filterId === 'budget') {
            filtered = allHotels.filter((hotel) => (hotel.lowestPrice || 0) <= BUDGET_MAX);
        } else if (filterId === 'luxury') {
            filtered = allHotels.filter((hotel) => (hotel.lowestPrice || 0) >= PREMIUM_MIN);
        } else if (filterId === 'couple') {
            filtered = allHotels.filter((hotel) => parseFloat(String(hotel.rating)) >= 4.5);
        }

        setFilteredHotels(filtered);
    };

    const handleAdvancedFiltersApply = async (filters: FilterValues) => {
        setAdvancedFilters(filters);
        setSearching(true);
        setLoading(true);

        try {
            const { data, error } = await api.getHotels({
                minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
                maxPrice: filters.maxPrice < 20000 ? filters.maxPrice : undefined,
                minRating: filters.minRating > 0 ? filters.minRating : undefined,
                amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
            });

            if (!error && data) {
                let filtered = data;
                if (filters.payAtHotel) {
                    filtered = filtered.filter((h: any) => h.payAtHotel === true);
                }
                setFilteredHotels(filtered);
            }
        } catch (err) {
            console.error('Filter error:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setActiveFilter(null);
        setSearching(false);
        setFilteredHotels([]);
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const suggestions = getSuggestions();

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header with Gradient Effect */}
            <View
                className="px-5 pb-8 bg-primary"
                style={{
                    paddingTop: insets.top + 10,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <Text className="text-2xl font-bold text-white">{t('search.title')}</Text>
                <Text className="text-sm text-white/80 mt-1">{t('search.subtitle')}</Text>

                {/* Search Bar */}
                <View className="mt-5">
                    <View
                        className="flex-row items-center px-4 py-3.5 rounded-2xl bg-white dark:bg-gray-800 gap-3"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            elevation: 5,
                        }}
                    >
                        <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                            <FontAwesome name="search" size={16} color="#E63946" />
                        </View>
                        <TextInput
                            className="flex-1 text-base text-gray-900 dark:text-white font-medium"
                            placeholder={t('search.placeholder')}
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} className="w-8 h-8 items-center justify-center">
                                <FontAwesome name="times-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <View className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
                            {suggestions.map((item, index) => (
                                <TouchableOpacity
                                    key={`${item.type}-${item.name}-${index}`}
                                    className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700"
                                    onPress={() => {
                                        if (item.type === 'city') {
                                            handleCitySelect(item.name);
                                        } else {
                                            handleHotelSelect((item as any).id);
                                        }
                                    }}
                                >
                                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                                        <FontAwesome
                                            name={item.type === 'city' ? 'map-marker' : 'building'}
                                            size={14}
                                            color="#E63946"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {item.type === 'city'
                                                ? `${(item as any).count} hotels`
                                                : (item as any).city}
                                        </Text>
                                    </View>
                                    <FontAwesome name="chevron-right" size={12} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Quick Filters */}
                <View className="px-5 mt-5">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                    >
                        {QUICK_FILTERS.map((filter) => (
                            <TouchableOpacity
                                key={filter.id}
                                className={`flex-row items-center px-4 py-2.5 rounded-full gap-2 ${activeFilter === filter.id
                                    ? 'bg-primary'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                                onPress={() => handleFilter(filter.id)}
                                style={activeFilter === filter.id ? {} : {
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 4,
                                }}
                            >
                                <Text className="text-base">{filter.emoji}</Text>
                                <Text
                                    className={`text-sm font-semibold ${activeFilter === filter.id
                                        ? 'text-white'
                                        : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    style={{ includeFontPadding: false }}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Clear Filter */}
                        {(searching || activeFilter) && (
                            <TouchableOpacity
                                className="flex-row items-center px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 gap-2"
                                onPress={clearSearch}
                            >
                                <FontAwesome name="times" size={14} color="#6B7280" />
                                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    Clear
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Advanced Filters Button */}
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 gap-2"
                            onPress={() => setShowFiltersModal(true)}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                            }}
                        >
                            <FontAwesome name="sliders" size={14} color="#E63946" />
                            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {t('filters.title', 'Filters')}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Search Results or Filter Results */}
                {searching ? (
                    <View className="px-5 mt-5">
                        {locationLoading ? (
                            <View className="items-center py-12">
                                <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                                    <ActivityIndicator size="large" color="#E63946" />
                                </View>
                                <Text className="text-gray-500 font-medium">Getting your location...</Text>
                            </View>
                        ) : loading ? (
                            <View className="items-center py-12">
                                <ActivityIndicator size="large" color="#E63946" />
                            </View>
                        ) : filteredHotels.length > 0 ? (
                            <>
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                        Results
                                    </Text>
                                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                                        <Text className="text-sm font-semibold text-primary">
                                            {filteredHotels.length} found
                                        </Text>
                                    </View>
                                </View>
                                {filteredHotels.map((hotel, index) => (
                                    <HotelCard key={hotel.id} hotel={hotel} index={index} />
                                ))}
                            </>
                        ) : (
                            <View className="items-center py-12">
                                <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                                    <FontAwesome name="search" size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                    No hotels found
                                </Text>
                                <Text className="text-sm text-gray-500 mt-1">
                                    Try adjusting your search or filters
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Popular Cities Grid */}
                        <View className="px-5 mt-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {t('search.popularDestinations')}
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {POPULAR_CITIES.slice(0, 6).map((city, index) => (
                                    <TouchableOpacity
                                        key={city.name}
                                        className="overflow-hidden rounded-2xl"
                                        style={{
                                            width: (width - 52) / 2,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 8,
                                        }}
                                        onPress={() => handleCitySelect(city.name)}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: CITY_IMAGES[city.name] }}
                                            style={{ width: '100%', height: 120 }}
                                            resizeMode="cover"
                                        />
                                        <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <View className="absolute bottom-0 left-0 right-0 p-3.5">
                                            <Text className="text-white font-bold text-base">
                                                {city.name}
                                            </Text>
                                            <Text className="text-white/80 text-xs mt-0.5">
                                                {city.hotels} hotels
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* View All Cities */}
                            <TouchableOpacity
                                className="mt-4 py-3 items-center bg-gray-100 dark:bg-gray-800 rounded-xl"
                                onPress={() => router.push('/hotels' as any)}
                            >
                                <Text className="text-sm font-semibold text-primary">
                                    View All Hotels →
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tips Section */}
                        <View className="px-5 mt-6 mb-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {t('search.tips', 'Search Tips')}
                            </Text>
                            <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl gap-3">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 items-center justify-center">
                                        <FontAwesome name="lightbulb-o" size={16} color="#3B82F6" />
                                    </View>
                                    <Text className="flex-1 text-sm text-blue-800 dark:text-blue-200">
                                        Use "Near Me" to find hotels closest to you
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 items-center justify-center">
                                        <FontAwesome name="filter" size={14} color="#3B82F6" />
                                    </View>
                                    <Text className="flex-1 text-sm text-blue-800 dark:text-blue-200">
                                        Filter by Budget (≤৳3,000) or Premium (≥৳8,000)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                <View className="h-5" />
            </ScrollView>

            {/* Filters Modal */}
            <SearchFiltersModal
                visible={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApply={handleAdvancedFiltersApply}
                initialFilters={advancedFilters}
            />
        </View>
    );
}
