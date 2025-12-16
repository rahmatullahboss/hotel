import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: number;
    editable?: boolean;
    onRatingChange?: (rating: number) => void;
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = 20,
    editable = false,
    onRatingChange,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const currentRating = hoverRating || rating;

    const handlePress = (index: number) => {
        if (editable && onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    return (
        <View className="flex-row gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const isFilled = index < currentRating;
                const isHalf = !isFilled && index < currentRating + 0.5;

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handlePress(index)}
                        disabled={!editable}
                        activeOpacity={editable ? 0.7 : 1}
                    >
                        <FontAwesome
                            name={isFilled ? "star" : isHalf ? "star-half-o" : "star-o"}
                            size={size}
                            color="#F59E0B"
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
