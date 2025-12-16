import { Linking, Platform, Alert } from 'react-native';

export interface NavigationParams {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
}

/**
 * Open navigation to a location using the device's default map app
 * - iOS: Opens Apple Maps with option for Google Maps if installed
 * - Android: Opens Google Maps
 */
export async function openNavigation(params: NavigationParams): Promise<void> {
    const { latitude, longitude, name, address } = params;

    const encodedName = encodeURIComponent(name || 'Destination');
    const encodedAddress = encodeURIComponent(address || '');

    try {
        if (Platform.OS === 'ios') {
            // Try Google Maps first (better navigation), fallback to Apple Maps
            const googleMapsUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
            const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}&q=${encodedName}`;

            const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);

            if (canOpenGoogleMaps) {
                await Linking.openURL(googleMapsUrl);
            } else {
                await Linking.openURL(appleMapsUrl);
            }
        } else {
            // Android: Use Google Maps
            const googleMapsUrl = `google.navigation:q=${latitude},${longitude}&mode=d`;
            const webMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

            const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);

            if (canOpenGoogleMaps) {
                await Linking.openURL(googleMapsUrl);
            } else {
                // Fallback to web browser
                await Linking.openURL(webMapsUrl);
            }
        }
    } catch (error) {
        console.error('Error opening navigation:', error);
        Alert.alert(
            'Navigation Error',
            'Unable to open maps application. Please make sure you have a maps app installed.',
            [{ text: 'OK' }]
        );
    }
}

/**
 * Open a location on the map (view only, not navigation)
 */
export async function openLocationOnMap(params: NavigationParams): Promise<void> {
    const { latitude, longitude, name } = params;

    const encodedName = encodeURIComponent(name || 'Location');

    try {
        if (Platform.OS === 'ios') {
            // Apple Maps
            const url = `maps://app?ll=${latitude},${longitude}&q=${encodedName}`;
            await Linking.openURL(url);
        } else {
            // Google Maps on Android/Web
            const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            await Linking.openURL(url);
        }
    } catch (error) {
        console.error('Error opening map:', error);
        Alert.alert(
            'Map Error',
            'Unable to open maps application.',
            [{ text: 'OK' }]
        );
    }
}

/**
 * Get directions URL without opening (for sharing)
 */
export function getDirectionsUrl(params: NavigationParams): string {
    const { latitude, longitude } = params;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
}
