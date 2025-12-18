import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/lib/api';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    vibeCode?: string | null;
    serialNumber?: number | null;
    isSaved?: boolean;
}

interface HotelCardProps {
    hotel: Hotel;
    index: number;
    distance?: number;
}

export default function HotelCard({ hotel, index, distance }: HotelCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [isSaved, setIsSaved] = useState(hotel.isSaved || false);
    const [saving, setSaving] = useState(false);

    // Generate Zinu ID
    const zinuId = hotel.vibeCode
        ? hotel.vibeCode
        : hotel.serialNumber
            ? `ZN${hotel.serialNumber.toString().padStart(4, '0')}`
            : `ZN${(index + 1).toString().padStart(4, '0')}`;

    const handlePress = () => {
        router.push({
            pathname: `/hotel/${hotel.id}`,
            params: { zinuId }
        } as any);
    };

    const handleSaveToggle = async () => {
        if (saving) return;

        setSaving(true);
        const wasGaved = isSaved;

        // Optimistic update
        setIsSaved(!isSaved);

        try {
            if (wasGaved) {
                const { error } = await api.unsaveHotel(hotel.id);
                if (error) {
                    setIsSaved(true); // Revert on error
                }
            } else {
                const { error } = await api.saveHotel(hotel.id);
                if (error) {
                    setIsSaved(false); // Revert on error
                }
            }
        } catch (e) {
            setIsSaved(wasGaved); // Revert on error
        } finally {
            setSaving(false);
        }
    };

    const rating = Number(hotel.rating || 0).toFixed(1);

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.95}
            style={{ marginBottom: 20 }}
        >
            <View
                className="overflow-hidden"
                style={{
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 8,
                }}
            >
                {/* Full Bleed Image */}
                <View className="relative">
                    <Image
                        source={{
                            uri: hotel.imageUrl || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
                        }}
                        className="w-full"
                        style={{
                            height: 280,
                            borderRadius: 24,
                        }}
                        resizeMode="cover"
                    />

                    {/* Smooth Gradient Overlay at Bottom */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
                        locations={[0, 0.5, 1]}
                        className="absolute bottom-0 left-0 right-0 h-40"
                        style={{
                            borderBottomLeftRadius: 24,
                            borderBottomRightRadius: 24,
                        }}
                        pointerEvents="none"
                    />

                    {/* Text Content on Overlay */}
                    <View className="absolute bottom-0 left-0 right-0 px-5 pb-5 pr-16">
                        {/* Location with pin */}
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <FontAwesome name="map-marker" size={14} color="rgba(255,255,255,0.85)" />
                            <Text className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>
                                {hotel.city}
                            </Text>
                        </View>

                        {/* Hotel Name */}
                        <Text className="text-xl font-bold text-white mb-1" numberOfLines={1}>
                            {hotel.name}
                        </Text>

                        {/* Price */}
                        <Text className="text-lg font-bold text-white">
                            ৳{hotel.lowestPrice?.toLocaleString() || '0'}<Text className="text-sm font-normal text-white/70">/night</Text>
                        </Text>
                    </View>

                    {/* Arrow Button - Bottom Right */}
                    <TouchableOpacity
                        onPress={handlePress}
                        className="absolute bottom-4 right-4 w-12 h-12 rounded-full items-center justify-center bg-white"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.15,
                            shadowRadius: 4,
                            elevation: 4,
                        }}
                    >
                        <FontAwesome name="arrow-right" size={16} color="#1F2937" style={{ transform: [{ rotate: '-45deg' }] }} />
                    </TouchableOpacity>

                    {/* Rating Badge - Top Left (Dark Glassmorphism) */}
                    <View
                        className="absolute top-4 left-4 flex-row items-center px-3 py-2 gap-1.5"
                        style={{
                            borderRadius: 20,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.2)',
                        }}
                    >
                        <FontAwesome name="star" size={14} color="#FBBF24" />
                        <Text className="text-white font-bold text-sm">
                            {rating}
                        </Text>
                    </View>

                    {/* Heart Button - Top Right */}
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            handleSaveToggle();
                        }}
                        disabled={saving}
                        className="absolute top-4 right-4 w-11 h-11 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: isSaved ? '#EF4444' : 'rgba(0,0,0,0.4)',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        <FontAwesome
                            name={isSaved ? 'heart' : 'heart-o'}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>

                    {/* Distance Badge (for nearby hotels) */}
                    {distance !== undefined && (
                        <View
                            className="absolute top-16 left-4 px-3 py-1.5 bg-blue-500"
                            style={{ borderRadius: 10 }}
                        >
                            <Text className="text-white text-xs font-bold">
                                {distance.toFixed(1)} km
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
