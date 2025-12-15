import { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
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

interface Booking {
    id: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
}

export default function BookingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const STATUS_CONFIG = {
        CONFIRMED: { color: '#00A699', icon: 'check-circle' as const, label: t('bookings.status.confirmed') },
        PENDING: { color: '#FFB400', icon: 'clock-o' as const, label: t('bookings.status.pending') },
        CANCELLED: { color: '#FF5A5F', icon: 'times-circle' as const, label: t('bookings.status.cancelled') },
        COMPLETED: { color: '#717171', icon: 'check' as const, label: t('bookings.status.completed') },
    };

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
        });
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.header, { paddingTop: insets.top + 16 }]}
            >
                <Text style={styles.headerTitle}>{t('bookings.title')}</Text>
                <Text style={styles.headerSubtitle}>
                    {bookings.length} {bookings.length !== 1 ? t('bookings.bookings') : t('bookings.booking')}
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                }
            >
                {bookings.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
                        <View style={[styles.emptyIcon, { backgroundColor: `${Colors.primary}15` }]}>
                            <FontAwesome name="suitcase" size={40} color={Colors.primary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('bookings.noTrips')}</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('bookings.exploreText')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.exploreButton, { backgroundColor: Colors.primary }]}
                            onPress={() => router.push('/(tabs)/search')}
                        >
                            <Text style={styles.exploreButtonText}>{t('bookings.findHotels')}</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bookingsList}>
                        {bookings.map((booking) => {
                            const status = STATUS_CONFIG[booking.status] ||
                                { color: '#717171', icon: 'question-circle' as const, label: booking.status || 'Unknown' };
                            return (
                                <TouchableOpacity
                                    key={booking.id}
                                    style={[styles.bookingCard, { backgroundColor: colors.card }]}
                                    onPress={() => router.push(`/booking/${booking.id}`)}
                                    activeOpacity={0.95}
                                >
                                    {/* Status Bar */}
                                    <View style={[styles.statusBar, { backgroundColor: status.color }]} />

                                    <View style={[styles.bookingContent, { backgroundColor: 'transparent' }]}>
                                        <View style={[styles.bookingTop, { backgroundColor: 'transparent' }]}>
                                            <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                                <Text style={[styles.hotelName, { color: colors.text }]} numberOfLines={1}>
                                                    {booking.hotelName}
                                                </Text>
                                                <Text style={[styles.roomType, { color: colors.textSecondary }]}>
                                                    {booking.roomType}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
                                                <FontAwesome name={status.icon} size={12} color={status.color} />
                                                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.dateSection, { backgroundColor: colors.backgroundSecondary }]}>
                                            <View style={[styles.dateItem, { backgroundColor: 'transparent' }]}>
                                                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{t('bookings.checkIn')}</Text>
                                                <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(booking.checkIn)}</Text>
                                            </View>
                                            <View style={[styles.dateArrow, { backgroundColor: 'transparent' }]}>
                                                <FontAwesome name="arrow-right" size={14} color={Colors.primary} />
                                            </View>
                                            <View style={[styles.dateItem, { backgroundColor: 'transparent' }]}>
                                                <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{t('bookings.checkOut')}</Text>
                                                <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(booking.checkOut)}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.bookingFooter, { backgroundColor: 'transparent' }]}>
                                            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>{t('bookings.totalPaid')}</Text>
                                            <Text style={[styles.priceValue, { color: Colors.primary }]}>
                                                ৳{booking.totalPrice?.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 6,
    },
    scrollView: {
        flex: 1,
    },
    emptyState: {
        margin: 20,
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    bookingsList: {
        padding: 20,
    },
    bookingCard: {
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    statusBar: {
        height: 5,
    },
    bookingContent: {
        padding: 18,
    },
    bookingTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    hotelName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    roomType: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    dateSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 14,
        borderRadius: 12,
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
    },
    dateArrow: {
        paddingHorizontal: 16,
    },
    dateLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    priceValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
