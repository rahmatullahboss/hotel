import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';

interface Transaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    reason: string;
    description: string;
    createdAt: string;
}

interface WalletData {
    balance: number;
    loyalty: {
        points: number;
        lifetimePoints: number;
        tier: string;
    };
    transactions: Transaction[];
}

const TIER_BG: Record<string, string> = {
    BRONZE: 'bg-amber-700',
    SILVER: 'bg-gray-400',
    GOLD: 'bg-yellow-500',
    PLATINUM: 'bg-gray-300',
};

export default function WalletScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWallet = useCallback(async () => {
        const { data: walletData, error } = await api.getWallet();
        if (walletData) {
            setData(walletData);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWallet();
    };

    if (loading) {
        return (
            <View
                className="flex-1 items-center justify-center bg-white dark:bg-gray-900"
                style={{ paddingTop: insets.top }}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    const tierBgClass = TIER_BG[data?.loyalty?.tier || 'BRONZE'] || TIER_BG.BRONZE;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('wallet.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E63946" />
                }
            >
                {/* Wallet Balance Card */}
                <View className="mx-5 mt-5 p-6 rounded-2xl bg-secondary items-center">
                    <Text className="text-white/80 text-sm mb-2">{t('wallet.balance')}</Text>
                    <Text className="text-white text-4xl font-bold">
                        ৳{(data?.balance || 0).toLocaleString()}
                    </Text>
                </View>

                {/* Loyalty Points Card */}
                <View className={`mx-5 mt-4 p-5 rounded-2xl ${tierBgClass}`}>
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-white/90 text-xs">{t('wallet.loyaltyPoints')}</Text>
                            <Text className="text-white text-3xl font-bold">
                                {(data?.loyalty?.points || 0).toLocaleString()}
                            </Text>
                        </View>
                        <View className="bg-white/30 px-3 py-1.5 rounded-full">
                            <Text className="text-white font-semibold text-xs">
                                {data?.loyalty?.tier || 'BRONZE'} 🏆
                            </Text>
                        </View>
                    </View>
                    <Text className="text-white/70 text-xs mt-3">{t('wallet.earnPoints')}</Text>
                </View>

                {/* Transactions */}
                <View className="mx-5 mt-4 rounded-2xl p-4 bg-white dark:bg-gray-800">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        {t('wallet.transactions')}
                    </Text>

                    {data?.transactions && data.transactions.length > 0 ? (
                        data.transactions.map((tx) => (
                            <View
                                key={tx.id}
                                className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700"
                            >
                                <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${tx.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    <FontAwesome
                                        name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'}
                                        size={14}
                                        color={tx.type === 'CREDIT' ? '#16a34a' : '#dc2626'}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                        {tx.description}
                                    </Text>
                                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-10">
                            <FontAwesome name="history" size={40} color="#9CA3AF" />
                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                {t('wallet.noTransactions')}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
