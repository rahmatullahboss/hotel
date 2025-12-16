import { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface FilterValues {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    payAtHotel: boolean;
    amenities: string[];
}

interface SearchFiltersModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialFilters?: FilterValues;
}

const COMMON_AMENITIES = [
    { id: 'wifi', label: 'WiFi', icon: 'wifi' },
    { id: 'parking', label: 'Parking', icon: 'car' },
    { id: 'ac', label: 'AC', icon: 'snowflake-o' },
    { id: 'breakfast', label: 'Breakfast', icon: 'cutlery' },
    { id: 'pool', label: 'Pool', icon: 'tint' },
    { id: 'gym', label: 'Gym', icon: 'heartbeat' },
    { id: 'tv', label: 'TV', icon: 'tv' },
    { id: 'room service', label: 'Room Service', icon: 'bell' },
];

const RATING_OPTIONS = [
    { value: 0, label: 'All' },
    { value: 3, label: '3+' },
    { value: 3.5, label: '3.5+' },
    { value: 4, label: '4+' },
    { value: 4.5, label: '4.5+' },
];

const PRICE_OPTIONS = [
    { min: 0, max: 20000, label: 'Any' },
    { min: 0, max: 2000, label: 'Under ৳2,000' },
    { min: 2000, max: 5000, label: '৳2,000 - ৳5,000' },
    { min: 5000, max: 10000, label: '৳5,000 - ৳10,000' },
    { min: 10000, max: 20000, label: '৳10,000+' },
];

export default function SearchFiltersModal({
    visible,
    onClose,
    onApply,
    initialFilters,
}: SearchFiltersModalProps) {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [minPrice, setMinPrice] = useState(initialFilters?.minPrice ?? 0);
    const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice ?? 20000);
    const [minRating, setMinRating] = useState(initialFilters?.minRating ?? 0);
    const [payAtHotel, setPayAtHotel] = useState(initialFilters?.payAtHotel ?? false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        initialFilters?.amenities ?? []
    );

    useEffect(() => {
        if (visible && initialFilters) {
            setMinPrice(initialFilters.minPrice);
            setMaxPrice(initialFilters.maxPrice);
            setMinRating(initialFilters.minRating);
            setPayAtHotel(initialFilters.payAtHotel);
            setSelectedAmenities(initialFilters.amenities);
        }
    }, [visible, initialFilters]);

    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenities((prev: string[]) =>
            prev.includes(amenityId)
                ? prev.filter((a: string) => a !== amenityId)
                : [...prev, amenityId]
        );
    };

    const handleApply = () => {
        onApply({
            minPrice,
            maxPrice,
            minRating,
            payAtHotel,
            amenities: selectedAmenities,
        });
        onClose();
    };

    const handleReset = () => {
        setMinPrice(0);
        setMaxPrice(20000);
        setMinRating(0);
        setPayAtHotel(false);
        setSelectedAmenities([]);
    };

    const handlePriceSelect = (min: number, max: number) => {
        setMinPrice(min);
        setMaxPrice(max);
    };

    const activeFiltersCount = [
        minPrice > 0 || maxPrice < 20000,
        minRating > 0,
        payAtHotel,
        selectedAmenities.length > 0,
    ].filter(Boolean).length;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Header */}
                <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <TouchableOpacity onPress={onClose}>
                        <Text className="text-primary font-medium">{t('common.cancel', 'Cancel')}</Text>
                    </TouchableOpacity>
                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('filters.title', 'Filters')}
                    </Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text className="text-primary font-medium">{t('filters.reset', 'Reset')}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Price Range */}
                    <View className={`p-4 mx-4 mt-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('filters.priceRange', 'Price Range')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {PRICE_OPTIONS.map((option) => {
                                const isSelected = minPrice === option.min && maxPrice === option.max;
                                return (
                                    <TouchableOpacity
                                        key={option.label}
                                        onPress={() => handlePriceSelect(option.min, option.max)}
                                        className={`px-4 py-2 rounded-full ${isSelected
                                                ? 'bg-primary'
                                                : isDark ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={isSelected ? 'text-white font-medium' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Rating */}
                    <View className={`p-4 mx-4 mt-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('filters.rating', 'Rating')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {RATING_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setMinRating(option.value)}
                                    className={`px-4 py-2 rounded-full flex-row items-center gap-1 ${minRating === option.value
                                        ? 'bg-primary'
                                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                                        }`}
                                >
                                    {option.value > 0 && (
                                        <FontAwesome name="star" size={12} color={minRating === option.value ? '#fff' : '#F59E0B'} />
                                    )}
                                    <Text className={minRating === option.value ? 'text-white font-medium' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Pay at Hotel */}
                    <View className={`p-4 mx-4 mt-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Pressable
                            onPress={() => setPayAtHotel(!payAtHotel)}
                            className="flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${payAtHotel ? 'bg-primary' : isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <FontAwesome name="hotel" size={18} color={payAtHotel ? '#fff' : isDark ? '#9CA3AF' : '#6B7280'} />
                                </View>
                                <View>
                                    <Text className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {t('filters.payAtHotel', 'Pay at Hotel')}
                                    </Text>
                                    <Text className="text-xs text-gray-400">
                                        {t('filters.payAtHotelDesc', 'Pay when you check in')}
                                    </Text>
                                </View>
                            </View>
                            <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${payAtHotel ? 'bg-primary border-primary' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                                {payAtHotel && <FontAwesome name="check" size={14} color="#fff" />}
                            </View>
                        </Pressable>
                    </View>

                    {/* Amenities */}
                    <View className={`p-4 mx-4 mt-4 mb-24 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-base font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('filters.amenities', 'Amenities')}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {COMMON_AMENITIES.map((amenity) => {
                                const isSelected = selectedAmenities.includes(amenity.id);
                                return (
                                    <TouchableOpacity
                                        key={amenity.id}
                                        onPress={() => toggleAmenity(amenity.id)}
                                        className={`px-3 py-2 rounded-full flex-row items-center gap-2 ${isSelected
                                            ? 'bg-primary'
                                            : isDark ? 'bg-gray-700' : 'bg-gray-100'
                                            }`}
                                    >
                                        <FontAwesome
                                            name={amenity.icon as any}
                                            size={14}
                                            color={isSelected ? '#fff' : isDark ? '#9CA3AF' : '#6B7280'}
                                        />
                                        <Text className={isSelected ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                                            {t(`amenities.${amenity.id}`, amenity.label)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                {/* Apply Button */}
                <View className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    <TouchableOpacity
                        onPress={handleApply}
                        className="bg-primary py-4 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-center font-bold text-base">
                            {activeFiltersCount > 0
                                ? t('filters.showResults', 'Show Results ({{count}} filters)', { count: activeFiltersCount })
                                : t('filters.showAllResults', 'Show All Results')
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
