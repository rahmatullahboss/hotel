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
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { setToken } from '@/lib/api';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { FloatingLabelInput } from '@/components/FloatingLabelInput';
import { GoogleLogo } from '@/components/GoogleLogo';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithGoogle, loading: googleLoading, error: googleError, isReady } = useGoogleAuth();

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

    return (
        <AnimatedGradientBackground>
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <KeyboardAvoidingView
                    style={styles.keyboardView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Premium Header */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={['#E63946', '#C1121F', '#780000']}
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
                        </View>

                        {/* Form Card */}
                        <View style={styles.formContainer}>
                            <GlassmorphicCard intensity="medium">
                                {/* Error Message */}
                                {(error || googleError) && (
                                    <View style={styles.errorContainer}>
                                        <FontAwesome name="exclamation-circle" size={16} color="#F87171" />
                                        <Text style={styles.errorText}>{error || googleError}</Text>
                                    </View>
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
                                <Pressable
                                    style={styles.signInButton}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={loading ? ['#9CA3AF', '#6B7280'] : ['#E63946', '#C1121F', '#780000']}
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
                                </Pressable>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Google Sign In */}
                                <Pressable
                                    style={styles.googleButton}
                                    onPress={handleGoogleLogin}
                                    disabled={googleLoading || loading}
                                >
                                    {googleLoading ? (
                                        <ActivityIndicator size="small" color="#4285F4" />
                                    ) : (
                                        <GoogleLogo size={20} />
                                    )}
                                    <Text style={styles.googleButtonText}>
                                        {googleLoading ? 'Signing in...' : 'Continue with Google'}
                                    </Text>
                                </Pressable>
                            </GlassmorphicCard>
                        </View>

                        {/* Footer - Fixed at bottom */}
                        <View style={styles.footer}>
                            <View style={styles.signUpRow}>
                                <Text style={styles.signUpText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                    <Text style={styles.signUpLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        flexGrow: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
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
        shadowColor: '#E63946',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    formContainer: {
        marginBottom: 24,
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
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#9CA3AF',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    googleButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    signUpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        color: '#6B7280',
        fontSize: 15,
    },
    signUpLink: {
        color: '#E63946',
        fontSize: 15,
        fontWeight: '600',
    },
});
