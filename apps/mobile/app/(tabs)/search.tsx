import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import CityCard from '@/components/CityCard';

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
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');

    const handleCitySelect = (city: string) => {
        router.push({
            pathname: '/search-results',
            params: { city },
        } as any);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View
                className="px-5 pb-5 bg-primary rounded-b-3xl"
                style={{ paddingTop: insets.top + 10 }}
            >
                <Text className="text-2xl font-bold text-white">{t('search.title')}</Text>
                <Text className="text-sm text-white/80 mt-1">{t('search.subtitle')}</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="px-5 -mt-7">
                    <View className="flex-row items-center px-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 gap-3 shadow-lg">
                        <FontAwesome name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-base text-gray-900 dark:text-white"
                            placeholder={t('search.placeholder')}
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <FontAwesome name="times-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Popular Cities */}
                <View className="px-5 mt-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t('search.popularDestinations')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                        {POPULAR_CITIES.map((city, index) => (
                            <CityCard
                                key={city.name}
                                name={city.name}
                                image={city.image}
                                hotels={city.hotels}
                                index={index}
                                onPress={() => handleCitySelect(city.name)}
                            />
                        ))}
                    </View>
                </View>

                {/* Recent Searches */}
                <View className="px-5 mt-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t('search.recentSearches')}
                    </Text>
                    <View className="p-8 rounded-xl bg-gray-100 dark:bg-gray-800 items-center gap-2">
                        <FontAwesome name="history" size={24} color="#9CA3AF" />
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            {t('search.recentEmpty')}
                        </Text>
                    </View>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
}
