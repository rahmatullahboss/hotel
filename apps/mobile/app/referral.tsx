import { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Share,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Text, View } from '@/components/Themed';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

interface ReferralData {
    code: string;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    totalEarned: number;
    referralHistory: any[];
}

export default function ReferralScreen() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [applyCode, setApplyCode] = useState('');
    const [applying, setApplying] = useState(false);

    const fetchReferral = useCallback(async () => {
        const { data: referralData } = await api.getReferral();
        if (referralData) {
            setData(referralData);
        }
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchReferral();
    }, [fetchReferral]);

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
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('referral.title'),
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
                {/* Referral Code Card */}
                <View style={styles.codeCard}>
                    <View style={[styles.giftIcon, { backgroundColor: 'transparent' }]}>
                        <FontAwesome name="gift" size={32} color="#fff" />
                    </View>
                    <Text style={styles.codeLabel}>{t('referral.yourCode')}</Text>
                    <Text style={styles.codeText}>{data?.code || '---'}</Text>
                    <View style={[styles.codeActions, { backgroundColor: 'transparent' }]}>
                        <TouchableOpacity style={styles.codeBtn} onPress={handleCopy}>
                            <FontAwesome name={copied ? 'check' : 'copy'} size={16} color="#fff" />
                            <Text style={styles.codeBtnText}>
                                {copied ? t('referral.copied') : t('referral.copy')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.codeBtn, styles.codeBtnOutline]} onPress={handleShare}>
                            <FontAwesome name="share" size={16} color={Colors.primary} />
                            <Text style={[styles.codeBtnText, { color: Colors.primary }]}>
                                {t('referral.share')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.codeHint}>{t('referral.shareHint')}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <FontAwesome name="users" size={20} color={Colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {data?.totalReferrals || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            {t('referral.totalReferrals')}
                        </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <FontAwesome name="clock-o" size={20} color="#f59e0b" />
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {data?.pendingReferrals || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            {t('referral.pending')}
                        </Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                        <FontAwesome name="money" size={20} color="#16a34a" />
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            ৳{data?.totalEarned || 0}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            {t('referral.earned')}
                        </Text>
                    </View>
                </View>

                {/* How it works */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('referral.howItWorks')}
                    </Text>
                    <View style={[styles.step, { backgroundColor: 'transparent' }]}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                        <Text style={[styles.stepText, { color: colors.text }]}>{t('referral.step1')}</Text>
                    </View>
                    <View style={[styles.step, { backgroundColor: 'transparent' }]}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                        <Text style={[styles.stepText, { color: colors.text }]}>{t('referral.step2')}</Text>
                    </View>
                    <View style={[styles.step, { backgroundColor: 'transparent' }]}>
                        <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                        <Text style={[styles.stepText, { color: colors.text }]}>{t('referral.step3')}</Text>
                    </View>
                </View>

                {/* Apply Code */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {t('referral.haveCode')}
                    </Text>
                    <View style={[styles.applyRow, { backgroundColor: 'transparent' }]}>
                        <TextInput
                            style={[styles.applyInput, { borderColor: colors.border, color: colors.text }]}
                            placeholder={t('referral.enterCode')}
                            placeholderTextColor={colors.textSecondary}
                            value={applyCode}
                            onChangeText={(text) => setApplyCode(text.toUpperCase())}
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            style={[styles.applyBtn, !applyCode.trim() && styles.applyBtnDisabled]}
                            onPress={handleApplyCode}
                            disabled={applying || !applyCode.trim()}
                        >
                            <Text style={styles.applyBtnText}>
                                {applying ? t('referral.applying') : t('referral.apply')}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    codeCard: {
        margin: 20,
        padding: 24,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
    },
    giftIcon: {
        marginBottom: 12,
    },
    codeLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    codeText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 20,
    },
    codeActions: {
        flexDirection: 'row',
        gap: 12,
    },
    codeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    codeBtnOutline: {
        backgroundColor: '#fff',
    },
    codeBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
    codeHint: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 16,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontWeight: '700',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
    },
    applyRow: {
        flexDirection: 'row',
        gap: 12,
    },
    applyInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    applyBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyBtnDisabled: {
        opacity: 0.5,
    },
    applyBtnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
