import { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configure Bengali locale
LocaleConfig.locales['bn'] = {
    monthNames: [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ],
    monthNamesShort: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
    dayNames: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
    dayNamesShort: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'],
    today: 'আজ'
};
LocaleConfig.locales['en'] = LocaleConfig.locales[''];

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
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [selectingCheckOut, setSelectingCheckOut] = useState(false);
    const [tempCheckIn, setTempCheckIn] = useState<string | null>(null);

    // Set locale based on language
    LocaleConfig.defaultLocale = i18n.language === 'bn' ? 'bn' : 'en';

    // Calculate nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const formatShortDate = (date: Date) => {
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            day: 'numeric',
            month: 'short',
        });
    };

    // Get today's date string
    const todayString = useMemo(() => {
        return new Date().toISOString().split('T')[0];
    }, []);

    // Generate marked dates for the calendar
    const markedDates = useMemo(() => {
        const checkInStr = formatDate(checkIn);
        const checkOutStr = formatDate(checkOut);

        const marks: { [key: string]: any } = {};

        // If in selection mode, show temporary selection
        if (tempCheckIn && selectingCheckOut) {
            marks[tempCheckIn] = {
                startingDay: true,
                color: '#E63946',
                textColor: 'white',
            };
            return marks;
        }

        // Show full range
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        let current = new Date(start);
        while (current <= end) {
            const dateStr = formatDate(current);
            if (dateStr === checkInStr) {
                marks[dateStr] = {
                    startingDay: true,
                    color: '#E63946',
                    textColor: 'white',
                };
            } else if (dateStr === checkOutStr) {
                marks[dateStr] = {
                    endingDay: true,
                    color: '#E63946',
                    textColor: 'white',
                };
            } else {
                marks[dateStr] = {
                    color: '#FECDD3',
                    textColor: '#E63946',
                };
            }
            current.setDate(current.getDate() + 1);
        }

        return marks;
    }, [checkIn, checkOut, tempCheckIn, selectingCheckOut]);

    const handleDayPress = (day: { dateString: string }) => {
        const selectedDate = new Date(day.dateString);

        if (!selectingCheckOut) {
            // First tap - select check-in date
            setTempCheckIn(day.dateString);
            setSelectingCheckOut(true);
        } else {
            // Second tap - select check-out date
            if (tempCheckIn) {
                const checkInDate = new Date(tempCheckIn);
                if (selectedDate > checkInDate) {
                    onDatesChange(checkInDate, selectedDate);
                    setShowCalendarModal(false);
                    setSelectingCheckOut(false);
                    setTempCheckIn(null);
                }
            }
        }
    };

    const openCalendar = () => {
        setTempCheckIn(null);
        setSelectingCheckOut(false);
        setShowCalendarModal(true);
    };

    const bgColor = variant === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';
    const subtextColor = variant === 'light' ? 'text-gray-500' : 'text-gray-400';
    const borderColor = variant === 'light' ? 'border-gray-200' : 'border-gray-700';

    const calendarTheme = {
        backgroundColor: '#ffffff',
        calendarBackground: '#ffffff',
        textSectionTitleColor: '#6B7280',
        selectedDayBackgroundColor: '#E63946',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#E63946',
        dayTextColor: '#1F2937',
        textDisabledColor: '#D1D5DB',
        dotColor: '#E63946',
        arrowColor: '#E63946',
        monthTextColor: '#1F2937',
        textDayFontWeight: '500' as const,
        textMonthFontWeight: 'bold' as const,
        textDayHeaderFontWeight: '600' as const,
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
    };

    if (compact) {
        return (
            <>
                <TouchableOpacity
                    className={`flex-row items-center ${bgColor} px-4 py-3 rounded-xl border ${borderColor}`}
                    onPress={openCalendar}
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

                {renderCalendarModal()}
            </>
        );
    }

    function renderCalendarModal() {
        return (
            <Modal
                visible={showCalendarModal}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setShowCalendarModal(false);
                    setSelectingCheckOut(false);
                    setTempCheckIn(null);
                }}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
                        {/* Header */}
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                            <View>
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                    {selectingCheckOut
                                        ? t('booking.selectCheckOutDate', 'Select Check-out Date')
                                        : t('booking.selectCheckInDate', 'Select Check-in Date')}
                                </Text>
                                {selectingCheckOut && tempCheckIn && (
                                    <Text className="text-sm text-primary mt-1">
                                        {t('booking.checkIn', 'Check-in')}: {new Date(tempCheckIn).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCalendarModal(false);
                                    setSelectingCheckOut(false);
                                    setTempCheckIn(null);
                                }}
                            >
                                <FontAwesome name="times" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        {/* Calendar */}
                        <Calendar
                            markingType="period"
                            markedDates={markedDates}
                            onDayPress={handleDayPress}
                            minDate={todayString}
                            theme={calendarTheme}
                            enableSwipeMonths
                            style={{
                                paddingBottom: 20,
                            }}
                        />

                        {/* Instructions */}
                        <View className="px-4 pb-6">
                            <View className="flex-row items-center justify-center gap-4">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-4 h-4 rounded-full bg-primary" />
                                    <Text className="text-sm text-gray-600">
                                        {t('booking.checkIn', 'Check-in')}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="w-4 h-4 rounded bg-primary/20" />
                                    <Text className="text-sm text-gray-600">
                                        {t('booking.nights', 'Nights')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
                    onPress={openCalendar}
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
                    onPress={openCalendar}
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

            {renderCalendarModal()}
        </>
    );
}
