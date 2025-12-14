import { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
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

const TIER_COLORS: Record<string, string> = {
    BRONZE: '#cd7f32',
    SILVER: '#c0c0c0',
    GOLD: '#ffd700',
    PLATINUM: '#e5e4e2',
};

export default function WalletScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
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
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const tierColor = TIER_COLORS[data?.loyalty?.tier || 'BRONZE'] || TIER_COLORS.BRONZE;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('wallet.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Wallet Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>{t('wallet.balance')}</Text>
                    <Text style={styles.balanceAmount}>
                        ৳{(data?.balance || 0).toLocaleString()}
                    </Text>
                </View>

                {/* Loyalty Points Card */}
                <View style={[styles.loyaltyCard, { backgroundColor: tierColor }]}>
                    <View style={[styles.loyaltyRow, { backgroundColor: 'transparent' }]}>
                        <View style={{ backgroundColor: 'transparent' }}>
                            <Text style={styles.loyaltyLabel}>{t('wallet.loyaltyPoints')}</Text>
                            <Text style={styles.loyaltyPoints}>
                                {(data?.loyalty?.points || 0).toLocaleString()}
                            </Text>
                        </View>
                        <View style={[styles.tierBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                            <Text style={styles.tierText}>
                                {data?.loyalty?.tier || 'BRONZE'} 🏆
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.loyaltyHint}>{t('wallet.earnPoints')}</Text>
                </View>

                {/* Transactions */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('wallet.transactions')}
                    </Text>

                    {data?.transactions && data.transactions.length > 0 ? (
                        data.transactions.map((tx) => (
                            <View
                                key={tx.id}
                                style={[styles.transactionItem, { borderBottomColor: colors.border, backgroundColor: 'transparent' }]}
                            >
                                <View style={[styles.txIcon, { backgroundColor: tx.type === 'CREDIT' ? '#dcfce7' : '#fef2f2' }]}>
                                    <FontAwesome
                                        name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'}
                                        size={14}
                                        color={tx.type === 'CREDIT' ? '#16a34a' : '#dc2626'}
                                    />
                                </View>
                                <View style={[styles.txDetails, { backgroundColor: 'transparent' }]}>
                                    <Text style={[styles.txDescription, { color: colors.text }]}>
                                        {tx.description}
                                    </Text>
                                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.txAmount,
                                        { color: tx.type === 'CREDIT' ? '#16a34a' : '#dc2626' },
                                    ]}
                                >
                                    {tx.type === 'CREDIT' ? '+' : '-'}৳{tx.amount}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.emptyState, { backgroundColor: 'transparent' }]}>
                            <FontAwesome name="history" size={40} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {t('wallet.noTransactions')}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    balanceCard: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#1d3557',
        alignItems: 'center',
    },
    balanceLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
    },
    loyaltyCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
    },
    loyaltyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loyaltyLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    loyaltyPoints: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    tierBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tierText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    loyaltyHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        marginTop: 12,
    },
    section: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    txIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    txDetails: {
        flex: 1,
    },
    txDescription: {
        fontSize: 14,
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
        marginTop: 2,
    },
    txAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
    },
});
