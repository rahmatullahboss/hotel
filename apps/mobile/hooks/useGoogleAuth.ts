import { useState, useCallback } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setToken } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

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

export function useGoogleAuth() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sign in with Google
    const signInWithGoogle = useCallback(async (): Promise<GoogleAuthResult> => {
        try {
            setLoading(true);
            setError(null);

            console.log('Starting Google Sign-In...');

            // Check if Google Play Services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            console.log('Play Services OK');

            // Sign in - returns user info directly
            const signInResult = await GoogleSignin.signIn();
            console.log('Sign-In Result type:', typeof signInResult);
            console.log('Sign-In Result:', JSON.stringify(signInResult, null, 2));

            // Extract user from the response - check different possible structures
            let user: any = null;
            let idToken: string | null = null;

            // New SDK structure: { type: 'success', data: { user, idToken } }
            if (signInResult && typeof signInResult === 'object') {
                if ('data' in signInResult && signInResult.data) {
                    user = (signInResult as any).data.user;
                    idToken = (signInResult as any).data.idToken;
                    console.log('Found user in data.user');
                } else if ('user' in signInResult) {
                    // Old SDK structure: { user, idToken }
                    user = (signInResult as any).user;
                    idToken = (signInResult as any).idToken;
                    console.log('Found user in root.user');
                }
            }

            // If no idToken from signIn, try getTokens
            if (!idToken) {
                console.log('Getting tokens separately...');
                try {
                    const tokens = await GoogleSignin.getTokens();
                    idToken = tokens.idToken;
                    console.log('Got idToken from getTokens:', idToken ? 'Yes' : 'No');
                } catch (tokenErr) {
                    console.error('getTokens error:', tokenErr);
                }
            }

            if (!user) {
                const errorMsg = `No user data. Response: ${JSON.stringify(signInResult)}`;
                console.error(errorMsg);
                setError('No user data received');
                setLoading(false);
                Alert.alert('Debug Info', errorMsg);
                return { success: false, error: 'No user data received' };
            }

            if (!idToken) {
                const errorMsg = 'No ID token received';
                console.error(errorMsg);
                setError(errorMsg);
                setLoading(false);
                Alert.alert('Error', errorMsg);
                return { success: false, error: errorMsg };
            }

            console.log('User email:', user.email);
            console.log('User name:', user.name);

            // Send to backend
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            console.log('Sending to backend:', API_URL);

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

            console.log('Backend response status:', res.status);
            const authData = await res.json();
            console.log('Backend response:', JSON.stringify(authData, null, 2));

            if (!res.ok) {
                const errorMsg = authData.error || 'Backend authentication failed';
                console.error('Backend error:', errorMsg);
                setError(errorMsg);
                setLoading(false);
                Alert.alert('Authentication Error', errorMsg);
                return { success: false, error: errorMsg };
            }

            // Store the JWT token
            await setToken(authData.token);
            console.log('Token stored successfully');

            // Navigate to home
            setLoading(false);
            Alert.alert('Success!', 'Signed in successfully!');
            router.replace('/(tabs)');

            return { success: true };

        } catch (err: any) {
            let errorMessage = 'Unknown error occurred';

            if (err.code === statusCodes.SIGN_IN_CANCELLED) {
                errorMessage = 'Sign in cancelled';
            } else if (err.code === statusCodes.IN_PROGRESS) {
                errorMessage = 'Sign in already in progress';
            } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                errorMessage = 'Google Play Services not available';
            } else {
                errorMessage = err.message || 'Google Sign-In failed';
            }

            console.error('Google Sign-In error:', err);
            setError(errorMessage);
            setLoading(false);

            if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert('Sign-In Error', errorMessage);
            }

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
        isReady: true,
    };
}
