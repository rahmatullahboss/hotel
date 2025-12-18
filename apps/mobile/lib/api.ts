import * as SecureStore from 'expo-secure-store';
import { devLog, devError, devWarn } from './logger';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Validate API URL at startup (fail fast in development)
if (!API_BASE_URL) {
    const errorMessage = 'EXPO_PUBLIC_API_URL environment variable is required. Check your .env file.';
    devError(errorMessage);
    // In production, this will throw and crash the app - which is intentional
    // We don't want the app to run without a valid API URL
    throw new Error(errorMessage);
}

// Request configuration
const REQUEST_TIMEOUT_MS = 15000; // 15 seconds
const MAX_RETRIES = 2;

// Token storage keys
const TOKEN_KEY = 'auth_token';

// Token management
export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        devWarn('Failed to retrieve auth token from secure store');
        return null;
    }
}

export async function setToken(token: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        devLog('Auth token stored securely');
    } catch (error) {
        devError('Failed to store auth token:', error);
        throw new Error('Failed to save authentication. Please try again.');
    }
}

export async function removeToken(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        devLog('Auth token removed');
    } catch (error) {
        devError('Failed to remove auth token:', error);
    }
}

// API request helper
interface ApiResponse<T> {
    data?: T;
    error?: string;
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): { controller: AbortController; timeoutId: ReturnType<typeof setTimeout> } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    return { controller, timeoutId };
}

