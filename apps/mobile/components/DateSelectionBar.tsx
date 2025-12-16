import { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface DateSelectionBarProps {
    checkIn: Date;
    checkOut: Date;
    onDatesChange: (checkIn: Date, checkOut: Date) => void;
    variant?: 'light' | 'dark';
    compact?: boolean;
}

export default function DateSelectionBar({
    checkIn,
    checkOut,
    onDatesChange,
    variant = 'light',
    compact = false,
}: DateSelectionBarProps) {
    const { t, i18n } = useTranslation();
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    };

    const formatShortDate = (date: Date) => {
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    const handleCheckInChange = (selectedDate: Date) => {
        // Auto-adjust checkout if it's before or same as checkin
        let newCheckOut = checkOut;
        if (selectedDate >= checkOut) {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            newCheckOut = nextDay;
        }
        onDatesChange(selectedDate, newCheckOut);
        setShowCheckInPicker(false);
    };

    const handleCheckOutChange = (selectedDate: Date) => {
        onDatesChange(checkIn, selectedDate);
        setShowCheckOutPicker(false);
    };

    // Generate next 60 days for check-in
    const checkInDateOptions = useMemo(() => {
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    // Generate check-out options (must be after check-in)
    const checkOutDateOptions = useMemo(() => {
        const dates: Date[] = [];
        const minDate = new Date(checkIn);
        minDate.setDate(minDate.getDate() + 1);
        for (let i = 0; i < 60; i++) {
            const date = new Date(minDate);
            date.setDate(minDate.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, [checkIn]);

    const bgColor = variant === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';
    const subtextColor = variant === 'light' ? 'text-gray-500' : 'text-gray-400';
    const borderColor = variant === 'light' ? 'border-gray-200' : 'border-gray-700';

    if (compact) {
        return (
            <>
                <TouchableOpacity
                    className={`flex-row items-center ${bgColor} px-4 py-3 rounded-xl border ${borderColor}`}
                    onPress={() => setShowCheckInPicker(true)}
                    activeOpacity={0.7}
                >
                    <FontAwesome name="calendar" size={16} color="#E63946" />
                    <Text className={`ml-2 ${textColor} font-semibold`}>
                        {formatShortDate(checkIn)} - {formatShortDate(checkOut)}
                    </Text>
                    <Text className={`ml-2 ${subtextColor} text-sm`}>
                        ({nights} {nights === 1 ? t('booking.night') : t('booking.nights')})
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                {/* Date Picker Modals */}
                {renderDatePickerModals()}
            </>
        );
    }

    function renderDatePickerModals() {
        return (
            <>
                {/* Check-in Picker Modal */}
                <Modal
                    visible={showCheckInPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCheckInPicker(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-96">
                            <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('booking.selectCheckInDate', 'Select Check-in Date')}
                                </Text>
                                <TouchableOpacity onPress={() => setShowCheckInPicker(false)}>
                                    <FontAwesome name="times" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={checkInDateOptions}
                                keyExtractor={(item) => item.toISOString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 ${formatDate(item) === formatDate(checkIn) ? 'bg-primary/10' : ''}`}
                                        onPress={() => handleCheckInChange(item)}
                                    >
                                        <Text className={`text-base ${formatDate(item) === formatDate(checkIn) ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                                            {formatDisplayDate(item)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Check-out Picker Modal */}
                <Modal
                    visible={showCheckOutPicker}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCheckOutPicker(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-96">
                            <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('booking.selectCheckOutDate', 'Select Check-out Date')}
                                </Text>
                                <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}>
                                    <FontAwesome name="times" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={checkOutDateOptions}
                                keyExtractor={(item) => item.toISOString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 ${formatDate(item) === formatDate(checkOut) ? 'bg-primary/10' : ''}`}
                                        onPress={() => handleCheckOutChange(item)}
                                    >
                                        <Text className={`text-base ${formatDate(item) === formatDate(checkOut) ? 'text-primary font-bold' : 'text-gray-900 dark:text-white'}`}>
                                            {formatDisplayDate(item)}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                </Modal>
            </>
        );
    }

    return (
        <>
            <View className={`flex-row ${bgColor} rounded-2xl p-3 gap-2`} style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }}>
                {/* Check-in */}
                <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border ${borderColor}`}
                    onPress={() => setShowCheckInPicker(true)}
                    activeOpacity={0.7}
                >
                    <Text className={`text-xs ${subtextColor} mb-1`}>
                        {t('bookings.checkIn', 'Check-in')}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <FontAwesome name="calendar" size={14} color="#E63946" />
                        <Text className={`${textColor} font-semibold`}>
                            {formatShortDate(checkIn)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Nights Badge */}
                <View className="items-center justify-center px-2">
                    <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                        <Text className="text-primary text-xs font-bold">
                            {nights} {nights === 1 ? t('booking.night', 'night') : t('booking.nights', 'nights')}
                        </Text>
                    </View>
                </View>

                {/* Check-out */}
                <TouchableOpacity
                    className={`flex-1 p-3 rounded-xl border ${borderColor}`}
                    onPress={() => setShowCheckOutPicker(true)}
                    activeOpacity={0.7}
                >
                    <Text className={`text-xs ${subtextColor} mb-1`}>
                        {t('bookings.checkOut', 'Check-out')}
                    </Text>
                    <View className="flex-row items-center gap-2">
                        <FontAwesome name="calendar" size={14} color="#E63946" />
                        <Text className={`${textColor} font-semibold`}>
                            {formatShortDate(checkOut)}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {renderDatePickerModals()}
        </>
    );
}
