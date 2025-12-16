import { View, Text, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import StarRating from './StarRating';

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        title: string | null;
        content: string | null;
        userName: string;
        userImage?: string | null;
        createdAt: string;
        hotelResponse?: string | null;
        cleanlinessRating?: number | null;
        serviceRating?: number | null;
        valueRating?: number | null;
        locationRating?: number | null;
    };
    showBreakdown?: boolean;
}

export default function ReviewCard({ review, showBreakdown = false }: ReviewCardProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const hasBreakdown = showBreakdown && (
        review.cleanlinessRating ||
        review.serviceRating ||
        review.valueRating ||
        review.locationRating
    );

    return (
        <View className={`p-4 rounded-xl mb-3 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            {/* Header */}
            <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 items-center justify-center overflow-hidden mr-3">
                    {review.userImage ? (
                        <Image source={{ uri: review.userImage }} className="w-10 h-10" />
                    ) : (
                        <FontAwesome name="user" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {review.userName}
                    </Text>
                    <Text className="text-xs text-gray-400">{formatDate(review.createdAt)}</Text>
                </View>
                <StarRating rating={review.rating} size={14} />
            </View>

            {/* Title */}
            {review.title && (
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {review.title}
                </Text>
            )}

            {/* Content */}
            {review.content && (
                <Text className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {review.content}
                </Text>
            )}

            {/* Breakdown Ratings */}
            {hasBreakdown && (
                <View className="flex-row flex-wrap gap-2 mb-3">
                    {review.cleanlinessRating && (
                        <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('reviews.cleanliness', 'Cleanliness')}</Text>
                            <Text className="text-xs font-semibold text-amber-500">{review.cleanlinessRating}</Text>
                        </View>
                    )}
                    {review.serviceRating && (
                        <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('reviews.service', 'Service')}</Text>
                            <Text className="text-xs font-semibold text-amber-500">{review.serviceRating}</Text>
                        </View>
                    )}
                    {review.valueRating && (
                        <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('reviews.value', 'Value')}</Text>
                            <Text className="text-xs font-semibold text-amber-500">{review.valueRating}</Text>
                        </View>
                    )}
                    {review.locationRating && (
                        <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('reviews.location', 'Location')}</Text>
                            <Text className="text-xs font-semibold text-amber-500">{review.locationRating}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Hotel Response */}
            {review.hotelResponse && (
                <View className="p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                    <Text className="text-xs font-semibold text-primary mb-1">
                        {t('reviews.hotelResponse', 'Hotel Response')}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {review.hotelResponse}
                    </Text>
                </View>
            )}
        </View>
    );
}
