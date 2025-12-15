import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '@/lib/api';

interface Hotel {
    id: string;
    name: string;
    city: string;
    address: string;
    rating: string | number;
    description: string;
    coverImage: string;
    images: string[];
    amenities: string[];
    rooms?: Room[];
}

interface Room {
    id: string;
    name: string;
    type: string;
    description: string;
    basePrice: string | number;
    dynamicPrice?: number;
    totalDynamicPrice?: number;
    nights?: number;
    maxGuests: number;
    photos: string[];
    isAvailable?: boolean;
    priceBreakdown?: {
        multiplier: number;
        rules: Array<{ name: string; description: string }>;
    };
    // Room grouping fields (for "X rooms available" display)
    availableCount?: number;
    totalCount?: number;
    roomIds?: string[];
}

interface UseBookingReturn {
    hotel: Hotel | null;
    rooms: Room[];
    loading: boolean;
    error: string | null;
    isSaved: boolean;
    savingState: boolean;
    handleToggleSave: () => Promise<void>;
    refetch: () => Promise<void>;
}

export function useBooking(hotelId: string | undefined): UseBookingReturn {
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savingState, setSavingState] = useState(false);

    const fetchHotelData = useCallback(async () => {
        if (!hotelId) return;

        setLoading(true);
        setError(null);

        const hotelRes = await api.getHotel(hotelId);

        if (hotelRes.error) {
            setError(hotelRes.error);
            setLoading(false);
            return;
        }

        setHotel(hotelRes.data);

        // Always fetch rooms from API endpoint to get dynamic pricing
        const roomsRes = await api.getRooms(hotelId);
        if (roomsRes.data) {
            setRooms(roomsRes.data);
        }

        // Check if hotel is saved
        const savedRes = await api.getSavedHotels();
        if (savedRes.data) {
            const saved = savedRes.data.savedHotels.some((s: any) => s.hotelId === hotelId);
            setIsSaved(saved);
        }

        setLoading(false);
    }, [hotelId]);

    useEffect(() => {
        if (hotelId) {
            fetchHotelData();
        }
    }, [hotelId, fetchHotelData]);

    const handleToggleSave = useCallback(async () => {
        if (!hotelId || savingState) return;
        setSavingState(true);

        try {
            if (isSaved) {
                console.log('Attempting to unsave hotel:', hotelId);
                const result = await api.unsaveHotel(hotelId);
                console.log('Unsave result:', result);
                if (result.error) {
                    console.error('Unsave error:', result.error);
                    Alert.alert('Error', result.error);
                } else {
                    setIsSaved(false);
                }
            } else {
                console.log('Attempting to save hotel:', hotelId);
                const result = await api.saveHotel(hotelId);
                console.log('Save result:', result);
                if (result.error) {
                    console.error('Save error:', result.error);
                    Alert.alert('Error', result.error);
                } else {
                    setIsSaved(true);
                }
            }
        } catch (err) {
            console.error('Toggle save error:', err);
            Alert.alert('Error', 'কিছু ভুল হয়েছে');
        }

        setSavingState(false);
    }, [hotelId, isSaved, savingState]);

    return {
        hotel,
        rooms,
        loading,
        error,
        isSaved,
        savingState,
        handleToggleSave,
        refetch: fetchHotelData,
    };
}
