import { useState, useEffect } from 'react';
import {
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import api, { removeToken } from '@/lib/api';

interface User {
    name: string;
    email: string;
    image?: string;
}

const MENU_ITEMS = [
    { icon: 'suitcase' as const, label: 'My Trips', route: '/(tabs)/bookings' },
    { icon: 'heart-o' as const, label: 'Saved Hotels', route: '/saved' },
    { icon: 'credit-card' as const, label: 'Payment Methods', route: '/payment-methods' },
    { icon: 'bell-o' as const, label: 'Notifications', route: '/notifications' },
    { icon: 'gift' as const, label: 'Offers & Rewards', route: '/offers' },
    { icon: 'question-circle-o' as const, label: 'Help & Support', route: '/help' },
    { icon: 'cog' as const, label: 'Settings', route: '/settings' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const colors = Colors.light; // Force light theme
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const { data } = await api.getProfile();
        if (data) {
            setUser(data);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await removeToken();
        router.replace('/');
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: Colors.primary }]}>
                {user ? (
                    <>
                        <View style={styles.avatarContainer}>
                            {user.image ? (
                                <Image source={{ uri: user.image }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                    </>
                ) : (
                    <>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                <FontAwesome name="user" size={32} color="#fff" />
                            </View>
                        </View>
                        <Text style={styles.userName}>Guest</Text>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push('/auth/login')}
                        >
                            <Text style={styles.loginButtonText}>Sign In / Register</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[
                                styles.menuItem,
                                {
                                    backgroundColor: colors.card,
                                    borderBottomColor: colors.border,
                                    borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                                }
                            ]}
                            onPress={() => router.push(item.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIconContainer, { backgroundColor: `${Colors.primary}10` }]}>
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
                        <FontAwesome name="sign-out" size={18} color={Colors.light.error} />
                        <Text style={[styles.logoutText, { color: Colors.light.error }]}>Log Out</Text>
                    </TouchableOpacity>
                )}

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
                        Vibe Hospitality v1.0.0
                    </Text>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    loginButton: {
        marginTop: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
    },
    loginButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    menuSection: {
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        gap: 10,
    },
    logoutText: {
        fontSize: 15,
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
