import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Location from 'expo-location';
import api from '@/lib/api';
import HotelCard from '@/components/HotelCard';
import HotelListWithFilters from '@/components/HotelListWithFilters';

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
}

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

export default function SearchResultsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { city, query, nearby } = useLocalSearchParams<{ city?: string; query?: string; nearby?: string }>();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    const fetchHotels = async () => {
        try {
            // Handle nearby search
            if (nearby === 'true') {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationError('Location permission denied');
                    setLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                const { data, error } = await api.getHotels();
                if (!error && data) {
                    // Calculate distance for each hotel and sort by distance
                    const hotelsWithDistance = data
                        .filter((hotel: Hotel) => hotel.latitude && hotel.longitude)
                        .map((hotel: Hotel) => ({
                            ...hotel,
                            distance: getDistance(
                                latitude,
                                longitude,
                                parseFloat(hotel.latitude!),
                                parseFloat(hotel.longitude!)
                            ),
                        }))
                        .sort((a: Hotel, b: Hotel) => (a.distance || 0) - (b.distance || 0));

                    setHotels(hotelsWithDistance);
                }
            } else {
                // Normal city/query search
                const { data, error } = await api.getHotels({ city: city || undefined });
                if (!error && data) {
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
            }
        } catch (error) {
            console.error('Error fetching hotels:', error);
            setLocationError('Failed to get location');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHotels();
    }, [city, query, nearby]);

    const title = nearby === 'true' ? 'Near You' : city || query || 'Hotels';

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: nearby === 'true' ? 'Hotels Near You' : `Hotels in ${title}`,
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                    {nearby === 'true' && (
                        <Text className="text-sm text-gray-500 mt-3">Getting your location...</Text>
                    )}
                </View>
            ) : locationError ? (
                <View className="flex-1 items-center justify-center p-5">
                    <FontAwesome name="map-marker" size={50} color="#9CA3AF" />
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                        Location Access Needed
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                        {locationError}. Please enable location access to find nearby hotels.
                    </Text>
                    <TouchableOpacity
                        className="mt-6 bg-primary px-6 py-3 rounded-full"
                        onPress={() => router.back()}
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <HotelListWithFilters
                    hotels={hotels}
                    ListHeaderComponent={
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} {nearby === 'true' ? 'near you' : `found in ${title}`}
                        </Text>
                    }
                    noResultsMessage={nearby === 'true' ? 'No hotels with location data available' : 'Try searching for a different location'}
                />
            )}
        </View>
    );
}

