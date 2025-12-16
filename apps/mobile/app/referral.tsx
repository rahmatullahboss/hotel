import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Share,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import api, { getToken } from '@/lib/api';

interface ReferralData {
    code: string;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalEarned: number;
    referralHistory: any[];
}

export default function ReferralScreen() {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [applyCode, setApplyCode] = useState('');
    const [applying, setApplying] = useState(false);

    const fetchReferral = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            setData(null);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        const { data: referralData, error } = await api.getReferral();
        if (referralData && !error) {
            setData(referralData);
        } else if (error) {
            setData(null);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchReferral();
        }, [fetchReferral])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchReferral();
    };

    const handleCopy = async () => {
        if (data?.code) {
            await Clipboard.setStringAsync(data.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (data?.code) {
            try {
                await Share.share({
                    message: t('referral.shareMessage', { code: data.code }),
                });
            } catch (error) {
                // User cancelled
            }
        }
    };

    const handleApplyCode = async () => {
        if (!applyCode.trim()) return;
        setApplying(true);
        const { data: result, error } = await api.applyReferralCode(applyCode.trim());
        setApplying(false);
        if (error) {
            Alert.alert(t('common.error'), error);
        } else if (result?.success) {
            Alert.alert(t('referral.success'), result.message || t('referral.codeApplied'));
            setApplyCode('');
        }
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

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('referral.title'),
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
                {/* Referral Code Card */}
                <View className="mx-5 mt-5 p-6 rounded-2xl bg-primary items-center">
                    <View className="mb-3">
                        <FontAwesome name="gift" size={32} color="#fff" />
                    </View>
                    <Text className="text-white/80 text-sm mb-2">{t('referral.yourCode')}</Text>
                    <Text className="text-white text-3xl font-bold tracking-widest mb-5">
                        {data?.code || '---'}
                    </Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-row items-center gap-2 bg-white/20 px-5 py-2.5 rounded-lg"
                            onPress={handleCopy}
                        >
                            <FontAwesome name={copied ? 'check' : 'copy'} size={16} color="#fff" />
                            <Text className="text-white font-semibold">
                                {copied ? t('referral.copied') : t('referral.copy')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-2 bg-white px-5 py-2.5 rounded-lg"
                            onPress={handleShare}
                        >
                            <FontAwesome name="share" size={16} color="#E63946" />
                            <Text className="text-primary font-semibold">{t('referral.share')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-white/70 text-xs mt-4 text-center">
                        {t('referral.shareHint')}
                    </Text>
                </View>

                {/* Stats */}
                <View className="flex-row mx-5 mt-4 gap-3">
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <FontAwesome name="users" size={20} color="#E63946" />
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                            {data?.totalReferrals || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            {t('referral.totalReferrals')}
                        </Text>
                    </View>
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <FontAwesome name="clock-o" size={20} color="#f59e0b" />
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                            {data?.pendingReferrals || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            {t('referral.pending')}
                        </Text>
                    </View>
                    <View className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 items-center">
                        <FontAwesome name="money" size={20} color="#16a34a" />
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-2">
                            ৳{data?.totalEarned || 0}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                            {t('referral.earned')}
                        </Text>
                    </View>
                </View>

                {/* How it works */}
                <View className="mx-5 mt-4 p-4 rounded-2xl bg-white dark:bg-gray-800">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        {t('referral.howItWorks')}
                    </Text>
                    <View className="flex-row items-center mb-3">
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center mr-3">
                            <Text className="text-white font-bold">1</Text>
                        </View>
                        <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                            {t('referral.step1')}
                        </Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center mr-3">
                            <Text className="text-white font-bold">2</Text>
                        </View>
                        <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                            {t('referral.step2')}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center mr-3">
                            <Text className="text-white font-bold">3</Text>
                        </View>
                        <Text className="flex-1 text-sm text-gray-900 dark:text-white">
                            {t('referral.step3')}
                        </Text>
                    </View>
                </View>

                {/* Apply Code */}
                <View className="mx-5 mt-4 p-4 rounded-2xl bg-white dark:bg-gray-800">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        {t('referral.haveCode')}
                    </Text>
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                            placeholder={t('referral.enterCode')}
                            placeholderTextColor="#9CA3AF"
                            value={applyCode}
                            onChangeText={(text) => setApplyCode(text.toUpperCase())}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            className={`bg-primary px-5 py-2.5 rounded-lg justify-center ${!applyCode.trim() ? 'opacity-50' : ''}`}
                            onPress={handleApplyCode}
                            disabled={applying || !applyCode.trim()}
                        >
                            <Text className="text-white font-semibold">
                                {applying ? t('referral.applying') : t('referral.apply')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
