import { View, Text, TouchableOpacity, ScrollView, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface NearbyPlace {
    id: string;
    type: 'restaurant' | 'atm' | 'hospital' | 'shopping' | 'transport' | 'attraction';
    name: string;
    distance: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
}

interface NearbyAttractionsProps {
    hotelLat?: number;
    hotelLng?: number;
    city: string;
}

// Common nearby places with improved MaterialCommunityIcons
const NEARBY_TYPES: { type: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; label: string }[] = [
    { type: 'restaurant', icon: 'food', color: '#EF4444', label: 'Restaurants' },
    { type: 'atm', icon: 'bank', color: '#10B981', label: 'ATM/Banks' },
    { type: 'hospital', icon: 'hospital-box', color: '#3B82F6', label: 'Hospital' },
    { type: 'shopping', icon: 'cart', color: '#F59E0B', label: 'Shopping' },
    { type: 'transport', icon: 'train-car', color: '#8B5CF6', label: 'Transport' },
    { type: 'attraction', icon: 'camera-marker', color: '#EC4899', label: 'Attractions' },
];

export default function NearbyAttractions({ hotelLat, hotelLng, city }: NearbyAttractionsProps) {
    const { t } = useTranslation();

    const openMapsSearch = (searchType: string) => {
        let query = `${searchType} near ${city}`;

        if (hotelLat && hotelLng) {
            // If we have coordinates, search near exact location
            if (Platform.OS === 'ios') {
                const url = `maps://app?q=${encodeURIComponent(searchType)}&sll=${hotelLat},${hotelLng}`;
                Linking.openURL(url);
            } else {
                const url = `https://www.google.com/maps/search/${encodeURIComponent(searchType)}/@${hotelLat},${hotelLng},15z`;
                Linking.openURL(url);
            }
        } else {
            // Fallback to city search
            const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
            Linking.openURL(url);
        }
    };

    return (
        <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('hotel.nearbyPlaces', 'Nearby Places')}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            >
                {NEARBY_TYPES.map((place) => (
                    <TouchableOpacity
                        key={place.type}
                        onPress={() => openMapsSearch(place.label)}
                        className="items-center w-16"
                        activeOpacity={0.7}
                    >
                        <View
                            className="w-14 h-14 rounded-lg items-center justify-center mb-2"
                            style={{ backgroundColor: `${place.color}20` }}
                        >
                            <MaterialCommunityIcons name={place.icon} size={26} color={place.color} />
                        </View>
                        <Text className="text-xs text-gray-600 dark:text-gray-400 text-center w-full" numberOfLines={2} ellipsizeMode="tail">
                            {t(`nearby.${place.type}`, place.label)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
