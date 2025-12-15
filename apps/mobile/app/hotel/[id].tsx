import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/lib/api';

const { width } = Dimensions.get('window');

interface Hotel {
    id: string;
    name: string;
    city: string;
    address: string;
    rating: string | number;
    description: string;
    coverImage: string;
    images: string[];
    amenities: string[];
    rooms?: Room[];
}

interface Room {
    id: string;
    name: string;
    type: string;
    description: string;
    basePrice: string | number;
    dynamicPrice?: number;       // Calculated dynamic price per night
    totalDynamicPrice?: number;  // Total for all nights
    nights?: number;
    maxGuests: number;
    photos: string[];
    isAvailable?: boolean;
    priceBreakdown?: {
        multiplier: number;
        rules: Array<{ name: string; description: string }>;
    };
}

export default function HotelDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { t, i18n } = useTranslation();

    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchHotelData();
        }
    }, [id]);

    const fetchHotelData = async () => {
        const hotelRes = await api.getHotel(id!);

        if (hotelRes.error) {
            setError(hotelRes.error);
            setLoading(false);
            return;
        }

        setHotel(hotelRes.data);

        // Always fetch rooms from API endpoint to get dynamic pricing
        const roomsRes = await api.getRooms(id!);
        if (roomsRes.data) {
            setRooms(roomsRes.data);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const formatPrice = (price: number) => {
        if (i18n.language === 'bn') {
            return price.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
        }
        return Number(price).toLocaleString('en-US');
    };

    if (error || !hotel) {
        return (
            <View style={styles.centered}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    {error || t('hotel.notFound')}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: Colors.primary }}>{t('hotel.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerTransparent: true,
                    headerBackTitle: t('hotel.goBack'),
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Hero Image with Gradient Overlay */}
                <View style={styles.heroContainer}>
                    <Image
                        source={{ uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
                        style={styles.heroGradient}
                    />
                </View>

                {/* Hotel Info */}
                <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
                    <View style={styles.ratingBadge}>
                        <FontAwesome name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{Number(hotel.rating || 0).toFixed(1)}</Text>
                    </View>

                    <Text style={[styles.hotelName, { color: colors.text }]}>{hotel.name}</Text>

                    <View style={[styles.locationRow, { backgroundColor: 'transparent' }]}>
                        <FontAwesome name="map-marker" size={16} color={Colors.primary} />
                        <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                            {hotel.address}, {hotel.city}
                        </Text>
                    </View>

                    <Text style={[styles.description, { color: colors.text }]}>
                        {hotel.description}
                    </Text>

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('hotel.amenities')}</Text>
                            <View style={[styles.amenitiesRow, { backgroundColor: 'transparent' }]}>
                                {hotel.amenities.slice(0, 6).map((amenity, index) => (
                                    <View
                                        key={index}
                                        style={[styles.amenityBadge, { backgroundColor: colors.backgroundSecondary }]}
                                    >
                                        <Text style={[styles.amenityText, { color: colors.text }]}>{amenity}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>

                {/* Rooms Section */}
                <View style={[styles.roomsSection, { backgroundColor: colors.background }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('hotel.availableRooms')}</Text>

                    {rooms.length === 0 ? (
                        <View style={[styles.noRooms, { backgroundColor: colors.backgroundSecondary }]}>
                            <FontAwesome name="bed" size={32} color={colors.textSecondary} />
                            <Text style={[styles.noRoomsText, { color: colors.textSecondary }]}>
                                {t('hotel.noRooms')}
                            </Text>
                        </View>
                    ) : (
                        rooms.map((room) => (
                            <View
                                key={room.id}
                                style={[styles.roomCard, { backgroundColor: colors.card }]}
                            >
                                <Image
                                    source={{ uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }}
                                    style={styles.roomImage}
                                />
                                <View style={[styles.roomInfo, { backgroundColor: 'transparent' }]}>
                                    <Text style={[styles.roomType, { color: colors.text }]}>{room.name || room.type}</Text>
                                    <View style={styles.roomFeatures}>
                                        <View style={[styles.featureBadge, { backgroundColor: colors.backgroundSecondary }]}>
                                            <FontAwesome name="users" size={12} color={Colors.primary} />
                                            <Text style={[styles.featureText, { color: colors.text }]}>
                                                {t('hotel.upToGuests', { count: room.maxGuests })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.roomPriceRow, { backgroundColor: 'transparent' }]}>
                                        <View style={styles.priceInfo}>
                                            {/* Show strikethrough only when there's a discount */}
                                            {room.dynamicPrice && room.dynamicPrice < Number(room.basePrice) && (
                                                <Text style={styles.originalPrice}>
                                                    {t('common.currency')}{formatPrice(Number(room.basePrice))}
                                                </Text>
                                            )}
                                            <View style={styles.currentPriceRow}>
                                                <Text style={[styles.roomPrice, { color: Colors.primary }]}>
                                                    {t('common.currency')}{formatPrice(Number(room.dynamicPrice || room.basePrice || 0))}
                                                </Text>
                                                <Text style={[styles.perNight, { color: colors.textSecondary }]}>
                                                    {t('common.perNight')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.bookButton}
                                        onPress={() => router.push(`/booking/${room.id}`)}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={[Colors.primary, Colors.primaryDark]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.bookButtonGradient}
                                        >
                                            <Text style={styles.bookButtonText}>{t('hotel.bookNow')}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </>
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
    errorText: {
        fontSize: 16,
        marginBottom: 16,
    },
    heroContainer: {
        position: 'relative',
    },
    heroImage: {
        width: width,
        height: 320,
    },
    heroGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    infoSection: {
        padding: 20,
        marginTop: -24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
        gap: 6,
    },
    ratingText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    hotelName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    locationText: {
        fontSize: 14,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    amenitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    amenityText: {
        fontSize: 13,
    },
    roomsSection: {
        padding: 20,
        paddingTop: 0,
    },
    noRooms: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    noRoomsText: {
        fontSize: 14,
    },
    roomCard: {
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
    roomImage: {
        width: '100%',
        height: 160,
    },
    roomInfo: {
        padding: 16,
    },
    roomType: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    roomFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    featureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    featureText: {
        fontSize: 13,
    },
    roomPriceRow: {
        marginBottom: 14,
    },
    priceInfo: {
        flexDirection: 'column',
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
        color: '#999',
        marginBottom: 2,
    },
    currentPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    roomPrice: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    perNight: {
        fontSize: 14,
    },
    bookButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    bookButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
