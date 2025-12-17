import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
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
  'Dhaka': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400', // Lalbagh Fort Dhaka
  'Chittagong': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=400',
  "Cox's Bazar": 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  'Sylhet': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  'Rajshahi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'Khulna': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
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
    // Fetch hotels
    const { data: hotelsData, error: hotelsError } = await api.getHotels();
    if (!hotelsError && hotelsData && hotelsData.length > 0) {
      setHotels(hotelsData);
    } else {
      setHotels(DUMMY_HOTELS);
    }

    // Fetch cities
    const { data: citiesData, error: citiesError } = await api.getCities();
    if (!citiesError && citiesData && citiesData.length > 0) {
      setCities(citiesData.slice(0, 4));
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
        className="flex-1 items-center justify-center bg-white dark:bg-gray-900"
        style={{ paddingTop: insets.top, paddingHorizontal: 24 }}
      >
        <ActivityIndicator size="large" color="#E63946" />
        <View className="mt-4 w-full">
          <Text
            className="text-base text-gray-500 dark:text-gray-400 text-center"
            numberOfLines={0}
            style={{ width: '100%' }}
          >
            {t('home.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header with Search */}
      <View
        className="px-5 pb-4 rounded-b-[28px]"
        style={{
          paddingTop: insets.top + 12,
          backgroundColor: '#E63946',
          zIndex: 100,
        }}
      >
        {/* Decorative Elements */}
        <View className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10" />
        <View className="absolute -left-8 top-20 w-28 h-28 rounded-full bg-white/5" />

        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-2xl font-bold text-white tracking-tight">
              {t('home.greeting')} 👋
            </Text>
            <Text className="text-base text-white/80 font-medium">
              {t('home.heroTitle')}
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/15 items-center justify-center border border-white/20"
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <FontAwesome name="bell-o" size={18} color="#fff" />
            <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400 border border-primary" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar />

        {/* Date Selection Bar */}
        <View className="mt-2">
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
        <View className="flex-row px-5 py-5 gap-2 justify-between">
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

        {/* Recommended Cities */}
        <View className="px-5 mb-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            {t('home.recommendedForYou', 'Recommended for You')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {cities.map((city) => (
              <TouchableOpacity
                key={city.id}
                style={{ width: (width - 52) / 2 }}
                onPress={() => router.push({ pathname: '/search-results', params: { city: city.name } })}
                activeOpacity={0.8}
              >
                <View className="rounded-2xl overflow-hidden h-28">
                  <ImageBackground
                    source={{ uri: city.coverImage || CITY_IMAGES[city.name] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
                    className="flex-1 justify-end"
                    resizeMode="cover"
                  >
                    <View className="absolute inset-0 bg-black/30" />
                    <View className="p-3">
                      <Text className="text-white text-base font-bold">
                        {city.name}
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* First Booking Discount Banner */}
        <View
          className="mx-5 mb-4 rounded-2xl p-4 overflow-hidden"
          style={{
            backgroundColor: '#1D3557',
          }}
        >
          {/* Background decorations */}
          <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
          <View className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-primary/20" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 z-10">
              <View className="bg-primary/30 self-start px-2.5 py-1 rounded-full mb-2">
                <Text className="text-primary text-xs font-bold">{t('home.limitedOffer', 'LIMITED OFFER')}</Text>
              </View>
              <Text className="text-lg font-bold text-white">
                {t('home.promo.title', 'First Booking Offer!')}
              </Text>
              <Text className="text-sm text-white/70 mt-0.5">
                {t('home.promo.subtitle', 'Get 20% OFF on your first stay')}
              </Text>
            </View>
            <View className="z-10 items-center gap-2">
              <Text className="text-4xl">🎉</Text>
              <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-full"
                onPress={() => router.push({ pathname: '/hotels', params: { firstBookingOffer: 'true' } })}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-sm">
                  {t('home.promo.button', 'Book Now')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recently Viewed - Horizontal Scroll */}
        {hotels.length > 0 && (
          <View className="mb-4">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                {t('home.recentlyViewed', 'Recently Viewed')}
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {hotels.slice(0, 6).map((hotel) => (
                <TouchableOpacity
                  key={hotel.id}
                  className="w-44"
                  onPress={() => router.push(`/hotel/${hotel.id}`)}
                  activeOpacity={0.8}
                >
                  <View className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <Image
                      source={{ uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }}
                      className="w-full h-24"
                      resizeMode="cover"
                    />
                    <View className="p-2.5">
                      <Text
                        className="text-sm font-semibold text-gray-900 dark:text-white"
                        numberOfLines={1}
                      >
                        {hotel.name}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {hotel.city}
                      </Text>
                      <View className="flex-row items-center justify-between mt-1.5">
                        <View className="flex-row items-center">
                          <FontAwesome name="star" size={10} color="#F59E0B" />
                          <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                            {hotel.rating ? (Number(hotel.rating) || 0).toFixed(1) : '0.0'}
                          </Text>
                        </View>
                        {hotel.lowestPrice && (
                          <Text className="text-sm font-bold text-primary">
                            ৳{hotel.lowestPrice.toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
            <View className="p-10 rounded-xl bg-gray-100 dark:bg-gray-800 items-center">
              <FontAwesome name="building-o" size={40} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
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
        <View className="h-5" />
      </ScrollView>
    </View>
  );
}

