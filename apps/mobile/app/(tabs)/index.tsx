import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
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

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {t('home.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Search */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={[styles.headerTop, { backgroundColor: 'transparent' }]}>
          <View style={{ backgroundColor: 'transparent' }}>
            <Text style={styles.headerGreeting}>{t('home.greeting')}</Text>
            <Text style={styles.headerTitle}>{t('home.heroTitle')}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
            <FontAwesome name="bell-o" size={22} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.9}
        >
          <FontAwesome name="search" size={18} color="#999" />
          <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>
      </LinearGradient>

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
            <TouchableOpacity key={filter.id} style={styles.filterItem} activeOpacity={0.7}>
              <View style={[styles.filterIcon, { backgroundColor: colors.backgroundSecondary }]}>
                <FontAwesome name={filter.icon} size={20} color={Colors.primary} />
              </View>
              <Text
                style={[styles.filterLabel, { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promotional Banner */}
        <View style={[styles.promoBanner, { backgroundColor: Colors.primary }]}>
          <View style={[styles.promoContent, { backgroundColor: 'transparent' }]}>
            <Text style={styles.promoTitle}>{t('home.promo.title')}</Text>
            <Text style={styles.promoSubtitle}>{t('home.promo.subtitle')}</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>{t('home.promo.button')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoEmoji}>🎉</Text>
        </View>

        {/* Featured Hotels */}
        <View style={[styles.section, { backgroundColor: 'transparent' }]}>
          <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.topRated')}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: Colors.primary }]}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {hotels.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
              <FontAwesome name="building-o" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {t('home.noHotels')}
              </Text>
            </View>
          ) : (
            hotels.slice(0, 5).map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                style={[styles.hotelCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/hotel/${hotel.id}`)}
                activeOpacity={0.95}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }}
                    style={styles.hotelImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                    style={styles.imageGradient}
                  />
                  <View style={styles.ratingBadge}>
                    <FontAwesome name="star" size={11} color="#FFD700" />
                    <Text style={styles.ratingText}>{Number(hotel.rating || 0).toFixed(1)}</Text>
                  </View>
                </View>
                <View style={[styles.hotelInfo, { backgroundColor: 'transparent' }]}>
                  <Text style={[styles.hotelName, { color: colors.text }]} numberOfLines={1}>
                    {hotel.name}
                  </Text>
                  <View style={[styles.locationRow, { backgroundColor: 'transparent' }]}>
                    <FontAwesome name="map-marker" size={12} color={colors.textSecondary} />
                    <Text style={[styles.hotelLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                      {hotel.city}
                    </Text>
                  </View>
                  <View style={[styles.priceRow, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('home.startingFrom')}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.hotelPrice, { color: Colors.primary }]}>
                        {t('common.currency')}{formatPrice(hotel.lowestPrice || 0)}
                      </Text>
                      <Text style={[styles.perNight, { color: colors.textSecondary }]}>
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
    flex: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    borderWidth: 1.5,
    borderColor: Colors.primary,
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
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
  },
  hotelImage: {
    width: '100%',
    height: 180,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hotelLocation: {
    fontSize: 13,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  hotelPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  perNight: {
    fontSize: 12,
  },
});
