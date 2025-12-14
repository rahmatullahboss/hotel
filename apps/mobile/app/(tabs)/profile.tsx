import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api, { removeToken } from '@/lib/api';

interface User {
    name: string;
    email: string;
    image?: string;
}

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data, error } = await api.getProfile();
        if (!error && data) {
            setUser(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await removeToken();
        // Navigate to login or home
        router.replace('/');
    };

    const menuItems = [
        { icon: 'history' as const, label: 'Booking History', route: '/(tabs)/bookings' },
        { icon: 'heart' as const, label: 'Saved Hotels', route: '/saved' },
        { icon: 'credit-card' as const, label: 'Payment Methods', route: '/payment-methods' },
        { icon: 'bell' as const, label: 'Notifications', route: '/notifications' },
        { icon: 'cog' as const, label: 'Settings', route: '/settings' },
        { icon: 'question-circle' as const, label: 'Help & Support', route: '/help' },
    ];

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Profile Header */}
            <View style={[styles.profileHeader, { backgroundColor: Colors.primary }]}>
                <View style={styles.avatarContainer}>
                    {user?.image ? (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.avatar}>
                            <FontAwesome name="user" size={40} color="#fff" />
                        </View>
                    )}
                </View>
                {user ? (
                    <>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <Text style={styles.userName}>Guest User</Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push('/login')}
                        >
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Menu Items */}
            <View style={[styles.menuSection, { backgroundColor: colors.background }]}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.label}
                        style={[
                            styles.menuItem,
                            {
                                backgroundColor: colors.backgroundSecondary,
                                borderBottomColor: colors.border,
                                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                            }
                        ]}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.primary}20` }]}>
                            <FontAwesome name={item.icon} size={18} color={Colors.primary} />
                        </View>
                        <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                        <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            {user && (
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleLogout}
                >
                    <FontAwesome name="sign-out" size={18} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                </TouchableOpacity>
            )}

            {/* App Info */}
            <View style={[styles.appInfo, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                    Vibe Hospitality v1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileHeader: {
        paddingTop: 60,
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    loginButton: {
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    menuSection: {
        marginTop: 20,
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
    appInfo: {
        alignItems: 'center',
        padding: 24,
    },
    appVersion: {
        fontSize: 12,
    },
});
