/**
 * Dynamic Expo configuration for development and production builds.
 * This allows different package names and settings for dev vs production.
 */

const IS_DEV = process.env.APP_VARIANT === 'development';

// Package name changes based on build variant
const ANDROID_PACKAGE = IS_DEV ? 'com.zinurooms.app.dev' : 'com.zinurooms.app';
const IOS_BUNDLE_ID = IS_DEV ? 'com.zinurooms.app.dev' : 'com.zinurooms.app';

// App name suffix for dev builds
const APP_NAME = IS_DEV ? 'ZinuRooms Dev' : 'ZinuRooms';

export default ({ config }) => {
    return {
        ...config,
        name: APP_NAME,
        slug: 'zinurooms',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: IS_DEV ? 'zinurooms-dev' : 'zinurooms',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        splash: {
            image: './assets/images/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#E23744',
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: IOS_BUNDLE_ID,
            infoPlist: {
                NSCameraUsageDescription:
                    'Allow ZinuRooms to access your camera for QR code scanning and ID verification.',
                NSPhotoLibraryUsageDescription:
                    'Allow ZinuRooms to access your photos for uploading profile pictures.',
                NSMicrophoneUsageDescription:
                    'Allow ZinuRooms to access your microphone.',
                NSCalendarsUsageDescription:
                    'Allow ZinuRooms to add your bookings to your calendar.',
                NSContactsUsageDescription:
                    'Allow ZinuRooms to access your contacts for referral invitations.',
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#E23744',
            },
            edgeToEdgeEnabled: true,
            navigationBarColor: '#FFFFFF',
            package: ANDROID_PACKAGE,
            permissions: [
                'android.permission.CAMERA',
                'android.permission.READ_EXTERNAL_STORAGE',
                'android.permission.WRITE_EXTERNAL_STORAGE',
                'android.permission.READ_CALENDAR',
                'android.permission.WRITE_CALENDAR',
                'android.permission.VIBRATE',
                'android.permission.RECEIVE_BOOT_COMPLETED',
                'android.permission.READ_CONTACTS',
                'android.permission.ACCESS_COARSE_LOCATION',
                'android.permission.ACCESS_FINE_LOCATION',
                'android.permission.RECORD_AUDIO',
                'com.google.android.gms.permission.AD_ID',
            ],
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            'expo-secure-store',
            'expo-localization',
            'expo-web-browser',
            [
                'expo-location',
                {
                    locationAlwaysAndWhenInUsePermission:
                        'Allow ZinuRooms to use your location to find nearby hotels.',
                    locationAlwaysPermission:
                        'Allow ZinuRooms to use your location to find nearby hotels.',
                    locationWhenInUsePermission:
                        'Allow ZinuRooms to use your location to find nearby hotels.',
                },
            ],
            [
                '@react-native-google-signin/google-signin',
                {
                    // iOS URL scheme uses Web Client ID (reversed)
                    iosUrlScheme: IS_DEV
                        ? 'com.googleusercontent.apps.104361665388-2rjtt30pfvjatkkc8lnluq00fn2lloeh'
                        : 'com.googleusercontent.apps.104361665388-erqs6259250hkjg13v378jshge11kaht',
                },
            ],
            [
                'expo-camera',
                {
                    cameraPermission:
                        'Allow ZinuRooms to access your camera for QR code scanning and ID verification.',
                    microphonePermission:
                        'Allow ZinuRooms to access your microphone.',
                },
            ],
            [
                'expo-image-picker',
                {
                    photosPermission:
                        'Allow ZinuRooms to access your photos for uploading profile pictures and ID documents.',
                    cameraPermission:
                        'Allow ZinuRooms to take photos for profile pictures and ID verification.',
                },
            ],
            [
                'expo-notifications',
                {
                    icon: './assets/images/notification-icon.png',
                    color: '#E63946',
                },
            ],
            [
                'expo-calendar',
                {
                    calendarPermission:
                        'Allow ZinuRooms to add your bookings to your calendar.',
                },
            ],
            [
                'expo-build-properties',
                {
                    android: {
                        enableProguardInReleaseBuilds: true,
                        enableShrinkResourcesInReleaseBuilds: true,
                    },
                },
            ],
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            eas: {
                projectId: '7000911d-c87b-4998-85d8-524e9de8c8a2',
            },
            router: {},
            // Expose variant to the app
            APP_VARIANT: process.env.APP_VARIANT || 'production',
        },
        owner: 'rahmatullahzisan',
    };
};
