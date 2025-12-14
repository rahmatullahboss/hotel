import { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, TouchableOpacity as RNTouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TouchableOpacity = RNTouchableOpacity;

const POPULAR_CITIES = [
    { name: 'Dhaka', icon: '🏙️' },
    { name: 'Chittagong', icon: '⛵' },
    { name: "Cox's Bazar", icon: '🏖️' },
    { name: 'Sylhet', icon: '🌿' },
    { name: 'Rajshahi', icon: '🏛️' },
    { name: 'Khulna', icon: '🌊' },
];

export default function SearchScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [searchQuery, setSearchQuery] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleSearch = () => {
        // Navigate to search results with query params
        router.push({
            pathname: '/search-results',
            params: { city: searchQuery, checkIn, checkOut },
        });
    };

    const handleCitySelect = (city: string) => {
        setSearchQuery(city);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search Header */}
            <View style={[styles.searchHeader, { backgroundColor: Colors.primary }]}>
                <Text style={styles.searchTitle}>Find Hotels</Text>
                <Text style={styles.searchSubtitle}>Search from thousands of hotels</Text>
            </View>

            {/* Search Form */}
            <View style={[styles.searchForm, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <FontAwesome name="map-marker" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Where do you want to go?"
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={[styles.dateRow, { backgroundColor: 'transparent' }]}>
                    <View style={[styles.dateInput, { backgroundColor: colors.background }]}>
                        <FontAwesome name="calendar" size={16} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Check-in"
                            placeholderTextColor={colors.textSecondary}
                            value={checkIn}
                            onChangeText={setCheckIn}
                        />
                    </View>
                    <View style={[styles.dateInput, { backgroundColor: colors.background }]}>
                        <FontAwesome name="calendar" size={16} color={colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Check-out"
                            placeholderTextColor={colors.textSecondary}
                            value={checkOut}
                            onChangeText={setCheckOut}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: Colors.primary }]}
                    onPress={handleSearch}
                >
                    <FontAwesome name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.searchButtonText}>Search Hotels</Text>
                </TouchableOpacity>
            </View>

            {/* Popular Cities */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Popular Destinations
                </Text>
                <View style={[styles.citiesGrid, { backgroundColor: 'transparent' }]}>
                    {POPULAR_CITIES.map((city) => (
                        <TouchableOpacity
                            key={city.name}
                            style={[styles.cityCard, { backgroundColor: colors.backgroundSecondary }]}
                            onPress={() => handleCitySelect(city.name)}
                        >
                            <Text style={styles.cityIcon}>{city.icon}</Text>
                            <Text style={[styles.cityName, { color: colors.text }]}>{city.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchHeader: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    searchTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    searchForm: {
        margin: 16,
        marginTop: -20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    citiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cityCard: {
        width: '30%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    cityIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    cityName: {
        fontSize: 14,
        fontWeight: '500',
    },
});
