import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '@/lib/api';

interface Booking {
    id: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
}

const STATUS_CONFIG = {
    CONFIRMED: { color: '#10b981', icon: 'check-circle' as const, label: 'Confirmed' },
    PENDING: { color: '#f59e0b', icon: 'clock-o' as const, label: 'Pending' },
    CANCELLED: { color: '#ef4444', icon: 'times-circle' as const, label: 'Cancelled' },
    COMPLETED: { color: '#6b7280', icon: 'check' as const, label: 'Completed' },
};

export default function BookingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        const { data, error } = await api.getMyBookings();
        if (!error && data) {
            setBookings(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading your bookings...
                </Text>
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
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Bookings</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Bookings List */}
            {bookings.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
                    <FontAwesome name="calendar-o" size={48} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookings yet</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Start exploring hotels and make your first booking!
                    </Text>
                    <TouchableOpacity
                        style={[styles.exploreButton, { backgroundColor: Colors.primary }]}
                        onPress={() => router.push('/(tabs)/search')}
                    >
                        <Text style={styles.exploreButtonText}>Explore Hotels</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[styles.bookingsList, { backgroundColor: 'transparent' }]}>
                    {bookings.map((booking) => {
                        const status = STATUS_CONFIG[booking.status];
                        return (
                            <TouchableOpacity
                                key={booking.id}
                                style={[styles.bookingCard, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => router.push(`/booking/${booking.id}`)}
                            >
                                <View style={[styles.bookingHeader, { backgroundColor: 'transparent' }]}>
                                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                        <Text style={[styles.hotelName, { color: colors.text }]}>
                                            {booking.hotelName}
                                        </Text>
                                        <Text style={[styles.roomType, { color: colors.textSecondary }]}>
                                            {booking.roomType}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                                        <FontAwesome name={status.icon} size={12} color={status.color} />
                                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                                    </View>
                                </View>

                                <View style={[styles.bookingDates, { backgroundColor: 'transparent' }]}>
                                    <View style={[styles.dateItem, { backgroundColor: 'transparent' }]}>
                                        <FontAwesome name="sign-in" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Check-in</Text>
                                        <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(booking.checkIn)}</Text>
                                    </View>
                                    <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />
                                    <View style={[styles.dateItem, { backgroundColor: 'transparent' }]}>
                                        <FontAwesome name="sign-out" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Check-out</Text>
                                        <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(booking.checkOut)}</Text>
                                    </View>
                                </View>

                                <View style={[styles.bookingFooter, { borderTopColor: colors.border, backgroundColor: 'transparent' }]}>
                                    <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Total</Text>
                                    <Text style={[styles.priceValue, { color: Colors.primary }]}>
                                        ৳{booking.totalPrice?.toLocaleString()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
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
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    emptyState: {
        margin: 20,
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    bookingsList: {
        padding: 16,
    },
    bookingCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    bookingHeader: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    hotelName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    roomType: {
        fontSize: 14,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bookingDates: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
    },
    dateLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    dateDivider: {
        width: 1,
        marginHorizontal: 16,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
    },
    priceLabel: {
        fontSize: 14,
    },
    priceValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
