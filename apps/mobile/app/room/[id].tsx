import { useRef } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

// Sample amenities data
const amenities = [
    { id: '1', name: 'WiFi', icon: 'wifi' as const },
    { id: '2', name: 'AC', icon: 'snowflake-o' as const },
    { id: '3', name: 'TV', icon: 'television' as const },
    { id: '4', name: 'Parking', icon: 'car' as const },
    { id: '5', name: 'Pool', icon: 'tint' as const },
    { id: '6', name: 'Gym', icon: 'heartbeat' as const },
];

export default function RoomDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const scrollY = useRef(new Animated.Value(0)).current;

    // Parallax effect calculations
    const headerTranslate = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT],
        outputRange: [0, -HEADER_HEIGHT / 2],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
        inputRange: [-100, 0],
        outputRange: [1.5, 1],
        extrapolate: 'clamp',
    });

    const renderAmenityItem = ({ item }: { item: typeof amenities[0] }) => (
        <View className="items-center justify-center px-4 py-3 mr-3 bg-gray-100 rounded-xl">
            <FontAwesome name={item.icon} size={24} color="#E63946" />
            <Text className="mt-2 text-xs font-medium text-gray-700">{item.name}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerTransparent: true,
                    headerBackTitle: 'Back',
                    headerTintColor: '#fff',
                }}
            />

            {/* Parallax Header Image */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_HEIGHT,
                    transform: [{ translateY: headerTranslate }, { scale: headerScale }],
                    opacity: headerOpacity,
                    zIndex: 0,
                }}
            >
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                {/* Gradient overlay */}
                <View className="absolute inset-0 bg-black/30" />
            </Animated.View>

            {/* Scrollable Content */}
            <Animated.ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingTop: HEADER_HEIGHT,
                    paddingBottom: 100, // Space for fixed button
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Content Card */}
                <View className="bg-white -mt-6 rounded-t-3xl min-h-screen">
                    {/* Price and Title Section */}
                    <View className="p-5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-2xl font-bold text-primary">
                                $50<Text className="text-sm font-normal text-gray-500">/night</Text>
                            </Text>
                            <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-lg">
                                <FontAwesome name="star" size={14} color="#F59E0B" />
                                <Text className="ml-1 text-sm font-semibold text-yellow-700">4.8</Text>
                            </View>
                        </View>

                        <Text className="mt-3 text-xl font-bold text-gray-900">
                            Deluxe King Room
                        </Text>

                        <Text className="mt-2 text-gray-600 leading-6">
                            Experience luxury and comfort in our spacious Deluxe King Room.
                            Perfect for couples or solo travelers seeking a premium stay.
                        </Text>
                    </View>

                    {/* Amenities Section */}
                    <View className="mt-4">
                        <Text className="px-5 mb-3 text-lg font-bold text-gray-900">
                            Amenities
                        </Text>
                        <FlatList
                            data={amenities}
                            renderItem={renderAmenityItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                        />
                    </View>

                    {/* Room Details Section */}
                    <View className="p-5 mt-4">
                        <Text className="mb-3 text-lg font-bold text-gray-900">
                            Room Details
                        </Text>
                        <View className="flex-row flex-wrap gap-4">
                            <View className="flex-row items-center">
                                <FontAwesome name="users" size={16} color="#6B7280" />
                                <Text className="ml-2 text-gray-600">2 Guests</Text>
                            </View>
                            <View className="flex-row items-center">
                                <FontAwesome name="bed" size={16} color="#6B7280" />
                                <Text className="ml-2 text-gray-600">1 King Bed</Text>
                            </View>
                            <View className="flex-row items-center">
                                <FontAwesome name="arrows-alt" size={16} color="#6B7280" />
                                <Text className="ml-2 text-gray-600">32 m²</Text>
                            </View>
                        </View>
                    </View>

                    {/* House Rules */}
                    <View className="p-5 mt-2 bg-gray-50">
                        <Text className="mb-3 text-lg font-bold text-gray-900">
                            House Rules
                        </Text>
                        <View className="space-y-2">
                            <Text className="text-gray-600">• Check-in: 2:00 PM</Text>
                            <Text className="text-gray-600">• Check-out: 12:00 PM</Text>
                            <Text className="text-gray-600">• No smoking</Text>
                            <Text className="text-gray-600">• No pets allowed</Text>
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* Fixed Book Now Button */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-200"
                style={{
                    paddingBottom: 34, // Extra padding for iPhone home indicator
                }}
            >
                <TouchableOpacity
                    className="bg-primary py-4 rounded-xl items-center justify-center shadow-lg"
                    onPress={() => router.push(`/booking/${id}`)}
                    activeOpacity={0.85}
                >
                    <Text className="text-white text-lg font-bold">Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
