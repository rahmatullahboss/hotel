import * as Sharing from 'expo-sharing';
import { Share, Platform } from 'react-native';

interface ShareHotelParams {
    hotelId: string;
    hotelName: string;
    city?: string;
    rating?: number;
}

interface ShareBookingParams {
    bookingId: string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
}

const APP_URL_BASE = 'https://zinorooms.com';

/**
 * Share hotel with others via native share dialog
 */
export async function shareHotel({ hotelId, hotelName, city, rating }: ShareHotelParams) {
    const url = `${APP_URL_BASE}/hotel/${hotelId}`;
    const ratingText = rating ? ` ⭐ ${rating}` : '';
    const cityText = city ? ` in ${city}` : '';

    const message = `Check out ${hotelName}${cityText}${ratingText}! Book your stay at ${url}`;

    try {
        if (Platform.OS === 'web') {
            // Web share API
            if (navigator.share) {
                await navigator.share({
                    title: hotelName,
                    text: message,
                    url: url,
                });
            }
        } else {
            // Native share
            const result = await Share.share({
                message: message,
                url: url, // iOS only
                title: hotelName,
            });
            return result;
        }
    } catch (error) {
        console.error('Error sharing hotel:', error);
        throw error;
    }
}

/**
 * Share booking details with others
 */
export async function shareBooking({ bookingId, hotelName, checkIn, checkOut }: ShareBookingParams) {
    const formattedCheckIn = new Date(checkIn).toLocaleDateString();
    const formattedCheckOut = new Date(checkOut).toLocaleDateString();

    const message = `🏨 I'm staying at ${hotelName}!\n📅 ${formattedCheckIn} - ${formattedCheckOut}\n\nBook your stay at ${APP_URL_BASE}`;

    try {
        if (Platform.OS === 'web') {
            if (navigator.share) {
                await navigator.share({
                    title: `My Stay at ${hotelName}`,
                    text: message,
                });
            }
        } else {
            const result = await Share.share({
                message: message,
                title: `My Stay at ${hotelName}`,
            });
            return result;
        }
    } catch (error) {
        console.error('Error sharing booking:', error);
        throw error;
    }
}

/**
 * Check if sharing is available on this device
 */
export async function isShareAvailable(): Promise<boolean> {
    try {
        const available = await Sharing.isAvailableAsync();
        return available;
    } catch {
        return Platform.OS === 'web' && !!navigator.share;
    }
}
