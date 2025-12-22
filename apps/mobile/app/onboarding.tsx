import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ImageBackground,
    Animated,
    PanResponder,
    StyleSheet,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@zinurooms_onboarding_completed';

// High-quality vertical/portrait images for better mobile fit
const BACKGROUNDS = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', // Luxury Resort
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80', // Beach Hotel
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80', // Modern Interior
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', // City View
];


export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [currentBg, setCurrentBg] = useState(0);

    // Background Animation
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                // Change image
                setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Slider Animation
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Pulse animation for the arrow
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const SLIDER_WIDTH = width - 48; // Full width minus padding
    const BUTTON_SIZE = 54;
    const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_SIZE - 10;

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
                // Accessing the shared value might be tricky with standard Animated during gestures unless updated
                // But here we rely on the visual update via setValue
            },
            onPanResponderMove: (_, gestureState) => {
                const newValue = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
                slideAnim.setValue(newValue);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
                    // Complete the slide
                    Animated.spring(slideAnim, {
                        toValue: SLIDE_THRESHOLD,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start(() => {
                        completeOnboarding();
                    });
                } else {
                    // Reset
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 10,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <View className="flex-1 bg-black">
            {/* Background Image Layer 1 (Previous/Next) - For smoother transition we could overlay, but simple fade is okay */}
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ImageBackground
                    source={{ uri: BACKGROUNDS[currentBg] }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Absolute positioning to ensure background stays full screen during fade if we were double layering. 
                With current logic, it fades to black then new image fades in. 
                Let's improve: Put the NEXT image behind the current one? 
                Actually, simpler: Just one image fading is "okay" but fading to black is a bit jarring. 
                Let's stick to the single layer fade for simplicity unless requested otherwise, fits "dynamic" requirement.
                Correction: User wants visual beauty ("sundor"). Fading to black is meh.
                Let's try a crossfade trick: Render two images, current and next.
            */}

            {/* Overlay Gradient - Permanent */}
            <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                    locations={[0, 0.4, 0.7, 1]}
                    style={{ flex: 1 }}
                >
                    <View
                        className="flex-1 justify-end px-6"
                        style={{ paddingBottom: insets.bottom + 20 }}
                    >
                        {/* Brand / Logo Area */}
                        <View className="items-start mb-6">
                            <Image 
                                source={require('../assets/images/logo.png')} 
                                style={{ width: 180, height: 100, marginBottom: 16 }}
                                resizeMode="contain"
                            />
                            <Text className="text-white text-5xl font-bold leading-tight tracking-tight">
                                Find your {'\n'}
                                <Text className="text-primary italic">perfect</Text> stay
                            </Text>
                        </View>

                        <Text className="text-gray-300 text-lg leading-6 mb-10 w-11/12">
                            Discover luxury hotels, rare homes, and trending resorts worldwide.
                        </Text>

                        {/* Slider Container */}
                        <View className="mb-6">
                            <View
                                style={{
                                    height: BUTTON_SIZE + 10,
                                    width: SLIDER_WIDTH,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 100,
                                    justifyContent: 'center',
                                    paddingHorizontal: 5,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Slide Text */}
                                <View className="absolute w-full items-center">
                                    <View className="flex-row items-center gap-2 opactiy-80">
                                        <Text className="text-white font-medium text-lg tracking-wide opacity-80">
                                            Swipe to get started
                                        </Text>
                                        <FontAwesome name="angle-double-right" size={18} color="rgba(255,255,255,0.5)" />
                                    </View>
                                </View>

                                {/* Draggable Button */}
                                <Animated.View
                                    style={{
                                        transform: [{ translateX: slideAnim }],
                                        zIndex: 20,
                                    }}
                                    {...panResponder.panHandlers}
                                >
                                    <View
                                        style={{
                                            width: BUTTON_SIZE,
                                            height: BUTTON_SIZE,
                                            borderRadius: BUTTON_SIZE / 2,
                                            backgroundColor: '#E63946',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: '#E63946',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 8,
                                            elevation: 5,
                                        }}
                                    >
                                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                            <FontAwesome name="arrow-right" size={20} color="white" />
                                        </Animated.View>
                                    </View>
                                </Animated.View>
                            </View>
                        </View>

                        {/* Footer Links */}
                        <TouchableOpacity
                            onPress={() => router.push('/auth/login')}
                            className="items-center py-2"
                        >
                            <Text className="text-white/60 text-sm">
                                Already have an account? <Text className="text-white font-semibold underline">Log In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>


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
