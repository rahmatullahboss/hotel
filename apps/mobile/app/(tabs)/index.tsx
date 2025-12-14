import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
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

const QUICK_FILTERS = [
  { id: 'nearby', label: 'Near Me', icon: 'location-arrow' as const },
  { id: 'budget', label: 'Budget', icon: 'tag' as const },
  { id: 'luxury', label: 'Premium', icon: 'star' as const },
  { id: 'couple', label: 'Couple', icon: 'heart' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

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

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finding best hotels...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Search */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: Colors.primary }]}>
        <View style={[styles.headerTop, { backgroundColor: 'transparent' }]}>
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.headerGreeting}>Hello! 👋</Text>
            <Text style={styles.headerTitle}>Find your perfect stay</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <FontAwesome name="bell-o" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.9}
        >
          <FontAwesome name="search" size={18} color="#999" />
          <Text style={styles.searchPlaceholder}>Search city, hotel, or landmark</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Quick Filters */}
        <View style={[styles.quickFilters, { backgroundColor: 'transparent' }]}>
          {QUICK_FILTERS.map((filter) => (
            <TouchableOpacity key={filter.id} style={styles.filterItem}>
              <View style={[styles.filterIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <FontAwesome name={filter.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promotional Banner */}
        <View style={[styles.promoBanner, { backgroundColor: Colors.primary }]}>
          <View style={[styles.promoContent, { backgroundColor: 'transparent' }]}>
            <Text style={styles.promoTitle}>First Booking Offer!</Text>
            <Text style={styles.promoSubtitle}>Get 20% OFF on your first stay</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoEmoji}>🎉</Text>
        </View>

        {/* Featured Hotels */}
        <View style={[styles.section, { backgroundColor: 'transparent' }]}>
          <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Top Rated Hotels
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {hotels.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
              <FontAwesome name="building-o" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No hotels available
              </Text>
            </View>
          ) : (
            hotels.slice(0, 5).map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                style={[styles.hotelCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/hotel/${hotel.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }}
                  style={styles.hotelImage}
                />
                <View style={[styles.hotelInfo, { backgroundColor: 'transparent' }]}>
                  <View style={[styles.hotelHeader, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.hotelName, { color: colors.text }]} numberOfLines={1}>
                      {hotel.name}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <FontAwesome name="star" size={10} color="#fff" />
                      <Text style={styles.ratingText}>{Number(hotel.rating || 0).toFixed(1)}</Text>
                    </View>
                  </View>
                  <View style={[styles.locationRow, { backgroundColor: 'transparent' }]}>
                    <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
                    <Text style={[styles.hotelLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                      {hotel.city}
                    </Text>
                  </View>
                  <View style={[styles.priceRow, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Starting from</Text>
                    <Text>
                      <Text style={[styles.hotelPrice, { color: Colors.primary }]}>
                        ৳{Number(hotel.lowestPrice || 0).toLocaleString()}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#717171' }}> /night</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  filterItem: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  filterIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  promoBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  promoEmoji: {
    fontSize: 48,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 12,
  },
  hotelCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 160,
  },
  hotelInfo: {
    padding: 14,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A699',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  hotelLocation: {
    fontSize: 13,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  priceLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  hotelPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  perNight: {
    fontSize: 12,
    marginLeft: 2,
  },
});
