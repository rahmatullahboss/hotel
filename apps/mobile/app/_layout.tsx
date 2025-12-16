import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import Colors from '@/constants/Colors';
import { initI18n } from '@/i18n';
import api, { getToken } from '@/lib/api';

// Dynamically import native modules to handle cases where they're not available
let Device: typeof import('expo-device') | null = null;
let Notifications: typeof import('expo-notifications') | null = null;
let Constants: typeof import('expo-constants').default | null = null;

try {
  Device = require('expo-device');
  Notifications = require('expo-notifications');
  Constants = require('expo-constants').default;

  // Configure notification handler for foreground notifications (only if available)
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.log('Native modules not available, notifications disabled');
}

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
        // Skip if native modules are not available
        if (!Device || !Notifications || !Constants) {
          console.log('Native notification modules not available, skipping push setup');
          return;
        }

        // Check if user is authenticated
        const token = await getToken();
        if (!token) return;

        // Check if running on physical device
        if (!Device.isDevice) {
          console.log('Push notifications require a physical device');
          return;
        }

        // Check/request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Push notification permission not granted');
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

        // Get Expo push token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
          console.log('Project ID not found in app configuration');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const expoPushToken = tokenData.data;

        // Register token with backend
        const { error } = await api.registerPushToken(expoPushToken, Platform.OS as 'ios' | 'android');
        if (error) {
          console.warn('Failed to register push token:', error);
        } else {
          console.log('Push token registered:', expoPushToken);
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
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
