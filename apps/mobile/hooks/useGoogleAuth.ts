import { useState, useEffect, useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { setToken } from '@/lib/api';
import { useRouter } from 'expo-router';

// Required for web browser auth to complete properly
WebBrowser.maybeCompleteAuthSession();

// Environment variables - using only web client ID for OAuth
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

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

    // Configure Google auth request
    // Using only web client ID (Android/iOS native clients don't support custom URI schemes)
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
    });

    // Handle auth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.idToken) {
                handleGoogleToken(authentication.idToken, authentication.accessToken || undefined);
            } else if (authentication?.accessToken) {
                // If no idToken, try to get user info with accessToken
                fetchUserInfo(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            setError(response.error?.message || 'Google authentication failed');
            setLoading(false);
        } else if (response?.type === 'cancel') {
            setLoading(false);
        }
    }, [response]);

    // Fetch user info using access token
    const fetchUserInfo = useCallback(async (accessToken: string) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userInfo = await res.json();

            // Send to our backend
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const authRes = await fetch(`${API_URL}/api/auth/mobile-google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accessToken,
                    userInfo: {
                        email: userInfo.email,
                        name: userInfo.name,
                        picture: userInfo.picture,
                        sub: userInfo.id,
                    }
                }),
            });

            const data = await authRes.json();

            if (!authRes.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            await setToken(data.token);
            router.replace('/(tabs)');
        } catch (err) {
            setError('Failed to get user info');
            setLoading(false);
        }
    }, [router]);

    // Exchange Google token with backend
    const handleGoogleToken = useCallback(async (idToken: string, accessToken?: string) => {
        try {
            setLoading(true);
            setError(null);

            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/auth/mobile-google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken, accessToken }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Authentication failed');
                setLoading(false);
                return;
            }

            // Store the JWT token
            await setToken(data.token);

            // Navigate to home
            router.replace('/(tabs)');
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    }, [router]);

    // Trigger Google sign-in
    const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
        try {
            setLoading(true);
            setError(null);

            if (!request) {
                setError('Google auth not configured. Check your EXPO_PUBLIC_GOOGLE_CLIENT_ID');
                setLoading(false);
                return { success: false, error: 'Google auth not configured' };
            }

            // Prompt for Google Sign-In
            const result = await promptAsync();

            if (result.type === 'cancel') {
                setLoading(false);
                return { success: false, error: 'User cancelled' };
            }

            // Success is handled in useEffect
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setLoading(false);
            return { success: false, error: errorMessage };
        }
    }, [request, promptAsync]);

    return {
        signInWithGoogle,
        loading,
        error,
        isReady: !!request,
    };
}
