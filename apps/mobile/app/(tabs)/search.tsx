import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import CityCard from '@/components/CityCard';
import HotelCard from '@/components/HotelCard';
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

const POPULAR_CITIES = [
    { name: 'Dhaka', image: '🏙️', hotels: '6' },
    { name: 'Chittagong', image: '⛵', hotels: '4' },
    { name: "Cox's Bazar", image: '🏖️', hotels: '5' },
    { name: 'Sylhet', image: '🌿', hotels: '4' },
    { name: 'Rajshahi', image: '🏛️', hotels: '3' },
    { name: 'Khulna', image: '🌊', hotels: '3' },
];

// Price thresholds for filters
const BUDGET_MAX = 3000;
const PREMIUM_MIN = 8000;

// Calculate distance between two coordinates (Haversine formula)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
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
    const { t } = useTranslation();
    const { filter } = useLocalSearchParams<{ filter?: string }>();

    const [searchQuery, setSearchQuery] = useState('');
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(filter || null);
    const [locationLoading, setLocationLoading] = useState(false);

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

    // Search as you type
    useEffect(() => {
        if (searchQuery.length >= 2) {
            setSearching(true);
            const filtered = allHotels.filter((hotel) =>
                hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hotel.city.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredHotels(filtered);
        } else if (!activeFilter) {
            setSearching(false);
            setFilteredHotels([]);
        }
    }, [searchQuery, allHotels]);

    const handleCitySelect = (city: string) => {
        router.push({
            pathname: '/search-results',
            params: { city },
        } as any);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.length >= 2) {
            router.push({
                pathname: '/search-results',
                params: { query: searchQuery },
            } as any);
        }
    };

    const handleNearMe = async () => {
        setActiveFilter('nearby');
        setSearching(true);
        setLocationLoading(true);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location access to find hotels near you.',
                    [{ text: 'OK' }]
                );
                // Fallback to showing Dhaka hotels
                const dhakaHotels = allHotels.filter((h) => h.city === 'Dhaka');
                setFilteredHotels(dhakaHotels);
                setLocationLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const userLat = location.coords.latitude;
            const userLng = location.coords.longitude;

            // Sort hotels by distance
            const hotelsWithDistance = allHotels
                .map((hotel) => {
                    const hotelLat = parseFloat(hotel.latitude || '0');
                    const hotelLng = parseFloat(hotel.longitude || '0');
                    const distance = getDistance(userLat, userLng, hotelLat, hotelLng);
                    return { ...hotel, distance };
                })
                .sort((a, b) => a.distance - b.distance);

            setFilteredHotels(hotelsWithDistance.slice(0, 10));
        } catch (error: any) {
            console.log('Location error:', error.message);
            // Fallback to Dhaka
            const dhakaHotels = allHotels.filter((h) => h.city === 'Dhaka');
            setFilteredHotels(dhakaHotels);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleFilter = async (filterId: string) => {
        if (filterId === 'nearby') {
            await handleNearMe();
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

    const clearFilter = () => {
        setActiveFilter(null);
        setSearching(false);
        setFilteredHotels([]);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View
                className="px-5 pb-5 bg-primary rounded-b-3xl"
                style={{ paddingTop: insets.top + 10 }}
            >
                <Text className="text-2xl font-bold text-white">{t('search.title')}</Text>
                <Text className="text-sm text-white/80 mt-1">{t('search.subtitle')}</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="px-5 -mt-7">
                    <View className="flex-row items-center px-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 gap-3 shadow-lg">
                        <FontAwesome name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-base text-gray-900 dark:text-white"
                            placeholder={t('search.placeholder')}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <FontAwesome name="times-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Active Filter Badge */}
                {activeFilter && (
                    <View className="px-5 mt-4">
                        <View className="flex-row items-center">
                            <View className="flex-row items-center bg-primary/10 px-4 py-2 rounded-full gap-2">
                                <Text className="text-primary font-semibold">
                                    {activeFilter === 'nearby' && '📍 Near Me'}
                                    {activeFilter === 'budget' && '💰 Budget (≤৳3,000)'}
                                    {activeFilter === 'luxury' && '⭐ Premium (≥৳8,000)'}
                                    {activeFilter === 'couple' && '❤️ Couple Friendly'}
                                </Text>
                                <TouchableOpacity onPress={clearFilter}>
                                    <FontAwesome name="times" size={14} color="#E63946" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                {/* Search Results or Filter Results */}
                {searching ? (
                    <View className="px-5 mt-4">
                        {locationLoading ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#E63946" />
                                <Text className="text-gray-500 mt-3">Getting your location...</Text>
                            </View>
                        ) : loading ? (
                            <View className="items-center py-8">
                                <ActivityIndicator size="large" color="#E63946" />
                            </View>
                        ) : filteredHotels.length > 0 ? (
                            <>
                                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
                                </Text>
                                {filteredHotels.map((hotel, index) => (
                                    <HotelCard key={hotel.id} hotel={hotel} index={index} />
                                ))}
                            </>
                        ) : (
                            <View className="items-center py-8">
                                <FontAwesome name="search" size={40} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No hotels found</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <>
                        {/* Popular Cities */}
                        <View className="px-5 mt-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {t('search.popularDestinations')}
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {POPULAR_CITIES.map((city, index) => (
                                    <CityCard
                                        key={city.name}
                                        name={city.name}
                                        image={city.image}
                                        hotels={city.hotels}
                                        index={index}
                                        onPress={() => handleCitySelect(city.name)}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Recent Searches */}
                        <View className="px-5 mt-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {t('search.recentSearches')}
                            </Text>
                            <View className="p-8 rounded-xl bg-gray-100 dark:bg-gray-800 items-center gap-2">
                                <FontAwesome name="history" size={24} color="#9CA3AF" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('search.recentEmpty')}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
