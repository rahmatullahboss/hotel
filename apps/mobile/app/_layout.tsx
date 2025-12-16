import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import 'react-native-reanimated';
import '../global.css';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import Colors from '@/constants/Colors';
import { initI18n } from '@/i18n';
import api, { getToken } from '@/lib/api';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom theme matching OYO style
const OYOLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#222222',
    border: '#EBEBEB',
    notification: Colors.primary,
  },
};

const OYODarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF6B6B',
    background: '#1A1A1A',
    card: '#262626',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#FF6B6B',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [i18nReady, setI18nReady] = useState(false);

  // Initialize i18n
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, i18nReady]);

  if (!loaded || !i18nReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme } = useTheme();

  // Initialize push notifications
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        console.log('🔔 Starting push notification initialization...');

        // Check if user is authenticated
        const token = await getToken();
        if (!token) {
          console.log('🔔 User not authenticated, skipping push setup');
          return;
        }
        console.log('🔔 User authenticated');

        // Check if running on physical device
        if (!Device.isDevice) {
          console.log('🔔 Push notifications require a physical device');
          return;
        }
        console.log('🔔 Running on physical device');

        // Check/request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('🔔 Existing permission status:', existingStatus);
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          console.log('🔔 Requesting permission...');
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          console.log('🔔 New permission status:', finalStatus);
        }

        if (finalStatus !== 'granted') {
          console.log('🔔 Push notification permission not granted');
          return;
        }
        console.log('🔔 Permission granted!');

        // Set up Android notification channel
        if (Platform.OS === 'android') {
          console.log('🔔 Setting up Android notification channel...');
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E63946',
          });
          console.log('🔔 Android notification channel created');
        }

        // Get Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        console.log('🔔 Project ID:', projectId);
        if (!projectId) {
          console.log('🔔 Project ID not found in app configuration');
          return;
        }

        console.log('🔔 Getting Expo push token...');
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const expoPushToken = tokenData.data;
        console.log('🔔 Expo Push Token:', expoPushToken);

        // Register token with backend
        console.log('🔔 Registering push token with backend...');
        const { error } = await api.registerPushToken(expoPushToken, Platform.OS as 'ios' | 'android');
        if (error) {
          console.warn('🔔 Failed to register push token:', error);
        } else {
          console.log('🔔 Push token registered successfully!');
        }
      } catch (error) {
        console.error('🔔 Error initializing push notifications:', error);
      }
    };

    initPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationThemeProvider value={theme === 'dark' ? OYODarkTheme : OYOLightTheme}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="hotel/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="room/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: true }} />
        </Stack>
      </NavigationThemeProvider>
    </SafeAreaProvider>
  );
}
