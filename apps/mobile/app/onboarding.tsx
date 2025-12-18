import { useState, useRef } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
    Animated,
    PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@zinurooms_onboarding_completed';

// Beautiful destination images
const BACKGROUNDS = [
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
];

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [currentBg, setCurrentBg] = useState(0);

    // Animation for swipe button
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [isSliding, setIsSliding] = useState(false);

    const SLIDER_WIDTH = width - 80;
    const BUTTON_SIZE = 56;
    const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_SIZE - 20;

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            router.replace('/(tabs)');
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsSliding(true);
            },
            onPanResponderMove: (_, gestureState) => {
                const newValue = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
                slideAnim.setValue(newValue);
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsSliding(false);
                if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
                    // Complete the slide
                    Animated.spring(slideAnim, {
                        toValue: SLIDE_THRESHOLD,
                        useNativeDriver: false,
                    }).start(() => {
                        completeOnboarding();
                    });
                } else {
                    // Reset
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <View className="flex-1">
            <ImageBackground
                source={{ uri: BACKGROUNDS[currentBg] }}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                    locations={[0, 0.5, 1]}
                    style={{ flex: 1 }}
                >
                    {/* Content */}
                    <View
                        className="flex-1 justify-end"
                        style={{ paddingBottom: insets.bottom + 32, paddingHorizontal: 24 }}
                    >
                        {/* Title */}
                        <Text className="text-white text-4xl font-bold leading-tight mb-4">
                            Easy way to book your{'\n'}hotel with us!
                        </Text>

                        {/* Subtitle */}
                        <Text className="text-white/70 text-base mb-10 leading-6">
                            Also book flight ticket, places, food and many more.
                        </Text>

                        {/* Swipe to Book Button */}
                        <View
                            className="rounded-full overflow-hidden"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.2)',
                            }}
                        >
                            <View
                                className="flex-row items-center justify-between py-2 px-2"
                                style={{ width: SLIDER_WIDTH }}
                            >
                                {/* Slider Button */}
                                <Animated.View
                                    style={{
                                        transform: [{ translateX: slideAnim }],
                                    }}
                                    {...panResponder.panHandlers}
                                >
                                    <View
                                        className="items-center justify-center rounded-full"
                                        style={{
                                            width: BUTTON_SIZE,
                                            height: BUTTON_SIZE,
                                            backgroundColor: '#E63946', // Primary red
                                        }}
                                    >
                                        <FontAwesome name="arrow-right" size={20} color="#fff" />
                                    </View>
                                </Animated.View>

                                {/* Text and Arrows */}
                                <View className="flex-row items-center gap-3 pr-4">
                                    <Text className="text-white font-semibold text-base">
                                        Swipe to Book
                                    </Text>
                                    <Text className="text-white/60">›››</Text>
                                </View>
                            </View>
                        </View>

                        {/* Already have account */}
                        <TouchableOpacity
                            onPress={() => router.push('/auth/login')}
                            className="mt-6 py-2"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white/60 text-center text-sm">
                                Already have an account?{' '}
                                <Text className="text-primary font-semibold">Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

// Export function to check if onboarding is completed
export async function isOnboardingCompleted(): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        return value === 'true';
    } catch {
        return false;
    }
}
