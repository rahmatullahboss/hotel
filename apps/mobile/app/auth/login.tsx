import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { setToken } from '@/lib/api';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithGoogle, loading: googleLoading, error: googleError, isReady } = useGoogleAuth();

    // Button press animation
    const buttonScale = useSharedValue(1);
    const googleButtonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const googleButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: googleButtonScale.value }],
    }));

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/mobile-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            await setToken(data.token);
            router.replace('/(tabs)');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!isReady) {
            setError('Google Sign-In is not configured yet');
            return;
        }
        await signInWithGoogle();
    };

    const handleButtonPressIn = (scale: Animated.SharedValue<number>) => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    };

    const handleButtonPressOut = (scale: Animated.SharedValue<number>) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    return (
        <AnimatedGradientBackground>
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* Premium Header */}
                    <Animated.View
                        entering={FadeInDown.duration(600).delay(100)}
                        style={styles.header}
                    >
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={['#F472B6', '#8B5CF6', '#6366F1']}
                                style={styles.logoGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <FontAwesome name="building" size={36} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtitleText}>
                            Sign in to continue to Zinu Rooms
                        </Text>
                    </Animated.View>

                    {/* Glassmorphic Form Card */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(300)}
                        style={styles.formContainer}
                    >
                        <GlassmorphicCard intensity="medium">
                            {/* Error Message */}
                            {(error || googleError) && (
                                <Animated.View
                                    entering={FadeIn.duration(300)}
                                    style={styles.errorContainer}
                                >
                                    <FontAwesome name="exclamation-circle" size={16} color="#F87171" />
                                    <Text style={styles.errorText}>{error || googleError}</Text>
                                </Animated.View>
                            )}

                            {/* Email Input */}
                            <FloatingLabelInput
                                label="Email address"
                                icon="envelope"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            {/* Password Input */}
                            <FloatingLabelInput
                                label="Password"
                                icon="lock"
                                value={password}
                                onChangeText={setPassword}
                                isPassword
                            />

                            {/* Sign In Button */}
                            <AnimatedPressable
                                style={[styles.signInButton, buttonAnimatedStyle]}
                                onPress={handleLogin}
                                onPressIn={() => handleButtonPressIn(buttonScale)}
                                onPressOut={() => handleButtonPressOut(buttonScale)}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={loading ? ['#9CA3AF', '#6B7280'] : ['#F472B6', '#8B5CF6', '#6366F1']}
                                    style={styles.signInGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.signInText}>Sign In</Text>
                                    )}
                                </LinearGradient>
                            </AnimatedPressable>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Google Sign In */}
                            <AnimatedPressable
                                style={[styles.googleButton, googleButtonAnimatedStyle]}
                                onPress={handleGoogleLogin}
                                onPressIn={() => handleButtonPressIn(googleButtonScale)}
                                onPressOut={() => handleButtonPressOut(googleButtonScale)}
                                disabled={googleLoading || loading}
                            >
                                {googleLoading ? (
                                    <ActivityIndicator size="small" color="#DB4437" />
                                ) : (
                                    <FontAwesome name="google" size={20} color="#fff" />
                                )}
                                <Text style={styles.googleButtonText}>
                                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                                </Text>
                            </AnimatedPressable>
                        </GlassmorphicCard>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View
                        entering={FadeInUp.duration(600).delay(500)}
                        style={styles.footer}
                    >
                        <View style={styles.signUpRow}>
                            <Text style={styles.signUpText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.signUpLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={styles.guestText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AnimatedGradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F472B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },
    errorText: {
        color: '#F87171',
        fontSize: 14,
        flex: 1,
    },
    signInButton: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    signInGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    signInText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 12,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        paddingBottom: 24,
    },
    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    signUpText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 15,
    },
    signUpLink: {
        color: '#F472B6',
        fontSize: 15,
        fontWeight: '600',
    },
    guestButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    guestText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
    },
});