/**
 * Make an API request with timeout and optional retry
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string,
    retryCount = 0
): Promise<ApiResponse<T>> {
    const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT_MS);

    try {
        const token = authToken || await getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'x-client-platform': 'mobile', // Identify request as coming from mobile app
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;

            // Don't log expected auth errors (user not logged in trying to access protected endpoints)
            const isAuthError = response.status === 401 || response.status === 403;
            const isExpectedAuthError = isAuthError && (
                errorMessage.includes('Unauthorized') ||
                errorMessage.includes('Authentication required') ||
                errorMessage.includes('Not authenticated')
            );

            if (!isExpectedAuthError) {
                devError(`API Error [${endpoint}]:`, errorMessage);
            }

            return { error: errorMessage };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
            devError(`API Timeout [${endpoint}]: Request exceeded ${REQUEST_TIMEOUT_MS}ms`);
            return { error: 'Request timed out. Please check your connection and try again.' };
        }

        // Handle network errors with retry
        if (error instanceof TypeError && error.message === 'Network request failed') {
            if (retryCount < MAX_RETRIES) {
                devWarn(`API Retry [${endpoint}]: Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
                // Exponential backoff: 1s, 2s
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return apiRequest<T>(endpoint, options, authToken, retryCount + 1);
            }
            devError(`API Network Error [${endpoint}]: Failed after ${MAX_RETRIES} retries`);
            return { error: 'Network error. Please check your internet connection.' };
        }

        devError(`API Error [${endpoint}]:`, error);
        return { error: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
}

// API methods
export const api = {
    // Hotels
    getHotels: (params?: {
        city?: string;
        checkIn?: string;
        checkOut?: string;
        guests?: number;
        limit?: number;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        amenities?: string;
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.city) searchParams.set('city', params.city);
        if (params?.checkIn) searchParams.set('checkIn', params.checkIn);
        if (params?.checkOut) searchParams.set('checkOut', params.checkOut);
        if (params?.guests) searchParams.set('guests', String(params.guests));
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.minPrice) searchParams.set('minPrice', String(params.minPrice));
        if (params?.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
        if (params?.minRating) searchParams.set('minRating', String(params.minRating));
        if (params?.amenities) searchParams.set('amenities', params.amenities);

        return apiRequest<any[]>(`/api/hotels?${searchParams.toString()}`);
    },

    getHotel: (id: string) => apiRequest<any>(`/api/hotels/${id}`),

    // Rooms
    getRooms: (hotelId: string, checkIn?: string, checkOut?: string) => {
        const searchParams = new URLSearchParams();
        if (checkIn) searchParams.set('checkIn', checkIn);
        if (checkOut) searchParams.set('checkOut', checkOut);
        return apiRequest<any[]>(`/api/hotels/${hotelId}/rooms?${searchParams.toString()}`);
    },

    getRoomDetails: (roomId: string) => apiRequest<any>(`/api/rooms/${roomId}`),

    // Bookings
    createBooking: (data: {
        hotelId: string;
        roomId: string;
        checkIn: string;
        checkOut: string;
        guestName: string;
        guestEmail: string;
        guestPhone: string;
        guests: number;
        totalAmount: number;
        paymentMethod: string;
        useWalletBalance?: boolean;
        walletAmount?: number;
    }) => apiRequest<any>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getMyBookings: () => apiRequest<any[]>('/api/bookings'),

    getBooking: (id: string) => apiRequest<any>(`/api/bookings/${id}`),

    // User
    getProfile: () => apiRequest<any>('/api/user/profile'),

    updateProfile: (data: { name?: string; phone?: string; image?: string | null }) => apiRequest<{ success: boolean; message: string }>('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),


    // Cities
    getCities: () => apiRequest<any[]>('/api/cities'),

    // Wallet
    getWallet: () => apiRequest<{
        balance: number;
        loyalty: { points: number; lifetimePoints: number; tier: string };
        transactions: any[];
    }>('/api/user/wallet'),

    // Referral
    getReferral: () => apiRequest<{
        code: string;
        totalReferrals: number;
        pendingReferrals: number;
        completedReferrals: number;
        totalEarned: number;
        referralHistory: any[];
    }>('/api/user/referral'),

    applyReferralCode: (code: string) => apiRequest<{ success: boolean; message?: string }>('/api/user/referral', {
        method: 'POST',
        body: JSON.stringify({ code }),
    }),

    // Wallet Top-up
    initiateWalletTopUp: (amount: number) => apiRequest<{
        success: boolean;
        redirectUrl?: string;
        paymentID?: string;
        error?: string;
    }>('/api/user/wallet/top-up', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    }),

    // Achievements
    getAchievements: () => apiRequest<{
        streak: {
            currentStreak: number;
            longestStreak: number;
            totalLoginDays: number;
            nextReward: { days: number; reward: number; badgeCode: string } | null;
            daysUntilReward: number;
        };
        badges: any[];
        earnedCount: number;
    }>('/api/user/achievements'),

    recordDailyLogin: () => apiRequest<{ success: boolean; currentStreak: number; reward: any }>('/api/user/achievements', {
        method: 'POST',
    }),

    // Saved Hotels
    getSavedHotels: () => apiRequest<{
        savedHotels: Array<{
            id: string;
            hotelId: string;
            savedAt: string;
            hotel: {
                id: string;
                name: string;
                city: string;
                coverImage: string | null;
                rating: number | null;
                reviewCount: number;
                lowestDynamicPrice: number | null;
            };
        }>;
    }>('/api/user/saved-hotels'),

    saveHotel: (hotelId: string) => apiRequest<{ message: string; id: string }>('/api/user/saved-hotels', {
        method: 'POST',
        body: JSON.stringify({ hotelId }),
    }),

    unsaveHotel: (hotelId: string) => apiRequest<{ message: string }>('/api/user/saved-hotels', {
        method: 'DELETE',
        body: JSON.stringify({ hotelId }),
    }),

    // Notification Preferences
    getNotificationPreferences: () => apiRequest<{
        bookingConfirmation: boolean;
        checkInInstructions: boolean;
        promotions: boolean;
    }>('/api/user/notification-preferences'),

    updateNotificationPreferences: (preferences: {
        bookingConfirmation?: boolean;
        checkInInstructions?: boolean;
        promotions?: boolean;
    }) => apiRequest<{
        bookingConfirmation: boolean;
        checkInInstructions: boolean;
        promotions: boolean;
    }>('/api/user/notification-preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
    }),

    // Self Check-in/Check-out
    selfCheckIn: (hotelId: string, action: 'checkin' | 'checkout') => apiRequest<{
        success: boolean;
        error?: string;
        booking?: {
            id: string;
            hotelName: string;
            roomName: string;
            checkIn: string;
            checkOut: string;
        };
    }>('/api/checkin', {
        method: 'POST',
        body: JSON.stringify({ hotelId, action }),
    }),

    // First Booking Offer
    checkFirstBookingEligibility: () => apiRequest<{
        eligible: boolean;
        discountPercent: number;
        maxDiscount: number;
        message?: string;
    }>('/api/first-booking'),

    calculateFirstBookingDiscount: (amount: number) => apiRequest<{
        eligible: boolean;
        discount: number;
        discountPercent: number;
        finalAmount: number;
    }>('/api/first-booking', {
        method: 'POST',
        body: JSON.stringify({ amount }),
    }),

    // Push Notifications
    registerPushToken: (expoPushToken: string, platform: 'ios' | 'android', authToken?: string) => apiRequest<{
        success: boolean;
        message?: string;
    }>('/api/user/push-token', {
        method: 'POST',
        body: JSON.stringify({ expoPushToken, platform }),
    }, authToken),

    unregisterPushToken: (expoPushToken: string) => apiRequest<{
        success: boolean;
        message?: string;
    }>('/api/user/push-token', {
        method: 'DELETE',
        body: JSON.stringify({ expoPushToken }),
    }),

    // Test Notification (for debugging)
    testNotification: () => apiRequest<{
        success: boolean;
        message?: string;
        userId?: string;
        tokensFound?: number;
    }>('/api/test-notification', {
        method: 'POST',
    }),

    checkPushTokens: () => apiRequest<{
        userId: string;
        tokensCount: number;
        tokens: string[];
        hasTokens: boolean;
    }>('/api/test-notification'),

    // Payment
    initiatePayment: (bookingId: string, amount?: number) => apiRequest<{
        success: boolean;
        redirectUrl?: string;
        paymentID?: string;
        error?: string;
    }>('/api/payment/initiate', {
        method: 'POST',
        body: JSON.stringify({ bookingId, amount }),
    }),

    // Booking Cancellation
    getCancellationInfo: (bookingId: string) => apiRequest<{
        type: 'ADVANCE_PAYMENT';
        isLate: boolean;
        isVeryLate?: boolean;
        hoursRemaining: number;
        penalty: string | null;
        refund: number;
    } | null>(`/api/bookings/${bookingId}?cancelInfo=true`),

    cancelBooking: (bookingId: string, reason: string) => apiRequest<{
        success: boolean;
        refundAmount: number;
        isLate: boolean;
        message: string;
        error?: string;
    }>(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
    }),

    // Reviews
    getHotelReviews: (hotelId: string, limit?: number) => apiRequest<{
        reviews: Array<{
            id: string;
            rating: number;
            title: string | null;
            content: string | null;
            cleanlinessRating: number | null;
            serviceRating: number | null;
            valueRating: number | null;
            locationRating: number | null;
            hotelResponse: string | null;
            createdAt: string;
            userName: string;
            userImage: string | null;
        }>;
        stats: {
            totalReviews: number;
            averageRating: number;
            breakdown: {
                fiveStar: number;
                fourStar: number;
                threeStar: number;
                twoStar: number;
                oneStar: number;
            };
        };
    }>(`/api/hotels/${hotelId}/reviews${limit ? `?limit=${limit}` : ''}`),

    submitReview: (data: {
        bookingId: string;
        rating: number;
        title?: string;
        content?: string;
        cleanlinessRating?: number;
        serviceRating?: number;
        valueRating?: number;
        locationRating?: number;
    }) => apiRequest<{
        success: boolean;
        reviewId: string;
        message: string;
        error?: string;
    }>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getMyReviews: () => apiRequest<Array<{
        id: string;
        rating: number;
        title: string | null;
        content: string | null;
        hotelName: string;
        hotelImage: string | null;
        createdAt: string;
    }>>('/api/reviews'),
};

export default api;

