import { useState, useCallback, useEffect } from 'react';
import { GoogleSignin, statusCodes, isSuccessResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { setToken } from '@/lib/api';
import { useRouter } from 'expo-router';

// Configure Google Sign-In once
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    offlineAccess: true,
    scopes: ['profile', 'email'],
});

interface GoogleAuthResult {
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        image?: string;
    };
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

            // Check if Google Play Services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign in
            const response = await GoogleSignin.signIn();

            if (isSuccessResponse(response)) {
                const { data } = response;
                const idToken = data.idToken;
                const user = data.user;

                if (!idToken) {
                    setError('No ID token received');
                    setLoading(false);
                    return { success: false, error: 'No ID token received' };
                }

                // Send to backend
                const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/auth/mobile-google`, {
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

                const authData = await res.json();

                if (!res.ok) {
                    setError(authData.error || 'Authentication failed');
                    setLoading(false);
                    return { success: false, error: authData.error };
                }

                // Store the JWT token
                await setToken(authData.token);

                // Navigate to home
                router.replace('/(tabs)');

                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name || user.givenName || '',
                        image: user.photo || undefined,
                    },
                };
            } else {
                setError('Sign in was cancelled');
                setLoading(false);
                return { success: false, error: 'Sign in was cancelled' };
            }
        } catch (err) {
            let errorMessage = 'Unknown error occurred';

            if (isErrorWithCode(err)) {
                switch (err.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        errorMessage = 'Sign in cancelled';
                        break;
                    case statusCodes.IN_PROGRESS:
                        errorMessage = 'Sign in already in progress';
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        errorMessage = 'Google Play Services not available';
                        break;
                    default:
                        errorMessage = err.message || 'Google Sign-In failed';
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            console.error('Google Sign-In error:', err);
            setError(errorMessage);
            setLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [router]);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            await GoogleSignin.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    }, []);

    return {
        signInWithGoogle,
        signOut,
        loading,
        error,
        isReady: true, // Native SDK is always ready
    };
}
