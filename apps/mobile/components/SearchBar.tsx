import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface Hotel {
    id: string;
    name: string;
    city: string;
}

const POPULAR_CITIES = [
    { name: 'Dhaka', hotels: 6 },
    { name: 'Chittagong', hotels: 4 },
    { name: "Cox's Bazar", hotels: 5 },
    { name: 'Sylhet', hotels: 4 },
    { name: 'Rajshahi', hotels: 3 },
    { name: 'Khulna', hotels: 3 },
    { name: 'Rangpur', hotels: 2 },
    { name: 'Mymensingh', hotels: 2 },
    { name: 'Barishal', hotels: 3 },
];

interface SearchBarProps {
    placeholder?: string;
    showFilterButton?: boolean;
    onFilterPress?: () => void;
    variant?: 'home' | 'search';
}

export default function SearchBar({
    placeholder,
    showFilterButton = true,
    onFilterPress,
    variant = 'home',
}: SearchBarProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allHotels, setAllHotels] = useState<Hotel[]>([]);

    useEffect(() => {
        const fetchHotels = async () => {
            const { data, error } = await api.getHotels();
            if (!error && data) {
                setAllHotels(data);
            }
        };
        fetchHotels();
    }, []);

    useEffect(() => {
        setShowSuggestions(searchQuery.length >= 1);
    }, [searchQuery]);

    const getSuggestions = useCallback(() => {
        if (searchQuery.length < 1) return [];

        const query = searchQuery.toLowerCase();
        const citySuggestions = POPULAR_CITIES
            .filter(c => c.name.toLowerCase().includes(query))
            .map(c => ({ type: 'city' as const, name: c.name, count: c.hotels }));

        const hotelSuggestions = allHotels
            .filter(h => h.name.toLowerCase().includes(query))
            .slice(0, 3)
            .map(h => ({ type: 'hotel' as const, name: h.name, id: h.id, city: h.city }));

        return [...citySuggestions, ...hotelSuggestions].slice(0, 6);
    }, [searchQuery, allHotels]);

    const handleCitySelect = (city: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push({
            pathname: '/search-results',
            params: { city },
        } as any);
    };

    const handleHotelSelect = (hotelId: string) => {
        setShowSuggestions(false);
        setSearchQuery('');
        router.push(`/hotel/${hotelId}` as any);
    };

    const handleSubmit = () => {
        if (searchQuery.trim().length > 0) {
            setShowSuggestions(false);
            router.push({
                pathname: '/search-results',
                params: { city: searchQuery.trim() },
            } as any);
        } else {
            router.push('/(tabs)/search');
        }
    };

    const suggestions = getSuggestions();

    return (
        <View style={{ zIndex: 999 }}>
            {/* Search Input */}
            <View
                className="flex-row items-center rounded-2xl px-4 py-3 gap-3"
                style={{
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                {/* Search Icon */}
                <View className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
                    <FontAwesome name="search" size={16} color="#E63946" />
                </View>

                {/* Input Field */}
                <TextInput
                    className="flex-1 text-base text-gray-900 font-medium"
                    placeholder={placeholder || t('home.searchPlaceholder')}
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="search"
                    style={{ paddingVertical: 0 }}
                />

                {/* Clear/Filter Button */}
                {searchQuery.length > 0 ? (
                    <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        className="w-8 h-8 items-center justify-center"
                    >
                        <FontAwesome name="times-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                ) : showFilterButton ? (
                    <TouchableOpacity
                        className="w-9 h-9 rounded-xl bg-primary items-center justify-center"
                        onPress={onFilterPress || (() => router.push('/(tabs)/search'))}
                    >
                        <FontAwesome name="sliders" size={14} color="#fff" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <View
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
                    style={{
                        zIndex: 9999,
                        elevation: 50,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                    }}
                >
                    {suggestions.map((item, index) => (
                        <TouchableOpacity
                            key={`${item.type}-${item.name}-${index}`}
                            className={`flex-row items-center px-4 py-3.5 ${index !== suggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                                }`}
                            onPress={() => {
                                if (item.type === 'city') {
                                    handleCitySelect(item.name);
                                } else {
                                    handleHotelSelect((item as any).id);
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            {/* Icon */}
                            <View className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
                                {item.type === 'city' ? (
                                    <Text className="text-lg">📍</Text>
                                ) : (
                                    <Text className="text-lg">🏨</Text>
                                )}
                            </View>

                            {/* Text */}
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                    {item.name}
                                </Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {item.type === 'city'
                                        ? `${item.count} hotels`
                                        : (item as any).city}
                                </Text>
                            </View>

                            {/* Arrow */}
                            <FontAwesome name="chevron-right" size={12} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
