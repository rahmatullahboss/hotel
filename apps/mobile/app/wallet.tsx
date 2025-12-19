import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import api, { getToken } from '@/lib/api';

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

// Tier configuration with emojis and colors
const TIER_CONFIG: Record<string, { emoji: string; name: string; color: string; bgClass: string }> = {
    BRONZE: { emoji: '🥉', name: 'Bronze', color: '#CD7F32', bgClass: 'bg-amber-700' },
    SILVER: { emoji: '🥈', name: 'Silver', color: '#C0C0C0', bgClass: 'bg-gray-400' },
    GOLD: { emoji: '🥇', name: 'Gold', color: '#FFD700', bgClass: 'bg-yellow-500' },
    PLATINUM: { emoji: '💎', name: 'Platinum', color: '#E5E4E2', bgClass: 'bg-gray-300' },
};

export default function WalletScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Add Money State - Commented out: Payment gateway not yet implemented
    // TODO: Uncomment when bKash/Nagad payment gateway is ready
    // const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    // const [amount, setAmount] = useState('');
    // const [processing, setProcessing] = useState(false);

    const fetchWallet = useCallback(async () => {
        // Check if user is authenticated
        const token = await getToken();
        if (!token) {
            setData(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        const { data: walletData, error } = await api.getWallet();
        if (walletData && !error) {
            setData(walletData);
        } else if (error) {
            setData(null);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    // Refetch on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchWallet();
        }, [fetchWallet])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchWallet();
    };

    // handleAddMoney - Commented out: Payment gateway not yet implemented
    // TODO: Uncomment when bKash/Nagad payment gateway is ready
    // const handleAddMoney = async () => {
    //     if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
    //         Alert.alert('Invalid Amount', 'Please enter a valid amount (minimum ৳10)');
    //         return;
    //     }
    //
    //     setProcessing(true);
    //     try {
    //         const response = await api.initiateWalletTopUp(Number(amount));
    //
    //         if (response.data?.success && response.data.redirectUrl) {
    //             // Open bKash payment gateway
    //             const browserResult = await WebBrowser.openBrowserAsync(response.data.redirectUrl);
    //
    //             // After browser closes (user completes or cancels), refresh wallet
    //             setShowAddMoneyModal(false);
    //             setAmount('');
    //             fetchWallet();
    //         } else {
    //             Alert.alert('Error', response.error || response.data?.error || 'Failed to initiate payment');
    //         }
    //     } catch (error) {
    //         Alert.alert('Error', 'An unexpected error occurred');
    //     } finally {
    //         setProcessing(false);
    //     }
    // };

    if (loading) {
        return (
            <View className="flex-1 bg-white dark:bg-gray-900">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: t('wallet.title'),
                        headerStyle: { backgroundColor: '#E63946' },
                        headerTintColor: '#fff',
                    }}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            </View>
        );
    }

    const tierConfig = TIER_CONFIG[data?.loyalty?.tier || 'BRONZE'] || TIER_CONFIG.BRONZE;

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
                {/* Balance Card - Premium Gradient */}
                <View
                    className="mx-5 mt-5 p-6 rounded-3xl items-center overflow-hidden"
                    style={{
                        backgroundColor: '#1D3557',
                        shadowColor: '#1D3557',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        elevation: 10,
                    }}
                >
                    {/* Decorative circles */}
                    <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5" />
                    <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/20" />

                    <Text className="text-white/70 text-sm mb-1">{t('wallet.balance')}</Text>
                    <Text className="text-white text-5xl font-bold mb-5">
                        ৳{(data?.balance || 0).toLocaleString()}
                    </Text>

                    {/* Add Money Button - Commented out: Payment gateway not yet implemented
                       TODO: Uncomment when bKash/Nagad payment gateway is ready */}
                    {/* <TouchableOpacity
                        onPress={() => setShowAddMoneyModal(true)}
                        className="bg-primary px-8 py-3 rounded-full"
                        style={{
                            shadowColor: '#E63946',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5,
                        }}
                    >
                        <Text className="text-white font-bold text-base">
                            + Add Money
                        </Text>
                    </TouchableOpacity> */}

                    {/* Coming Soon Badge */}
                    <View className="bg-white/20 px-4 py-2 rounded-full">
                        <Text className="text-white/90 text-sm font-medium">
                            💡 Earn through offers & bonuses
                        </Text>
                    </View>
                </View>

                {/* Loyalty Points Card */}
                <View
                    className={`mx-5 mt-4 p-5 rounded-2xl ${tierConfig.bgClass}`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-white/90 text-xs font-medium">{t('wallet.loyaltyPoints')}</Text>
                            <Text className="text-white text-4xl font-bold">
                                {(data?.loyalty?.points || 0).toLocaleString()}
                            </Text>
                        </View>
                        <View className="bg-white/25 px-4 py-2 rounded-full">
                            <Text className="text-white font-bold text-sm">
                                {tierConfig.emoji} {tierConfig.name}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-white/70 text-xs mt-3">{t('wallet.earnPoints')}</Text>
                </View>

                {/* Transactions */}
                <View
                    className="mx-5 mt-4 rounded-2xl p-5 bg-white dark:bg-gray-800"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t('wallet.transactions')}
                    </Text>

                    {data?.transactions && data.transactions.length > 0 ? (
                        data.transactions.map((tx, index) => (
                            <View
                                key={tx.id}
                                className={`flex-row items-center py-4 ${index !== data.transactions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                            >
                                <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${tx.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    <Text className="text-lg">
                                        {tx.type === 'CREDIT' ? '💰' : '💸'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                        {tx.description}
                                    </Text>
                                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text className={`text-base font-bold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                                    {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-5xl mb-4">📋</Text>
                            <Text className="text-base font-medium text-gray-500 dark:text-gray-400">
                                {t('wallet.noTransactions')}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* Add Money Modal - Commented out: Payment gateway not yet implemented
               TODO: Uncomment when bKash/Nagad payment gateway is ready */}
            {/* <Modal
                visible={showAddMoneyModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddMoneyModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Add Money to Wallet</Text>
                            <TouchableOpacity onPress={() => setShowAddMoneyModal(false)}>
                                <FontAwesome name="times" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">Enter Amount</Text>
                        <View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 bg-gray-50 dark:bg-gray-700/50">
                            <Text className="text-xl font-bold text-gray-500 mr-2">৳</Text>
                            <TextInput
                                className="flex-1 text-2xl font-bold text-gray-900 dark:text-white"
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor="#9CA3AF"
                                value={amount}
                                onChangeText={setAmount}
                                autoFocus
                            />
                        </View>

                        <View className="flex-row justify-between gap-3 mb-6">
                            {[500, 1000, 2000].map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    onPress={() => setAmount(String(val))}
                                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg items-center"
                                >
                                    <Text className="font-semibold text-gray-700 dark:text-gray-300">৳{val}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleAddMoney}
                            disabled={processing}
                            className={`py-4 rounded-xl items-center ${processing ? 'bg-gray-400' : 'bg-[#E63946]'
                                }`}
                        >
                            {processing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Pay with bKash</Text>
                            )}
                        </TouchableOpacity>

                        <View className="h-8" />
                    </View>
                </View>
            </Modal> */}
        </View>
    );
}
