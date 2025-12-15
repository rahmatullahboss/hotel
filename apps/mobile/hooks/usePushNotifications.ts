import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api, { getToken } from '../lib/api';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationState {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    isRegistered: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Hook for managing push notifications in the mobile app
 */
export function usePushNotifications() {
    const [state, setState] = useState<PushNotificationState>({
        expoPushToken: null,
        notification: null,
        isRegistered: false,
        isLoading: true,
        error: null,
    });

    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    // Register for push notifications
    const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Check if running on physical device
            if (!Device.isDevice) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Push notifications require a physical device',
                }));
                return null;
            }

            // Check/request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Permission not granted for push notifications',
                }));
                return null;
            }

            // Set up Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#E63946',
                });
            }

            // Get Expo push token
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Project ID not found in app configuration',
                }));
                return null;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });
            const token = tokenData.data;

            // Check if user is authenticated
            const authToken = await getToken();
            if (authToken) {
                // Register token with backend
                const { error } = await api.registerPushToken(token, Platform.OS as 'ios' | 'android');
                if (error) {
                    console.warn('Failed to register push token with server:', error);
                }
            }

            setState(prev => ({
                ...prev,
                expoPushToken: token,
                isRegistered: true,
                isLoading: false,
            }));

            return token;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to register for push notifications';
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return null;
        }
    }, []);

    // Unregister push notifications
    const unregisterPushNotifications = useCallback(async () => {
        if (state.expoPushToken) {
            try {
                await api.unregisterPushToken(state.expoPushToken);
                setState(prev => ({
                    ...prev,
                    expoPushToken: null,
                    isRegistered: false,
                }));
            } catch (error) {
                console.error('Failed to unregister push token:', error);
            }
        }
    }, [state.expoPushToken]);

    // Set up notification listeners
    useEffect(() => {
        // Listener for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setState(prev => ({ ...prev, notification }));
        });

        // Listener for when user interacts with a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            // Handle notification tap - you can add navigation logic here
            console.log('Notification tapped:', data);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        ...state,
        registerForPushNotifications,
        unregisterPushNotifications,
    };
}

export default usePushNotifications;
