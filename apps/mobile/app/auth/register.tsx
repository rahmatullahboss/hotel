import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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

            router.replace('/auth/login');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Create Account',
                    headerBackTitle: 'Back',
                    headerTintColor: '#111827',
                    headerStyle: { backgroundColor: '#fff' },
                }}
            />
            <KeyboardAvoidingView
                className="flex-1 p-6 bg-white dark:bg-gray-900"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Join Vibe Hospitality
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-gray-400">
                            Create an account to start booking amazing stays
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
                            <FontAwesome name="user" size={18} color="#9CA3AF" style={{ width: 24, marginRight: 12 }} />
                            <TextInput
                                className="flex-1 py-4 text-base text-gray-900 dark:text-white"
                                placeholder="Full name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

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
                            <FontAwesome name="phone" size={18} color="#9CA3AF" style={{ width: 24, marginRight: 12 }} />
                            <TextInput
                                className="flex-1 py-4 text-base text-gray-900 dark:text-white"
                                placeholder="Phone number (optional)"
                                placeholderTextColor="#9CA3AF"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
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

                        <View className="flex-row items-center rounded-xl px-4 mb-4 bg-gray-100 dark:bg-gray-800">
                            <FontAwesome name="lock" size={20} color="#9CA3AF" style={{ width: 24, marginRight: 12 }} />
                            <TextInput
                                className="flex-1 py-4 text-base text-gray-900 dark:text-white"
                                placeholder="Confirm password"
                                placeholderTextColor="#9CA3AF"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        <TouchableOpacity
                            className={`p-4 rounded-xl items-center mt-2 bg-primary ${loading ? 'opacity-70' : ''}`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text className="text-white text-base font-semibold">
                                {loading ? 'Creating account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 leading-5">
                            By creating an account, you agree to our{' '}
                            <Text className="text-primary">Terms of Service</Text> and{' '}
                            <Text className="text-primary">Privacy Policy</Text>
                        </Text>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-8 mb-6">
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text className="text-sm font-semibold text-primary">Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}
