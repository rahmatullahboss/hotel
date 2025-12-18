import { useRouter } from 'expo-router';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface Hotel {
    id: string;
    name: string;
    city: string;
    rating: string | number;
    imageUrl: string;
    lowestPrice?: number;
    vibeCode?: string | null;
    serialNumber?: number | null;
}

interface HotelCardProps {
    hotel: Hotel;
    index: number;
    distance?: number;
}

export default function HotelCard({ hotel, index, distance }: HotelCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [isSaved, setIsSaved] = useState(false);

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
                    <View className="absolute bottom-0 left-0 right-16 px-5 pb-5">
                        {/* Location with pin */}
                        <View className="flex-row items-center gap-1.5 mb-1">
                            <FontAwesome name="map-marker" size={14} color="rgba(255,255,255,0.85)" />
                            <Text className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                {hotel.city}
                            </Text>
                        </View>

                        {/* Hotel Name */}
                        <Text className="text-xl font-bold text-white mb-1" numberOfLines={1}>
                            {hotel.name}
                        </Text>

                        {/* Price */}
                        <View className="flex-row items-baseline">
                            <Text className="text-lg font-bold text-white">
                                ৳{hotel.lowestPrice?.toLocaleString() || '0'}
                            </Text>
                            <Text className="text-sm text-white/70 ml-1">/ night</Text>
                        </View>
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

                    {/* Rating Badge - Top Left (Dark glass blur effect) */}
                    <BlurView
                        intensity={80}
                        tint="dark"
                        className="absolute top-4 left-4 flex-row items-center px-3 py-2 gap-1.5 overflow-hidden"
                        style={{
                            borderRadius: 20,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                        }}
                    >
                        <FontAwesome name="star" size={14} color="#FBBF24" />
                        <Text className="text-white font-bold text-sm">
                            {rating}
                        </Text>
                    </BlurView>

                    {/* Heart Button - Top Right */}
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            setIsSaved(!isSaved);
                        }}
                        className="absolute top-4 right-4 w-11 h-11 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: isSaved ? '#EF4444' : 'rgba(0,0,0,0.4)',
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
