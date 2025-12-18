import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
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

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all required fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/api/auth/mobile-register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            // Auto-login after registration
            if (data.token) {
                await setToken(data.token);
                router.replace('/(tabs)');
            } else {
                router.replace('/auth/login');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        if (!isReady) {
            setError('Google Sign-In is not configured yet');
            return;
        }
        await signInWithGoogle();
    };

    const handleButtonPressIn = (scale: { value: number }) => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    };

    const handleButtonPressOut = (scale: { value: number }) => {
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
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Premium Header */}
                        <Animated.View
                            entering={FadeInDown.duration(600).delay(100)}
                            style={styles.header}
                        >
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#E63946', '#C1121F', '#780000']}
                                    style={styles.logoGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <FontAwesome name="building" size={32} color="#fff" />
                                </LinearGradient>
                            </View>
                            <Text style={styles.welcomeText}>Create Account</Text>
                            <Text style={styles.subtitleText}>
                                Join Zinu Rooms for amazing stays
                            </Text>
                        </Animated.View>

                        {/* Glassmorphic Form Card */}
                        <Animated.View
                            entering={FadeInUp.duration(600).delay(300)}
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

                                {/* Google Sign Up - Top priority */}
                                <AnimatedPressable
                                    style={[styles.googleButton, googleButtonAnimatedStyle]}
                                    onPress={handleGoogleSignUp}
                                    onPressIn={() => handleButtonPressIn(googleButtonScale)}
                                    onPressOut={() => handleButtonPressOut(googleButtonScale)}
                                    disabled={googleLoading || loading}
                                >
                                    {googleLoading ? (
                                        <ActivityIndicator size="small" color="#4285F4" />
                                    ) : (
                                        <View style={styles.googleIconContainer}>
                                            <Text style={styles.googleG}>G</Text>
                                        </View>
                                    )}
                                    <Text style={styles.googleButtonText}>
                                        {googleLoading ? 'Signing up...' : 'Continue with Google'}
                                    </Text>
                                </AnimatedPressable>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or sign up with email</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Name Input */}
                                <FloatingLabelInput
                                    label="Full name"
                                    icon="user"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />

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

                                {/* Phone Input */}
                                <FloatingLabelInput
                                    label="Phone number (optional)"
                                    icon="phone"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />

                                {/* Password Input */}
                                <FloatingLabelInput
                                    label="Password"
                                    icon="lock"
                                    value={password}
                                    onChangeText={setPassword}
                                    isPassword
                                />

                                {/* Confirm Password Input */}
                                <FloatingLabelInput
                                    label="Confirm password"
                                    icon="lock"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    isPassword
                                />

                                {/* Create Account Button */}
                                <AnimatedPressable
                                    style={[styles.signUpButton, buttonAnimatedStyle]}
                                    onPress={handleRegister}
                                    onPressIn={() => handleButtonPressIn(buttonScale)}
                                    onPressOut={() => handleButtonPressOut(buttonScale)}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#9CA3AF', '#6B7280'] : ['#E63946', '#C1121F', '#780000']}
                                        style={styles.signUpGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.signUpText}>Create Account</Text>
                                        )}
                                    </LinearGradient>
                                </AnimatedPressable>

                                {/* Terms */}
                                <Text style={styles.termsText}>
                                    By creating an account, you agree to our{' '}
                                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                                    <Text style={styles.termsLink}>Privacy Policy</Text>
                                </Text>
                            </GlassmorphicCard>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.View
                            entering={FadeInUp.duration(600).delay(500)}
                            style={styles.footer}
                        >
                            <View style={styles.signInRow}>
                                <Text style={styles.signInText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                    <Text style={styles.signInLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
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
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoGradient: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#E63946',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
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
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleG: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 13,
        color: '#9CA3AF',
    },
    signUpButton: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    signUpGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    signUpText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    termsText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 18,
    },
    termsLink: {
        color: '#E63946',
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 24,
    },
    signInRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInText: {
        color: '#6B7280',
        fontSize: 15,
    },
    signInLink: {
        color: '#E63946',
        fontSize: 15,
        fontWeight: '600',
    },
});
