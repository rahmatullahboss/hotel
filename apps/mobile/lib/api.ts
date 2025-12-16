import * as SecureStore from 'expo-secure-store';

// Configure your API base URL
// In development, use your computer's IP address (not localhost)
// For production, use your Vercel deployment URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Token storage keys
const TOKEN_KEY = 'auth_token';

// Token management
export async function getToken(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
        return null;
    }
}

export async function setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// API request helper
interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string
): Promise<ApiResponse<T>> {
    try {
        const token = authToken || await getToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData.error || `HTTP ${response.status}` };
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Network error' };
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

    updateProfile: (data: { name?: string; phone?: string }) => apiRequest<{ success: boolean; message: string }>('/api/user/profile', {
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

