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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import HotelCard from '@/components/HotelCard';
import QuickFilterButton from '@/components/QuickFilterButton';
import Animated, { FadeInRight } from 'react-native-reanimated';

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
        className="px-6 pb-6 rounded-b-[32px] overflow-hidden"
        style={{
          paddingTop: insets.top + 16,
          backgroundColor: '#E63946',
        }}
      >
        {/* Decorative Elements */}
        <View className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/10" />
        <View className="absolute -left-8 top-20 w-28 h-28 rounded-full bg-white/5" />

        <View className="flex-row justify-between items-start mb-5">
          <View>
            <Text className="text-sm text-white/70 font-medium">{t('home.greeting')}</Text>
            <Text className="text-2xl font-extrabold text-white mt-1 tracking-tight">
              {t('home.heroTitle')}
            </Text>
          </View>
          <TouchableOpacity
            className="w-12 h-12 rounded-full bg-white/15 items-center justify-center border border-white/20"
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <FontAwesome name="bell-o" size={20} color="#fff" />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-primary" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          className="flex-row items-center rounded-2xl px-5 py-4 gap-3"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.9}
        >
          <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            <FontAwesome name="search" size={16} color="#E63946" />
          </View>
          <Text className="text-gray-400 text-base flex-1 font-medium">
            {t('home.searchPlaceholder')}
          </Text>
          <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center">
            <FontAwesome name="sliders" size={14} color="#fff" />
          </View>
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
        <View className="flex-row px-5 py-6 gap-2">
          {QUICK_FILTERS.map((filter, index) => (
            <QuickFilterButton
              key={filter.id}
              id={filter.id}
              label={filter.label}
              icon={filter.icon}
              index={index}
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { filter: filter.id } })}
            />
          ))}
        </View>

        {/* Promotional Banner */}
        <View
          className="mx-5 rounded-3xl p-5 flex-row justify-between items-center mb-6 overflow-hidden"
          style={{
            backgroundColor: '#1D3557',
            shadowColor: '#1D3557',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
          }}
        >
          {/* Background Circles */}
          <View className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
          <View className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-primary/20" />

          <View className="flex-1 z-10">
            <View className="bg-primary/20 self-start px-3 py-1 rounded-full mb-2">
              <Text className="text-primary text-xs font-bold">LIMITED OFFER</Text>
            </View>
            <Text className="text-xl font-bold text-white">{t('home.promo.title')}</Text>
            <Text className="text-sm text-white/70 mt-1 mb-4">
              {t('home.promo.subtitle')}
            </Text>
            <TouchableOpacity
              className="bg-primary px-5 py-2.5 rounded-full self-start"
              style={{
                shadowColor: '#E63946',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Text className="text-white font-bold text-sm">
                {t('home.promo.button')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-5xl z-10">🎉</Text>
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
