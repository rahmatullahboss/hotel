import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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

    if (error || !hotel) {
        return (
            <View style={styles.centered}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    {error || 'Hotel not found'}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: Colors.primary }}>Go Back</Text>
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
                    headerBackTitle: 'Back',
                    headerTintColor: '#fff',
                }}
            />
            <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Hero Image */}
                <Image
                    source={{ uri: hotel.coverImage || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                    style={styles.heroImage}
                />

                {/* Hotel Info */}
                <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
                    <View style={[styles.ratingBadge, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.ratingText}>⭐ {Number(hotel.rating || 0).toFixed(1)}</Text>
                    </View>

                    <Text style={[styles.hotelName, { color: colors.text }]}>{hotel.name}</Text>

                    <View style={[styles.locationRow, { backgroundColor: 'transparent' }]}>
                        <FontAwesome name="map-marker" size={16} color={colors.textSecondary} />
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
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
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
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Rooms</Text>

                    {rooms.length === 0 ? (
                        <View style={[styles.noRooms, { backgroundColor: colors.backgroundSecondary }]}>
                            <Text style={[styles.noRoomsText, { color: colors.textSecondary }]}>
                                No rooms available for selected dates
                            </Text>
                        </View>
                    ) : (
                        rooms.map((room) => (
                            <View
                                key={room.id}
                                style={[styles.roomCard, { backgroundColor: colors.backgroundSecondary }]}
                            >
                                <Image
                                    source={{ uri: room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' }}
                                    style={styles.roomImage}
                                />
                                <View style={[styles.roomInfo, { backgroundColor: 'transparent' }]}>
                                    <Text style={[styles.roomType, { color: colors.text }]}>{room.name || room.type}</Text>
                                    <Text style={[styles.roomCapacity, { color: colors.textSecondary }]}>
                                        👥 Up to {room.maxGuests} guests
                                    </Text>
                                    <View style={[styles.roomPriceRow, { backgroundColor: 'transparent' }]}>
                                        {/* Show dynamic price if available, else base price */}
                                        {room.dynamicPrice && room.dynamicPrice !== Number(room.basePrice) ? (
                                            <>
                                                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                                                    ৳{Number(room.basePrice || 0).toLocaleString()}
                                                </Text>
                                                <Text style={[styles.roomPrice, { color: Colors.primary }]}>
                                                    ৳{Number(room.dynamicPrice).toLocaleString()}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text style={[styles.roomPrice, { color: Colors.primary }]}>
                                                ৳{Number(room.dynamicPrice || room.basePrice || 0).toLocaleString()}
                                            </Text>
                                        )}
                                        <Text style={[styles.perNight, { color: colors.textSecondary }]}>/night</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.bookButton, { backgroundColor: Colors.primary }]}
                                        onPress={() => router.push(`/booking/${room.id}`)}
                                    >
                                        <Text style={styles.bookButtonText}>Book Now</Text>
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
    heroImage: {
        width: width,
        height: 300,
    },
    infoSection: {
        padding: 20,
    },
    ratingBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    ratingText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    hotelName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
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
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    roomImage: {
        width: '100%',
        height: 150,
    },
    roomInfo: {
        padding: 16,
    },
    roomType: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    roomCapacity: {
        fontSize: 14,
        marginBottom: 8,
    },
    roomPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
        gap: 6,
    },
    originalPrice: {
        fontSize: 14,
        textDecorationLine: 'line-through',
    },
    roomPrice: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    perNight: {
        fontSize: 14,
        marginLeft: 4,
    },
    bookButton: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
