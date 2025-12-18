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
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                };
            case 'strong':
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                };
            case 'medium':
            default:
                return {
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
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
