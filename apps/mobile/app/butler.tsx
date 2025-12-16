import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

interface ServiceItem {
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
    category: 'room' | 'food' | 'amenity';
}

const BUTLER_SERVICES: ServiceItem[] = [
    // Room Services
    { id: 'housekeeping', icon: 'bed', title: 'Housekeeping', description: 'Room cleaning & fresh linens', color: '#3B82F6', category: 'room' },
    { id: 'towels', icon: 'shower', title: 'Extra Towels', description: 'Request additional towels', color: '#06B6D4', category: 'room' },
    { id: 'maintenance', icon: 'wrench', title: 'Maintenance', description: 'Report issues or repairs', color: '#F59E0B', category: 'room' },
    { id: 'laundry', icon: 'recycle', title: 'Laundry Service', description: 'Clothes wash & iron', color: '#8B5CF6', category: 'room' },
    // Food & Beverage
    { id: 'breakfast', icon: 'cutlery', title: 'Room Service', description: 'Order food to your room', color: '#EF4444', category: 'food' },
    { id: 'water', icon: 'tint', title: 'Drinking Water', description: 'Request water bottles', color: '#0EA5E9', category: 'food' },
    { id: 'tea', icon: 'coffee', title: 'Tea/Coffee', description: 'Hot beverages delivery', color: '#78350F', category: 'food' },
    // Amenities
    { id: 'wifi', icon: 'wifi', title: 'WiFi Help', description: 'Connection issues', color: '#10B981', category: 'amenity' },
    { id: 'ac', icon: 'snowflake-o', title: 'AC Issues', description: 'Temperature problems', color: '#6366F1', category: 'amenity' },
    { id: 'checkout', icon: 'sign-out', title: 'Late Checkout', description: 'Request extended stay', color: '#EC4899', category: 'amenity' },
];

export default function ButlerScreen() {
    const { bookingId, hotelName } = useLocalSearchParams<{ bookingId: string; hotelName: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [requestedServices, setRequestedServices] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    const handleServiceRequest = async (service: ServiceItem) => {
        if (requestedServices.includes(service.id)) {
            Alert.alert(
                t('butler.alreadyRequested', 'Already Requested'),
                t('butler.waitMessage', 'Our staff is working on your {{service}} request.', { service: service.title })
            );
            return;
        }

        setLoading(service.id);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate API call
        setTimeout(() => {
            setRequestedServices(prev => [...prev, service.id]);
            setLoading(null);

            Alert.alert(
                t('butler.requestSent', 'Request Sent! ✓'),
                t('butler.confirmMessage', '{{service}} has been requested. Our staff will attend to you shortly.', { service: service.title }),
                [{ text: 'OK' }]
            );
        }, 1000);
    };

    const renderServiceCard = (service: ServiceItem) => {
        const isRequested = requestedServices.includes(service.id);
        const isLoading = loading === service.id;

        return (
            <TouchableOpacity
                key={service.id}
                onPress={() => handleServiceRequest(service)}
                disabled={isLoading}
                className={`p-4 rounded-xl mb-3 ${isDark ? 'bg-gray-800' : 'bg-white'} ${isRequested ? 'opacity-60' : ''}`}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${service.color}20` }}
                    >
                        <FontAwesome name={service.icon as any} size={20} color={service.color} />
                    </View>
                    <View className="flex-1">
                        <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t(`butler.services.${service.id}`, service.title)}
                        </Text>
                        <Text className="text-sm text-gray-500">
                            {t(`butler.desc.${service.id}`, service.description)}
                        </Text>
                    </View>
                    {isRequested ? (
                        <View className="px-3 py-1 rounded-full bg-green-100">
                            <Text className="text-xs font-semibold text-green-600">
                                {t('butler.requested', 'Requested')}
                            </Text>
                        </View>
                    ) : isLoading ? (
                        <Text className="text-sm text-gray-400">...</Text>
                    ) : (
                        <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const roomServices = BUTLER_SERVICES.filter(s => s.category === 'room');
    const foodServices = BUTLER_SERVICES.filter(s => s.category === 'food');
    const amenityServices = BUTLER_SERVICES.filter(s => s.category === 'amenity');

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('butler.title', 'Butler Service'),
                    headerStyle: { backgroundColor: isDark ? '#1f2937' : '#fff' },
                    headerTintColor: isDark ? '#fff' : '#111',
                }}
            />
            <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {/* Header Info */}
                    <View className={`p-4 rounded-xl mt-4 mb-4 ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}>
                        <Text className="text-lg font-bold text-primary">
                            {hotelName || t('butler.yourStay', 'Your Stay')}
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {t('butler.subtitle', 'Tap any service to request it. Our staff will attend to you promptly.')}
                        </Text>
                    </View>

                    {/* Room Services */}
                    <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('butler.roomServices', 'Room Services')}
                    </Text>
                    {roomServices.map(renderServiceCard)}

                    {/* Food & Beverage */}
                    <Text className={`text-base font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('butler.foodBeverage', 'Food & Beverage')}
                    </Text>
                    {foodServices.map(renderServiceCard)}

                    {/* Amenities */}
                    <Text className={`text-base font-semibold mb-3 mt-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t('butler.amenities', 'Amenities & Support')}
                    </Text>
                    {amenityServices.map(renderServiceCard)}

                    {/* Emergency Contact */}
                    <TouchableOpacity
                        className="flex-row items-center p-4 rounded-xl mt-4 mb-8 bg-red-50 dark:bg-red-900/20"
                        onPress={() => Alert.alert(
                            t('butler.emergency', 'Emergency Contact'),
                            t('butler.emergencyMessage', 'For emergencies, please call the front desk directly or dial the emergency number provided in your room.')
                        )}
                    >
                        <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
                            <FontAwesome name="exclamation-circle" size={24} color="#DC2626" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-red-600">
                                {t('butler.emergencyTitle', 'Emergency?')}
                            </Text>
                            <Text className="text-sm text-red-500">
                                {t('butler.emergencySubtitle', 'Tap here for urgent assistance')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </>
    );
}
