import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedGradientBackgroundProps {
    children?: React.ReactNode;
    colors?: readonly [string, string, ...string[]];
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const DEFAULT_COLORS = ['#1D3557', '#1a2d4d', '#132238', '#1D3557'] as const;

/**
 * Premium animated gradient background component.
 * Features subtle floating orbs and a rich gradient backdrop.
 */
export function AnimatedGradientBackground({
    children,
    colors = DEFAULT_COLORS,
}: AnimatedGradientBackgroundProps) {
    // Animated orb positions
    const orb1Y = useSharedValue(0);
    const orb2Y = useSharedValue(0);
    const orb3Y = useSharedValue(0);

    React.useEffect(() => {
        orb1Y.value = withRepeat(
            withTiming(30, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
        orb2Y.value = withRepeat(
            withTiming(-25, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
        orb3Y.value = withRepeat(
            withTiming(20, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, [orb1Y, orb2Y, orb3Y]);

    const orb1Style = useAnimatedStyle(() => ({
        transform: [{ translateY: orb1Y.value }],
    }));

    const orb2Style = useAnimatedStyle(() => ({
        transform: [{ translateY: orb2Y.value }],
    }));

    const orb3Style = useAnimatedStyle(() => ({
        transform: [{ translateY: orb3Y.value }],
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={colors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Floating gradient orbs */}
            <Animated.View style={[styles.orb, styles.orb1, orb1Style]}>
                <LinearGradient
                    colors={['rgba(230, 57, 70, 0.35)', 'rgba(230, 57, 70, 0)']}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>

            <Animated.View style={[styles.orb, styles.orb2, orb2Style]}>
                <LinearGradient
                    colors={['rgba(193, 18, 31, 0.3)', 'rgba(193, 18, 31, 0)']}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>

            <Animated.View style={[styles.orb, styles.orb3, orb3Style]}>
                <LinearGradient
                    colors={['rgba(29, 53, 87, 0.4)', 'rgba(29, 53, 87, 0)']}
                    style={styles.orbGradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    orb: {
        position: 'absolute',
        borderRadius: 999,
        overflow: 'hidden',
    },
    orbGradient: {
        width: '100%',
        height: '100%',
    },
    orb1: {
        width: width * 0.8,
        height: width * 0.8,
        top: -width * 0.2,
        right: -width * 0.3,
    },
    orb2: {
        width: width * 0.6,
        height: width * 0.6,
        bottom: height * 0.15,
        left: -width * 0.2,
    },
    orb3: {
        width: width * 0.5,
        height: width * 0.5,
        top: height * 0.4,
        right: -width * 0.15,
    },
});
