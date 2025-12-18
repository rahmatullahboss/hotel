import { useState, useEffect } from 'react';
import {
    View,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import HotelListWithFilters from '@/components/HotelListWithFilters';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    payAtHotel?: boolean;
}



export default function AllHotelsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [allHotels, setAllHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHotels = async () => {
        // Request higher limit to get all hotels
        const { data, error } = await api.getHotels({ limit: 100 });
        if (!error && data) {
            setAllHotels(data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchHotels();
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: t('allHotels.title'),
                    headerBackTitle: '',
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            <HotelListWithFilters
                hotels={allHotels}
                loading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </View>
    );
}
