import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import api from '@/lib/api';

interface CancellationInfo {
    type: 'ADVANCE_PAYMENT';
    isLate: boolean;
    isVeryLate?: boolean;
    hoursRemaining: number;
    penalty: string | null;
    refund: number;
}

interface CancelBookingModalProps {
    visible: boolean;
    bookingId: string;
    hotelName: string;
    onClose: () => void;
    onSuccess: (refundAmount: number) => void;
}

const CANCELLATION_REASONS = [
    { value: 'PLAN_CHANGED', labelKey: 'planChanged' },
    { value: 'FOUND_BETTER_DEAL', labelKey: 'foundBetterDeal' },
    { value: 'EMERGENCY', labelKey: 'emergency' },
    { value: 'TRAVEL_CANCELLED', labelKey: 'travelCancelled' },
    { value: 'PRICE_ISSUE', labelKey: 'priceIssue' },
    { value: 'OTHER', labelKey: 'other' },
];

export default function CancelBookingModal({
    visible,
    bookingId,
    hotelName,
    onClose,
    onSuccess,
}: CancelBookingModalProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [policyInfo, setPolicyInfo] = useState<CancellationInfo | null>(null);

    useEffect(() => {
        if (visible && bookingId) {
            fetchCancellationInfo();
        }
    }, [visible, bookingId]);

    const fetchCancellationInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await api.getCancellationInfo(bookingId);
            if (error) {
                setError(error);
            } else if (data) {
                // The API returns booking data with cancellationInfo nested
                const info = (data as any).cancellationInfo;
                if (info) {
                    setPolicyInfo(info);
                }
            }
        } catch (err) {
            setError('Failed to load cancellation info');
        }
        setLoading(false);
    };

    const handleCancel = async () => {
        if (!selectedReason) {
            setError(t('cancelModal.selectReason', 'Please select a reason'));
            return;
        }

        setCancelling(true);
        setError(null);

        try {
            const { data, error } = await api.cancelBooking(bookingId, selectedReason);
            if (error || !data?.success) {
                setError(error || 'Failed to cancel booking');
                setCancelling(false);
                return;
            }

            onSuccess(data.refundAmount || 0);
        } catch (err) {
            setError('Failed to cancel booking');
            setCancelling(false);
        }
    };

    const formatHours = (hours: number) => {
        if (hours < 1) {
            return t('cancelModal.lessThanHour', 'Less than 1 hour');
        }
        if (hours < 24) {
            return t('cancelModal.hoursUntil', { hours: Math.floor(hours) });
        }
        const days = Math.floor(hours / 24);
        return t('cancelModal.daysUntil', { days });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('cancelModal.title', 'Cancel Booking')}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <FontAwesome name="times" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    </View>

                    {/* Hotel Name */}
                    <Text className={`text-base mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {hotelName}
                    </Text>

                    {loading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#E63946" />
                        </View>
                    ) : (
                        <>
                            {/* Policy Info */}
                            {policyInfo && (
                                <View className={`rounded-xl p-4 mb-4 ${policyInfo.refund > 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
                                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        ⏰ {formatHours(policyInfo.hoursRemaining)} {t('cancelModal.untilCheckIn', 'until check-in')}
                                    </Text>

                                    {policyInfo.refund > 0 ? (
                                        <Text className="text-green-600 dark:text-green-400 font-semibold mt-2">
                                            ✓ ৳{policyInfo.refund.toLocaleString()} {t('cancelModal.willBeRefunded', 'will be refunded')}
                                        </Text>
                                    ) : policyInfo.penalty ? (
                                        <Text className="text-amber-600 dark:text-amber-400 font-semibold mt-2">
                                            ⚠️ {policyInfo.penalty}
                                        </Text>
                                    ) : (
                                        <Text className="text-green-600 dark:text-green-400 font-semibold mt-2">
                                            ✓ {t('cancelModal.freeCancellation', 'Free cancellation')}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {/* Reason Selection */}
                            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('cancelModal.reasonLabel', 'Reason for cancellation')}
                            </Text>
                            <View className="mb-4">
                                {CANCELLATION_REASONS.map((reason) => (
                                    <TouchableOpacity
                                        key={reason.value}
                                        onPress={() => {
                                            setSelectedReason(reason.value);
                                            setError(null);
                                        }}
                                        className={`flex-row items-center p-3 rounded-lg mb-2 border ${selectedReason === reason.value
                                            ? 'border-primary bg-primary/10'
                                            : isDark
                                                ? 'border-gray-600 bg-gray-700'
                                                : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selectedReason === reason.value
                                            ? 'border-primary bg-primary'
                                            : isDark ? 'border-gray-500' : 'border-gray-300'
                                            }`}>
                                            {selectedReason === reason.value && (
                                                <FontAwesome name="check" size={10} color="#FFFFFF" />
                                            )}
                                        </View>
                                        <Text className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {t(`cancelModal.reasons.${reason.labelKey}`, reason.labelKey)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Error */}
                            {error && (
                                <Text className="text-red-500 text-center mb-4">{error}</Text>
                            )}

                            {/* Buttons */}
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className={`flex-1 py-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                                    disabled={cancelling}
                                >
                                    <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                        {t('cancelModal.keepBooking', 'Keep Booking')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="flex-1 py-4 rounded-xl bg-red-500"
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text className="text-center font-semibold text-white">
                                            {t('cancelModal.confirm', 'Cancel Booking')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
