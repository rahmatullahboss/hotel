import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    interpolateColor,
    Easing,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface FloatingLabelInputProps extends Omit<TextInputProps, 'style'> {
    label: string;
    icon?: keyof typeof FontAwesome.glyphMap;
    isPassword?: boolean;
    value: string;
    onChangeText: (text: string) => void;
}

/**
 * Premium floating label input with smooth animations.
 * Features animated label, focus states, and optional password toggle.
 */
export function FloatingLabelInput({
    label,
    icon,
    isPassword = false,
    value,
    onChangeText,
    ...props
}: FloatingLabelInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animation value: 0 = label down, 1 = label up
    const labelPosition = useSharedValue(value ? 1 : 0);
    const focusAnimation = useSharedValue(0);

    useEffect(() => {
        labelPosition.value = withTiming(isFocused || value ? 1 : 0, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
        });
        focusAnimation.value = withTiming(isFocused ? 1 : 0, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
        });
    }, [isFocused, value, labelPosition, focusAnimation]);

    const animatedLabelStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        labelPosition.value,
                        [0, 1],
                        [0, -24]
                    ),
                },
                {
                    scale: interpolate(labelPosition.value, [0, 1], [1, 0.85]),
                },
            ],
            color: interpolateColor(
                focusAnimation.value,
                [0, 1],
                ['#6B7280', '#E63946']
            ),
        };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(
                focusAnimation.value,
                [0, 1],
                ['#E5E7EB', 'rgba(230, 57, 70, 0.6)']
            ),
            backgroundColor: interpolateColor(
                focusAnimation.value,
                [0, 1],
                ['#F3F4F6', '#FEF2F2']
            ),
        };
    });

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(focusAnimation.value, [0, 1], [0.5, 0.9]),
        };
    });

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            {icon && (
                <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                    <FontAwesome name={icon} size={18} color="#6B7280" />
                </Animated.View>
            )}
            <View style={styles.inputWrapper}>
                <Animated.Text style={[styles.label, animatedLabelStyle]}>
                    {label}
                </Animated.Text>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    placeholderTextColor="transparent"
                    {...props}
                />
            </View>
            {isPassword && (
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <FontAwesome
                        name={showPassword ? 'eye-slash' : 'eye'}
                        size={18}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 16,
        minHeight: 56,
    },
    iconContainer: {
        width: 24,
        marginRight: 12,
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 8,
    },
    label: {
        position: 'absolute',
        left: 0,
        top: 16,
        fontSize: 16,
        fontWeight: '400',
    },
    input: {
        fontSize: 16,
        color: '#111827',
        paddingVertical: 8,
        paddingTop: 12,
    },
    eyeButton: {
        padding: 4,
    },
});
