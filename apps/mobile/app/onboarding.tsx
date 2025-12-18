import { useState, useRef } from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const ONBOARDING_KEY = '@zinurooms_onboarding_completed';

interface OnboardingSlide {
    id: string;
    icon: string;
    iconColor: string;
    bgColor: string;
    title: string;
    description: string;
}

const SLIDES: OnboardingSlide[] = [
    {
        id: '1',
        icon: 'building',
        iconColor: '#E63946',
        bgColor: '#FEE2E2',
        title: 'Welcome to Zinu Rooms',
        description: 'Find and book the perfect hotel for your next adventure. Thousands of verified hotels at your fingertips.',
    },
    {
        id: '2',
        icon: 'bolt',
        iconColor: '#F59E0B',
        bgColor: '#FEF3C7',
        title: 'Instant Booking',
        description: 'Book your stay in seconds. Pay online or at the hotel - you choose what works best for you.',
    },
    {
        id: '3',
        icon: 'gift',
        iconColor: '#10B981',
        bgColor: '#D1FAE5',
        title: 'Earn Rewards',
        description: 'Get 5% cashback on every booking. Unlock badges, maintain streaks, and earn exclusive perks.',
    },
    {
        id: '4',
        icon: 'qrcode',
        iconColor: '#3B82F6',
        bgColor: '#DBEAFE',
        title: 'Self Check-in',
        description: 'Skip the queue! Use your QR code for instant self check-in and check-out at partner hotels.',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error saving onboarding state:', error);
            router.replace('/(tabs)');
        }
    };

    const goToNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            completeOnboarding();
        }
    };

    const skipOnboarding = () => {
        completeOnboarding();
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => (
        <View style={{ width, flex: 1 }} className="items-center px-8">
            <View className="flex-1 items-center justify-center">
                {/* Icon Container */}
                <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-10"
                    style={{ backgroundColor: item.bgColor }}
                >
                    <FontAwesome name={item.icon as any} size={56} color={item.iconColor} />
                </View>

                {/* Title */}
                <Text
                    className="text-3xl font-bold text-gray-900 text-center mb-4 px-4"
                    numberOfLines={0}
                >
                    {t(`onboarding.slide${item.id}.title`, item.title)}
                </Text>

                {/* Description */}
                <View className="w-full px-4">
                    <Text
                        className="text-base text-gray-500 text-center leading-7"
                        numberOfLines={0}
                    >
                        {t(`onboarding.slide${item.id}.description`, item.description)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderDots = () => (
        <View className="flex-row items-center justify-center gap-2">
            {SLIDES.map((_, index) => (
                <View
                    key={index}
                    className={`h-2 rounded-full transition-all ${index === currentIndex ? 'bg-primary w-6' : 'bg-gray-300 w-2'
                        }`}
                />
            ))}
        </View>
    );

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Skip Button */}
            <View className="absolute top-0 right-0 z-10" style={{ paddingTop: insets.top + 16, paddingRight: 20 }}>
                <TouchableOpacity onPress={skipOnboarding}>
                    <Text className="text-gray-500 font-medium text-base">
                        {t('onboarding.skip', 'Skip')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                className="flex-1"
                contentContainerStyle={{ alignItems: 'center' }}
            />

            {/* Bottom Section */}
            <View className="px-6 pb-8" style={{ paddingBottom: insets.bottom + 24 }}>
                {/* Dots */}
                {renderDots()}

                {/* Buttons */}
                <View className="mt-8 gap-3">
                    <TouchableOpacity
                        onPress={goToNext}
                        className="bg-primary py-4 rounded-xl"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {currentIndex === SLIDES.length - 1
                                ? t('onboarding.getStarted', 'Get Started')
                                : t('onboarding.next', 'Next')
                            }
                        </Text>
                    </TouchableOpacity>

                    {currentIndex === SLIDES.length - 1 && (
                        <TouchableOpacity
                            onPress={() => router.push('/auth/login')}
                            className="py-3"
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-500 text-center font-medium">
                                {t('onboarding.alreadyHaveAccount', 'Already have an account?')}{' '}
                                <Text className="text-primary font-bold">
                                    {t('onboarding.login', 'Login')}
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
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
