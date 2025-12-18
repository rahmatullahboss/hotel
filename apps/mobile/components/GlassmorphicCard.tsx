import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface GlassmorphicCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: 'light' | 'medium' | 'strong';
}

/**
 * A reusable glassmorphism card component that creates a frosted glass effect.
 * Uses semi-transparent backgrounds with subtle borders for depth.
 */
export function GlassmorphicCard({
    children,
    style,
    intensity = 'medium',
}: GlassmorphicCardProps) {
    const getIntensityStyles = () => {
        switch (intensity) {
            case 'light':
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                };
            case 'strong':
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                };
            case 'medium':
            default:
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                };
        }
    };

    const intensityStyles = getIntensityStyles();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: intensityStyles.backgroundColor,
                    borderColor: intensityStyles.borderColor,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
});
