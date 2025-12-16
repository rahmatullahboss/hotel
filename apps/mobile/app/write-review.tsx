import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import api from '@/lib/api';
import StarRating from '@/components/StarRating';

export default function WriteReviewScreen() {
    const params = useLocalSearchParams<{
        bookingId: string;
        hotelName?: string;
    }>();
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [cleanlinessRating, setCleanlinessRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [valueRating, setValueRating] = useState(0);
    const [locationRating, setLocationRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert(t('reviews.error', 'Error'), t('reviews.ratingRequired', 'Please select a rating'));
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await api.submitReview({
                bookingId: params.bookingId!,
                rating,
                title: title || undefined,
                content: content || undefined,
                cleanlinessRating: cleanlinessRating || undefined,
                serviceRating: serviceRating || undefined,
                valueRating: valueRating || undefined,
                locationRating: locationRating || undefined,
            });

            if (error || !data?.success) {
                Alert.alert(t('reviews.error', 'Error'), error || t('reviews.submitFailed', 'Failed to submit review'));
                setSubmitting(false);
                return;
            }

            Alert.alert(
                t('reviews.thankYou', 'Thank You!'),
                t('reviews.reviewSubmitted', 'Your review has been submitted'),
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err) {
            Alert.alert(t('reviews.error', 'Error'), t('reviews.submitFailed', 'Failed to submit review'));
            setSubmitting(false);
        }
    };

    const RatingRow = ({
        label,
        value,
        onChange
    }: {
        label: string;
        value: number;
        onChange: (v: number) => void;
    }) => (
        <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</Text>
            <StarRating rating={value} size={20} editable onRatingChange={onChange} />
        </View>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('reviews.writeReview', 'Write Review'),
                    headerStyle: { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
                    headerTintColor: isDark ? '#FFFFFF' : '#1F2937',
                }}
            />
            <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
                <View className="p-5">
                    {/* Hotel Name */}
                    {params.hotelName && (
                        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {params.hotelName}
                        </Text>
                    )}

                    {/* Overall Rating */}
                    <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('reviews.overallRating', 'Overall Rating')}
                        </Text>
                        <View className="items-center py-4">
                            <StarRating rating={rating} size={40} editable onRatingChange={setRating} />
                            <Text className="text-gray-400 text-sm mt-2">
                                {rating > 0 ? t(`reviews.ratings.${rating}`, '') : t('reviews.tapToRate', 'Tap to rate')}
                            </Text>
                        </View>
                    </View>

                    {/* Title & Content */}
                    <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('reviews.titleLabel', 'Title (Optional)')}
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder={t('reviews.titlePlaceholder', 'Summarize your experience')}
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`}
                        />

                        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('reviews.contentLabel', 'Your Review (Optional)')}
                        </Text>
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder={t('reviews.contentPlaceholder', 'Tell others about your stay...')}
                            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className={`p-3 rounded-lg min-h-[120px] ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`}
                        />
                    </View>

                    {/* Breakdown Ratings */}
                    <View className={`p-5 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t('reviews.rateAspects', 'Rate Different Aspects')}
                        </Text>
                        <RatingRow
                            label={t('reviews.cleanliness', 'Cleanliness')}
                            value={cleanlinessRating}
                            onChange={setCleanlinessRating}
                        />
                        <RatingRow
                            label={t('reviews.service', 'Service')}
                            value={serviceRating}
                            onChange={setServiceRating}
                        />
                        <RatingRow
                            label={t('reviews.value', 'Value for Money')}
                            value={valueRating}
                            onChange={setValueRating}
                        />
                        <RatingRow
                            label={t('reviews.location', 'Location')}
                            value={locationRating}
                            onChange={setLocationRating}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting || rating === 0}
                        className={`py-4 rounded-xl mb-8 ${rating === 0 ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary'}`}
                        activeOpacity={0.8}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white text-center font-bold text-base">
                                {t('reviews.submitReview', 'Submit Review')}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}
