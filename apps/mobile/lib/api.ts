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
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const token = await getToken();

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
    }) => {
        const searchParams = new URLSearchParams();
        if (params?.city) searchParams.set('city', params.city);
        if (params?.checkIn) searchParams.set('checkIn', params.checkIn);
        if (params?.checkOut) searchParams.set('checkOut', params.checkOut);
        if (params?.guests) searchParams.set('guests', String(params.guests));

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

    // Bookings
    createBooking: (data: {
        roomId: string;
        checkIn: string;
        checkOut: string;
        guestName: string;
        guestEmail: string;
        guestPhone: string;
        guests: number;
        paymentMethod: string;
    }) => apiRequest<any>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getMyBookings: () => apiRequest<any[]>('/api/bookings'),

    getBooking: (id: string) => apiRequest<any>(`/api/bookings/${id}`),

    // User
    getProfile: () => apiRequest<any>('/api/user/profile'),

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
};

export default api;
