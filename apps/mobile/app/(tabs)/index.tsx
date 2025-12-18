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
  TextInput,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useBookingDates } from '@/contexts/BookingDatesContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Accent color matching the reference design
const ACCENT_COLOR = '#E63946';

interface Hotel {
  id: string;
  name: string;
  city: string;
  location?: string;
  rating: string | number;
  imageUrl: string;
  lowestPrice?: number;
}

// Category filter items matching reference design
const CATEGORIES = [
  { id: 'place', label: 'Place', emoji: '🏝️' },
  { id: 'hotel', label: 'Hotel', emoji: '🏨' },
  { id: 'flight', label: 'Flight', emoji: '✈️' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
];

// Dummy hotels for fallback
const DUMMY_HOTELS: Hotel[] = [
  { id: '1', name: 'BaLi Motel vong Tau', city: 'Indonesia', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', lowestPrice: 580 },
  { id: '2', name: 'Pan Pacific Resort', city: 'Dhaka', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', lowestPrice: 8500 },
  { id: '3', name: "Cox's Ocean Paradise", city: "Cox's Bazar", rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', lowestPrice: 5500 },
  { id: '4', name: 'Grand Sylhet Resort', city: 'Sylhet', rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600', lowestPrice: 4800 },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { checkIn, checkOut } = useBookingDates();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('hotel');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedHotels, setSavedHotels] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const { data: hotelsData, error: hotelsError } = await api.getHotels();
    if (!hotelsError && hotelsData && hotelsData.length > 0) {
      setHotels(hotelsData);
    } else {
      setHotels(DUMMY_HOTELS);
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

  const toggleSaveHotel = (id: string) => {
    setSavedHotels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color={ACCENT_COLOR} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        {/* Location & Notification */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xs text-gray-400">Current Location</Text>
            <TouchableOpacity className="flex-row items-center gap-1 mt-0.5">
              <Text className="text-lg font-bold text-gray-900">Bangladesh</Text>
              <FontAwesome name="chevron-down" size={12} color="#1F2937" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.push('/notifications')}
          >
            <FontAwesome name="bell-o" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          className="flex-row items-center px-4 py-3 rounded-2xl bg-gray-100 gap-3 mb-5"
        >
          <FontAwesome name="search" size={16} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Search destination..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery.length >= 2) {
                router.push({ pathname: '/search-results', params: { query: searchQuery } });
              }
            }}
          />
          <TouchableOpacity
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: ACCENT_COLOR }}
            onPress={() => router.push('/(tabs)/search')}
          >
            <FontAwesome name="sliders" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          className="mb-5"
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              className={`flex-row items-center px-4 py-2.5 rounded-full gap-2 ${activeCategory === cat.id ? '' : 'bg-gray-100'
                }`}
              style={activeCategory === cat.id ? { backgroundColor: ACCENT_COLOR } : {}}
            >
              <Text className="text-lg">{cat.emoji}</Text>
              <Text
                className={`font-semibold ${activeCategory === cat.id ? 'text-white' : 'text-gray-700'
                  }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT_COLOR} />
        }
      >
        {/* Popular Hotels Section */}
        <View className="px-5 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Popular Hotels
            </Text>
            <TouchableOpacity onPress={() => router.push('/hotels')}>
              <Text className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hotel Cards - Full Photo with Overlay Text */}
          {hotels.slice(0, 5).map((hotel, index) => (
            <TouchableOpacity
              key={hotel.id}
              onPress={() => router.push(`/hotel/${hotel.id}`)}
              activeOpacity={0.95}
              style={{ marginBottom: 20 }}
            >
              <View
                className="overflow-hidden"
                style={{
                  borderRadius: 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                {/* Full Bleed Image */}
                <View className="relative">
                  <Image
                    source={{ uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600' }}
                    className="w-full"
                    style={{
                      height: 280,
                      borderRadius: 24,
                    }}
                    resizeMode="cover"
                  />

                  {/* Smooth Gradient Overlay at Bottom */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                    locations={[0, 0.4, 1]}
                    className="absolute bottom-0 left-0 right-0 h-44"
                    style={{
                      borderBottomLeftRadius: 24,
                      borderBottomRightRadius: 24,
                    }}
                    pointerEvents="none"
                  />

                  {/* Text Content on Overlay */}
                  <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                    {/* Location with pin */}
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <FontAwesome name="map-marker" size={14} color="rgba(255,255,255,0.85)" />
                      <Text className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{hotel.city}</Text>
                    </View>

                    {/* Hotel Name */}
                    <Text className="text-xl font-bold text-white mb-1" numberOfLines={1}>
                      {hotel.name}
                    </Text>

                    {/* Price */}
                    <View className="flex-row items-baseline">
                      <Text className="text-lg font-bold text-white">
                        ৳{hotel.lowestPrice?.toLocaleString() || '0'}
                      </Text>
                      <Text className="text-sm text-white/70 ml-1">/ night</Text>
                    </View>
                  </View>

                  {/* Rating Badge - Top Left (Golden) */}
                  <View
                    className="absolute top-4 left-4 flex-row items-center px-3 py-2 gap-1.5"
                    style={{
                      backgroundColor: '#F59E0B',
                      borderRadius: 12,
                    }}
                  >
                    <FontAwesome name="star" size={14} color="#fff" />
                    <Text className="text-white font-bold text-sm">
                      {Number(hotel.rating).toFixed(1)}
                    </Text>
                  </View>

                  {/* Heart Button - Top Right */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleSaveHotel(hotel.id);
                    }}
                    className="absolute top-4 right-4 w-11 h-11 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: savedHotels.has(hotel.id) ? '#EF4444' : 'rgba(0,0,0,0.4)',
                    }}
                  >
                    <FontAwesome
                      name={savedHotels.has(hotel.id) ? 'heart' : 'heart-o'}
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>

                  {/* Share/Send Button - Bottom Right (Primary) */}
                  <TouchableOpacity
                    className="absolute bottom-4 right-4 w-11 h-11 rounded-full items-center justify-center"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    <FontAwesome name="send" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Padding */}
        <View className="h-6" />
      </ScrollView>
    </View>
  );
}

