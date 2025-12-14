import { useState } from 'react';
import {
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

const POPULAR_CITIES = [
    { name: 'Dhaka', image: '🏙️', hotels: '250+' },
    { name: 'Chittagong', image: '⛵', hotels: '120+' },
    { name: "Cox's Bazar", image: '🏖️', hotels: '180+' },
    { name: 'Sylhet', image: '🌿', hotels: '90+' },
    { name: 'Rajshahi', image: '🏛️', hotels: '45+' },
    { name: 'Khulna', image: '🌊', hotels: '35+' },
];

export default function SearchScreen() {
    const router = useRouter();
    const colors = Colors.light; // Force light theme
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');

    const handleCitySelect = (city: string) => {
        router.push({
            pathname: '/search-results',
            params: { city },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: Colors.primary }]}>
                <Text style={styles.headerTitle}>{t('search.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('search.subtitle')}</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <FontAwesome name="search" size={18} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={t('search.placeholder')}
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <FontAwesome name="times-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Popular Cities */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('search.popularDestinations')}
                    </Text>
                    <View style={styles.citiesGrid}>
                        {POPULAR_CITIES.map((city) => (
                            <TouchableOpacity
                                key={city.name}
                                style={[styles.cityCard, { backgroundColor: colors.card }]}
                                onPress={() => handleCitySelect(city.name)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cityEmoji}>{city.image}</Text>
                                <Text style={[styles.cityName, { color: colors.text }]}>{city.name}</Text>
                                <Text style={[styles.cityHotels, { color: colors.textSecondary }]}>
                                    {city.hotels} {t('search.hotels')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Searches */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('search.recentSearches')}
                    </Text>
                    <View style={[styles.emptyRecent, { backgroundColor: colors.backgroundSecondary }]}>
                        <FontAwesome name="history" size={24} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {t('search.recentEmpty')}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    searchContainer: {
        padding: 20,
        marginTop: -30,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    citiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cityCard: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cityEmoji: {
        fontSize: 36,
        marginBottom: 8,
    },
    cityName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    cityHotels: {
        fontSize: 12,
    },
    emptyRecent: {
        padding: 30,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
    },
    emptyText: {
        fontSize: 13,
    },
});
