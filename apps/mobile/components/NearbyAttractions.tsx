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

// Common nearby places with OYO-style icons
const NEARBY_TYPES: { type: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; label: string }[] = [
    { type: 'railway', icon: 'train', color: '#6366F1', label: 'Railway Station' },
    { type: 'airport', icon: 'airplane', color: '#0EA5E9', label: 'Airport' },
    { type: 'bus', icon: 'bus-stop', color: '#8B5CF6', label: 'Bus Stand' },
    { type: 'hospital', icon: 'hospital', color: '#EF4444', label: 'Hospital' },
    { type: 'atm', icon: 'credit-card-wireless', color: '#10B981', label: 'ATM' },
    { type: 'landmark', icon: 'map-marker', color: '#F59E0B', label: 'Landmarks' },
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
                contentContainerStyle={{ gap: 8, paddingRight: 16 }}
            >
                {NEARBY_TYPES.map((place) => (
                    <TouchableOpacity
                        key={place.type}
                        onPress={() => openMapsSearch(place.label)}
                        className="items-center"
                        activeOpacity={0.7}
                    >
                        <View
                            className="w-9 h-9 rounded-full items-center justify-center mb-1"
                            style={{ backgroundColor: `${place.color}20` }}
                        >
                            <MaterialCommunityIcons name={place.icon} size={16} color={place.color} />
                        </View>
                        <Text className="text-[10px] text-gray-600 dark:text-gray-400 text-center" style={{ maxWidth: 52 }} numberOfLines={2} ellipsizeMode="tail">
                            {t(`nearby.${place.type}`, place.label)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
