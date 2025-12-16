import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { setToken } from '@/lib/api';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                className="flex-1 p-6"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View className="items-center mt-8 mb-10">
                    <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-6">
                        <FontAwesome name="building" size={40} color="#fff" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome Back
                    </Text>
                    <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
                        Sign in to continue to Vibe Hospitality
                    </Text>
                </View>

                {/* Form */}
                <View className="flex-1">
                    {error && (
                        <View className="flex-row items-center p-3 rounded-lg mb-4 bg-red-50 dark:bg-red-900/30 gap-2">
                            <FontAwesome name="exclamation-circle" size={16} color="#EF4444" />
                            <Text className="text-sm text-red-500 flex-1">{error}</Text>
                        </View>
                    )}

                    <View className="flex-row items-center rounded-xl px-4 mb-4 bg-gray-100 dark:bg-gray-800">
                        <FontAwesome name="envelope" size={18} color="#9CA3AF" style={{ width: 24, marginRight: 12 }} />
                        <TextInput
                            className="flex-1 py-4 text-base text-gray-900 dark:text-white"
                            placeholder="Email address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View className="flex-row items-center rounded-xl px-4 mb-4 bg-gray-100 dark:bg-gray-800">
                        <FontAwesome name="lock" size={20} color="#9CA3AF" style={{ width: 24, marginRight: 12 }} />
                        <TextInput
                            className="flex-1 py-4 text-base text-gray-900 dark:text-white"
                            placeholder="Password"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <FontAwesome
                                name={showPassword ? 'eye-slash' : 'eye'}
                                size={18}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`p-4 rounded-xl items-center mt-2 bg-primary ${loading ? 'opacity-70' : ''}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-white text-base font-semibold">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <Text className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</Text>
                        <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </View>

                    <TouchableOpacity
                        className={`flex-row items-center justify-center p-4 rounded-xl gap-3 bg-gray-100 dark:bg-gray-800 ${googleLoading ? 'opacity-70' : ''}`}
                        onPress={handleGoogleLogin}
                        disabled={googleLoading || loading}
                    >
                        {googleLoading ? (
                            <ActivityIndicator size="small" color="#DB4437" />
                        ) : (
                            <FontAwesome name="google" size={20} color="#DB4437" />
                        )}
                        <Text className="text-base font-medium text-gray-900 dark:text-white">
                            {googleLoading ? 'Signing in...' : 'Continue with Google'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="flex-row justify-center mb-4">
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/register')}>
                        <Text className="text-sm font-semibold text-primary">Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="items-center py-3 mb-6"
                    onPress={() => router.replace('/(tabs)')}
                >
                    <Text className="text-sm text-gray-500 dark:text-gray-400">Continue as Guest</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
