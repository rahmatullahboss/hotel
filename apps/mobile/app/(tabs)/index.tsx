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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const QUICK_FILTERS = [
    { id: 'nearby', label: t('home.filters.nearMe'), icon: 'location-arrow' as const },
    { id: 'budget', label: t('home.filters.budget'), icon: 'tag' as const },
    { id: 'luxury', label: t('home.filters.premium'), icon: 'star' as const },
    { id: 'couple', label: t('home.filters.couple'), icon: 'heart' as const },
  ];

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

  const formatPrice = (price: number) => {
    if (i18n.language === 'bn') {
      return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
    }
    return Number(price).toLocaleString('en-US');
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white dark:bg-gray-900"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#E63946" />
        <Text className="mt-3 text-base text-gray-500 dark:text-gray-400">
          {t('home.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header with Search */}
      <View
        className="px-5 pb-5 bg-primary rounded-b-3xl"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="text-sm text-white/80">{t('home.greeting')}</Text>
            <Text className="text-2xl font-bold text-white mt-0.5">
              {t('home.heroTitle')}
            </Text>
          </View>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <FontAwesome name="bell-o" size={22} color="#fff" />
            <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-yellow-400 border border-primary" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center bg-white rounded-xl px-4 py-3.5 gap-3"
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.9}
        >
          <FontAwesome name="search" size={18} color="#999" />
          <Text className="text-gray-400 text-base flex-1">
            {t('home.searchPlaceholder')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
        }
      >
        {/* Quick Filters */}
        <View className="flex-row px-5 py-5 justify-between">
          {QUICK_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              className="items-center"
              style={{ width: (width - 60) / 4 }}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { filter: filter.id } })}
            >
              <View className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 items-center justify-center mb-2 shadow-sm">
                <FontAwesome name={filter.icon} size={20} color="#E63946" />
              </View>
              <Text
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promotional Banner */}
        <View className="mx-5 bg-primary rounded-2xl p-5 flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-white">{t('home.promo.title')}</Text>
            <Text className="text-sm text-white/90 mt-1 mb-3">
              {t('home.promo.subtitle')}
            </Text>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start">
              <Text className="text-primary font-semibold text-sm">
                {t('home.promo.button')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-5xl">🎉</Text>
        </View>

        {/* Featured Hotels */}
        <View className="px-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {t('home.topRated')}
            </Text>
            <TouchableOpacity>
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
            hotels.slice(0, 5).map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                className="rounded-2xl mb-4 overflow-hidden bg-white dark:bg-gray-800 shadow-lg"
                onPress={() => router.push(`/hotel/${hotel.id}`)}
                activeOpacity={0.95}
              >
                <View className="relative">
                  <Image
                    source={{
                      uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
                    }}
                    className="w-full h-44"
                    resizeMode="cover"
                  />
                  <View className="absolute top-3 right-3 flex-row items-center bg-black/70 px-2.5 py-1 rounded-lg gap-1">
                    <FontAwesome name="star" size={11} color="#FFD700" />
                    <Text className="text-white text-sm font-bold">
                      {Number(hotel.rating || 0).toFixed(1)}
                    </Text>
                  </View>
                </View>
                <View className="p-4">
                  <Text
                    className="text-lg font-bold text-gray-900 dark:text-white mb-1.5 tracking-tight"
                    numberOfLines={1}
                  >
                    {hotel.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5 mb-3">
                    <FontAwesome name="map-marker" size={12} color="#9CA3AF" />
                    <Text
                      className="text-sm text-gray-500 dark:text-gray-400 flex-1"
                      numberOfLines={1}
                    >
                      {hotel.city}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {t('home.startingFrom')}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                      <Text className="text-xl font-bold text-primary">
                        {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {t('common.perNight')}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Bottom Padding */}
        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
