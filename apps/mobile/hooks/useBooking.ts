import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '@/lib/api';
import { devLog, devError } from '@/lib/logger';

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
    vibeCode?: string | null;
    category?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    serialNumber?: number | null;
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

interface UseBookingOptions {
    checkIn?: string;
    checkOut?: string;
}

interface UseBookingReturn {
    hotel: Hotel | null;
    rooms: Room[];
    loading: boolean;
    roomsLoading: boolean;
    error: string | null;
    isSaved: boolean;
    savingState: boolean;
    handleToggleSave: () => Promise<void>;
    refetch: () => Promise<void>;
    refetchRooms: () => Promise<void>;
}

export function useBooking(hotelId: string | undefined, options?: UseBookingOptions): UseBookingReturn {
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savingState, setSavingState] = useState(false);

    const checkIn = options?.checkIn;
    const checkOut = options?.checkOut;

    // Fetch rooms with dates
    const fetchRooms = useCallback(async () => {
        if (!hotelId) return;

        setRoomsLoading(true);
        const roomsRes = await api.getRooms(hotelId, checkIn, checkOut);
        if (roomsRes.data) {
            setRooms(roomsRes.data);
        }
        setRoomsLoading(false);
    }, [hotelId, checkIn, checkOut]);

    // Fetch hotel data (without rooms)
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

        // Fetch rooms with dates
        await fetchRooms();

        // Check if hotel is saved
        const savedRes = await api.getSavedHotels();
        if (savedRes.data) {
            const saved = savedRes.data.savedHotels.some((s: any) => s.hotelId === hotelId);
            setIsSaved(saved);
        }

        setLoading(false);
    }, [hotelId, fetchRooms]);

    // Initial fetch
    useEffect(() => {
        if (hotelId) {
            fetchHotelData();
        }
    }, [hotelId]);

    // Refetch rooms when dates change (but not on initial load)
    useEffect(() => {
        if (hotelId && hotel && checkIn && checkOut) {
            fetchRooms();
        }
    }, [checkIn, checkOut]);

    const handleToggleSave = useCallback(async () => {
        if (!hotelId || savingState) return;
        setSavingState(true);

        try {
            if (isSaved) {
                devLog('Attempting to unsave hotel:', hotelId);
                const result = await api.unsaveHotel(hotelId);
                devLog('Unsave result:', result);
                if (result.error) {
                    devError('Unsave error:', result.error);
                    Alert.alert('Error', result.error);
                } else {
                    setIsSaved(false);
                }
            } else {
                devLog('Attempting to save hotel:', hotelId);
                const result = await api.saveHotel(hotelId);
                devLog('Save result:', result);
                if (result.error) {
                    devError('Save error:', result.error);
                    Alert.alert('Error', result.error);
                } else {
                    setIsSaved(true);
                }
            }
        } catch (err) {
            devError('Toggle save error:', err);
            Alert.alert('Error', 'কিছু ভুল হয়েছে');
        }

        setSavingState(false);
    }, [hotelId, isSaved, savingState]);

    return {
        hotel,
        rooms,
        loading,
        roomsLoading,
        error,
        isSaved,
        savingState,
        handleToggleSave,
        refetch: fetchHotelData,
        refetchRooms: fetchRooms,
    };
}

