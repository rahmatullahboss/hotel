import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import api from '@/lib/api';

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  imageUrl: string;
  minPrice?: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHotels = async () => {
    const { data, error } = await api.getHotels();
    if (error) {
      setError(error);
    } else if (data) {
      setHotels(data);
      setError(null);
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Finding the best hotels...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: Colors.primary }]}
          onPress={fetchHotels}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.primary }]}>
        <Text style={styles.headerTitle}>Vibe Hospitality</Text>
        <Text style={styles.headerSubtitle}>Find your perfect stay</Text>
      </View>

      {/* Featured Hotels */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Featured Hotels
        </Text>

        {hotels.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No hotels available at the moment
            </Text>
          </View>
        ) : (
          hotels.map((hotel) => (
            <TouchableOpacity
              key={hotel.id}
              style={[styles.hotelCard, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => router.push(`/hotel/${hotel.id}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: hotel.imageUrl || 'https://via.placeholder.com/300x200' }}
                style={styles.hotelImage}
              />
              <View style={[styles.hotelInfo, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.hotelName, { color: colors.text }]}>
                  {hotel.name}
                </Text>
                <Text style={[styles.hotelLocation, { color: colors.textSecondary }]}>
                  📍 {hotel.city}
                </Text>
                <View style={[styles.hotelMeta, { backgroundColor: 'transparent' }]}>
                  <View style={[styles.ratingBadge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.ratingText}>⭐ {hotel.rating?.toFixed(1) || 'N/A'}</Text>
                  </View>
                  {hotel.minPrice && (
                    <Text style={[styles.priceText, { color: Colors.primary }]}>
                      From ৳{hotel.minPrice.toLocaleString()}/night
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
  },
  hotelCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelImage: {
    width: '100%',
    height: 180,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    marginBottom: 12,
  },
  hotelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
