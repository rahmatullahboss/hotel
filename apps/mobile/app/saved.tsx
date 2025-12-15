import { useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MdFavorite, MdOutlineHotel } from 'react-icons/md';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface SavedHotelItem {
    id: string;
    hotelId: string;
    savedAt: string;
    hotel: {
        id: string;
        name: string;
        city: string;
        coverImage: string | null;
        rating: number | null;
        reviewCount: number;
        lowestDynamicPrice: number | null;
    };
}

export default function SavedHotelsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [savedHotels, setSavedHotels] = useState<SavedHotelItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSavedHotels = useCallback(async () => {
        const { data, error } = await api.getSavedHotels();
        if (data) {
            setSavedHotels(data.savedHotels);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSavedHotels();
        }, [fetchSavedHotels])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedHotels();
    };

    const handleUnsave = async (hotelId: string) => {
        await api.unsaveHotel(hotelId);
        setSavedHotels((prev) => prev.filter((item) => item.hotelId !== hotelId));
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('saved.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {savedHotels.length > 0 ? (
                    <View style={styles.grid}>
                        {savedHotels.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.card, { backgroundColor: colors.card }]}
                                onPress={() => router.push(`/hotel/${item.hotelId}`)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.imageContainer}>
                                    {item.hotel.coverImage ? (
                                        <Image
                                            source={{ uri: item.hotel.coverImage }}
                                            style={styles.image}
                                        />
                                    ) : (
                                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
                                            <MdOutlineHotel size={32} color={colors.textSecondary} />
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => handleUnsave(item.hotelId)}
                                    >
                                        <MdFavorite size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.cardContent, { backgroundColor: 'transparent' }]}>
                                    <Text
                                        style={[styles.hotelName, { color: colors.text }]}
                                        numberOfLines={2}
                                    >
                                        {item.hotel.name}
                                    </Text>
                                    <Text style={[styles.cityText, { color: colors.textSecondary }]}>
                                        {item.hotel.city}
                                    </Text>
                                    {item.hotel.rating && (
                                        <View style={[styles.ratingRow, { backgroundColor: 'transparent' }]}>
                                            <Text style={styles.ratingText}>⭐ {item.hotel.rating.toFixed(1)}</Text>
                                            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                                                ({item.hotel.reviewCount})
                                            </Text>
                                        </View>
                                    )}
                                    {item.hotel.lowestDynamicPrice && (
                                        <Text style={[styles.priceText, { color: Colors.primary }]}>
                                            {t('common.currency')}{item.hotel.lowestDynamicPrice.toLocaleString()}
                                            <Text style={styles.perNight}>{t('common.perNight')}</Text>
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyState, { backgroundColor: 'transparent' }]}>
                        <MdFavorite size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                            {t('saved.noSavedHotels')}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                            {t('saved.emptyDescription')}
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreButton}
                            onPress={() => router.push('/(tabs)')}
                        >
                            <Text style={styles.exploreButtonText}>{t('saved.exploreHotels')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 30 }} />
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContent: {
        padding: 12,
    },
    hotelName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    cityText: {
        fontSize: 12,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    reviewCount: {
        fontSize: 11,
        marginLeft: 4,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '700',
    },
    perNight: {
        fontSize: 11,
        fontWeight: '400',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    exploreButton: {
        marginTop: 24,
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
