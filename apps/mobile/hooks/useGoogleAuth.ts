import { useState, useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setToken } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import api from '@/lib/api';
import { devLog, devWarn, devError } from '@/lib/logger';

// API URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL environment variable is required');
}

// Configure Google Sign-In once
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    offlineAccess: true,
    scopes: ['profile', 'email'],
});

interface GoogleAuthResult {
    success: boolean;
    error?: string;
}

interface GoogleUser {
    email: string;
    name?: string;
    givenName?: string;
    photo?: string;
    id: string;
}

export function useGoogleAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sign in with Google
    const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
        try {
            setLoading(true);
            setError(null);

            devLog('Starting Google Sign-In...');

            // Check if Google Play Services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            devLog('Play Services OK');

            // Sign in - returns user info directly
            const signInResult = await GoogleSignin.signIn();
            devLog('Sign-In completed');

            // Extract user from the response - check different possible structures
            let user: GoogleUser | null = null;
            let idToken: string | null = null;

            // New SDK structure: { type: 'success', data: { user, idToken } }
            if (signInResult && typeof signInResult === 'object') {
                if ('data' in signInResult && signInResult.data) {
                    user = (signInResult as any).data.user;
                    idToken = (signInResult as any).data.idToken;
                    devLog('Found user in data.user');
                } else if ('user' in signInResult) {
                    // Old SDK structure: { user, idToken }
                    user = (signInResult as any).user;
                    idToken = (signInResult as any).idToken;
                    devLog('Found user in root.user');
                }
            }

            // If no idToken from signIn, try getTokens
            if (!idToken) {
                devLog('Getting tokens separately...');
                try {
                    const tokens = await GoogleSignin.getTokens();
                    idToken = tokens.idToken;
                    devLog('Got idToken from getTokens:', idToken ? 'Yes' : 'No');
                } catch (tokenErr) {
                    devError('getTokens error:', tokenErr);
                }
            }

            if (!user) {
                devError('No user data received from Google Sign-In');
                setError('No user data received');
                setLoading(false);
                return { success: false, error: 'No user data received' };
            }

            if (!idToken) {
                devError('No ID token received from Google Sign-In');
                setError('No ID token received');
                setLoading(false);
                Alert.alert('Error', 'Authentication failed. Please try again.');
                return { success: false, error: 'No ID token received' };
            }

            devLog('User authenticated, sending to backend...');

            const res = await fetch(`${API_URL}/api/mobile/google-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    userInfo: {
                        email: user.email,
                        name: user.name || user.givenName || 'User',
                        picture: user.photo,
                        sub: user.id,
                    }
                }),
            });

            devLog('Backend response status:', res.status);
            const authData = await res.json();

            if (!res.ok) {
                const errorMsg = authData.error || 'Backend authentication failed';
                devError('Backend error:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                Alert.alert('Authentication Error', errorMsg);
                return { success: false, error: errorMsg };
            }

            // Store the JWT token securely
            await setToken(authData.token);
            devLog('Token stored successfully');

            // Register for push notifications after successful login
            await registerPushNotifications(authData.token);

            // Navigate to home
            setLoading(false);
            router.replace('/(tabs)');

            return { success: true };

        } catch (err: unknown) {
            const error = err as { code?: string; message?: string };
            let errorMessage = 'Unknown error occurred';

            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                errorMessage = 'Sign in cancelled';
            } else if (error.code === statusCodes.IN_PROGRESS) {
                errorMessage = 'Sign in already in progress';
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                errorMessage = 'Google Play Services not available';
            } else {
                errorMessage = error.message || 'Google Sign-In failed';
            }

            devError('Google Sign-In error:', error);
            setError(errorMessage);
            setLoading(false);

            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Sign-In Error', errorMessage);
            }

            return { success: false, error: errorMessage };
        }
    }, [router]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            await GoogleSignin.signOut();
            devLog('User signed out');
        } catch (err) {
            devError('Sign out error:', err);
        }
    }, []);

    return {
        signInWithGoogle,
        signOut,
        loading,
        error,
        isReady: true,
    };
}

/**
 * Register for push notifications after successful login
 */
async function registerPushNotifications(authToken: string): Promise<void> {
    try {
        devLog('🔔 Registering for push notifications...');

        if (!Device.isDevice) {
            devLog('🔔 Push notifications require a physical device');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            devLog('🔔 Requesting notification permission...');
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            devLog('🔔 Notification permission not granted');
            return;
        }

        // Set up Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#E63946',
            });
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
            devWarn('🔔 Project ID not found in app configuration');
            return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const pushToken = tokenData.data;
        devLog('🔔 Push Token obtained');

        const { error: pushError } = await api.registerPushToken(
            pushToken,
            Platform.OS as 'ios' | 'android',
            authToken
        );

        if (pushError) {
            devWarn('🔔 Failed to register push token:', pushError);
        } else {
            devLog('🔔 Push token registered successfully!');
        }
    } catch (pushErr) {
        devWarn('🔔 Push notification setup error:', pushErr);
    }
}
