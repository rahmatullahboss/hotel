import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import HotelCard from '@/components/HotelCard';
import QuickFilterButton from '@/components/QuickFilterButton';
import SearchBar from '@/components/SearchBar';
import DateSelectionBar from '@/components/DateSelectionBar';
import { useBookingDates } from '@/contexts/BookingDatesContext';

const { width } = Dimensions.get('window');

interface Hotel {
  id: string;
  name: string;
  city: string;
  location?: string;
  rating: string | number;
  imageUrl: string;
  lowestPrice?: number;
}

interface City {
  id: string;
  name: string;
  slug: string;
  coverImage?: string;
  hotelCount?: number;
}

// City images - Bangladesh iconic landmarks
const CITY_IMAGES: Record<string, string> = {
  'Dhaka': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
  'Chittagong': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
  "Cox's Bazar": 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  'Sylhet': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  'Rajshahi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'Khulna': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { checkIn, checkOut, setDates } = useBookingDates();

  const QUICK_FILTERS = [
    { id: 'nearby', label: t('home.filters.nearMe'), icon: 'location-arrow' as const },
    { id: 'budget', label: t('home.filters.budget'), icon: 'tag' as const },
    { id: 'luxury', label: t('home.filters.premium'), icon: 'star' as const },
    { id: 'couple', label: t('home.filters.couple'), icon: 'heart' as const },
  ];

  // Dummy hotels for testing
  const DUMMY_HOTELS: Hotel[] = [
    { id: '1', name: 'Pan Pacific Sonargaon', city: 'Dhaka', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', lowestPrice: 8500 },
    { id: '2', name: 'Radisson Blu Chittagong', city: 'Chittagong', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', lowestPrice: 7200 },
    { id: '3', name: "Cox's Ocean Paradise", city: "Cox's Bazar", rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', lowestPrice: 5500 },
    { id: '4', name: 'Grand Sylhet Resort', city: 'Sylhet', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', lowestPrice: 4800 },
  ];

  // Dummy cities for fallback
  const DUMMY_CITIES: City[] = [
    { id: '1', name: 'Dhaka', slug: 'dhaka', hotelCount: 45 },
    { id: '2', name: 'Chittagong', slug: 'chittagong', hotelCount: 28 },
    { id: '3', name: "Cox's Bazar", slug: 'coxs-bazar', hotelCount: 52 },
    { id: '4', name: 'Sylhet', slug: 'sylhet', hotelCount: 18 },
  ];

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    // Fetch ALL hotels to count by city (use high limit)
    const { data: allHotelsData } = await api.getHotels({ limit: 500 });
    const { data: hotelsData, error: hotelsError } = await api.getHotels();

    if (!hotelsError && hotelsData && hotelsData.length > 0) {
      setHotels(hotelsData);
    } else {
      setHotels(DUMMY_HOTELS);
    }

    // Count ALL hotels by city (case-insensitive)
    const cityHotelCounts: Record<string, number> = {};
    const hotelsToCount = allHotelsData || hotelsData || DUMMY_HOTELS;
    hotelsToCount.forEach((hotel: Hotel) => {
      const city = hotel.city?.toLowerCase().trim();
      if (city) {
        cityHotelCounts[city] = (cityHotelCounts[city] || 0) + 1;
      }
    });

    const { data: citiesData, error: citiesError } = await api.getCities();
    if (!citiesError && citiesData && citiesData.length > 0) {
      // Merge hotel counts into cities (case-insensitive lookup)
      const citiesWithCounts = citiesData.map((city: City) => ({
        ...city,
        hotelCount: cityHotelCounts[city.name?.toLowerCase().trim()] || 0,
      }));
      setCities(citiesWithCounts.slice(0, 4));
    } else {
      setCities(DUMMY_CITIES);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#E63946" />
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          {t('home.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View
        className="px-5 pb-5"
        style={{
          paddingTop: insets.top + 16,
          backgroundColor: '#E63946',
        }}
      >
        {/* Greeting Row */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">
              {t('home.greeting')} 👋
            </Text>
            <Text className="text-sm text-white/80 mt-0.5">
              {t('home.heroTitle')}
            </Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white/15 items-center justify-center"
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <FontAwesome name="bell-o" size={18} color="#fff" />
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar />

        {/* Date Selection */}
        <View className="mt-3">
          <DateSelectionBar
            checkIn={checkIn}
            checkOut={checkOut}
            onDatesChange={setDates}
            variant="light"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
        }
      >
        {/* Quick Filters */}
        <View className="flex-row px-5 py-6 justify-between">
          {QUICK_FILTERS.map((filter, index) => (
            <QuickFilterButton
              key={filter.id}
              id={filter.id}
              label={filter.label}
              icon={filter.icon}
              index={index}
              onPress={() => {
                if (filter.id === 'nearby') {
                  router.push({ pathname: '/search-results', params: { nearby: 'true' } });
                } else {
                  router.push({ pathname: '/(tabs)/search', params: { filter: filter.id } });
                }
              }}
            />
          ))}
        </View>

        {/* Popular Destinations */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 dark:text-white px-5 mb-3">
            {t('home.recommendedForYou', 'Popular Destinations')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {cities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={{ width: 140 }}
                onPress={() => router.push({ pathname: '/search-results', params: { city: city.name } })}
                activeOpacity={0.9}
              >
                <View
                  className="rounded-2xl overflow-hidden"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <ImageBackground
                    source={{ uri: city.coverImage || CITY_IMAGES[city.name] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
                    className="h-44 justify-end"
                    resizeMode="cover"
                  >
                    {/* Gradient Overlay */}
                    <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <View className="p-3">
                      <Text className="text-white text-base font-bold">
                        {city.name}
                      </Text>
                      <Text className="text-white/80 text-xs">
                        {city.hotelCount || 0} hotels
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* First Booking Banner */}
        <View className="mx-5 mb-6">
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/hotels', params: { firstBookingOffer: 'true' } })}
            activeOpacity={0.95}
          >
            <View
              className="rounded-2xl p-5 overflow-hidden"
              style={{
                backgroundColor: '#1D3557',
                shadowColor: '#1D3557',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="bg-white/20 self-start px-2.5 py-1 rounded-full mb-2">
                    <Text className="text-white text-xs font-bold">{t('home.limitedOffer', 'LIMITED OFFER')}</Text>
                  </View>
                  <Text className="text-xl font-bold text-white mb-1">
                    {t('home.promo.title', 'First Booking Offer!')}
                  </Text>
                  <Text className="text-sm text-white/70">
                    {t('home.promo.subtitle', 'Get 20% OFF on your first stay')}
                  </Text>
                </View>
                <View className="items-center ml-4">
                  <Text className="text-5xl mb-2">🎁</Text>
                  <View className="bg-primary px-4 py-2 rounded-full">
                    <Text className="text-white font-bold text-sm">
                      {t('home.promo.button', 'Book Now')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Hotels */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {t('home.topRated')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/hotels')}>
              <Text className="text-sm font-semibold text-primary">
                {t('home.seeAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {hotels.length === 0 ? (
            <View className="p-10 rounded-2xl bg-white dark:bg-gray-800 items-center">
              <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mb-3">
                <FontAwesome name="building-o" size={28} color="#9CA3AF" />
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {t('home.noHotels')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={hotels.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <HotelCard hotel={item} index={index} />
              )}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Bottom Padding */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
