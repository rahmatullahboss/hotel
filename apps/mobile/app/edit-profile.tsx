import { useState, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MdPerson, MdPhone, MdCheck } from 'react-icons/md';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import api from '@/lib/api';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
}

export default function EditProfileScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        const { data, error } = await api.getProfile();
        if (data) {
            setProfile(data);
            setName(data.name || '');
            setPhone(data.phone || '');
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('editProfile.namePlaceholder'));
            return;
        }

        setSaving(true);
        const { data, error } = await api.updateProfile({
            name: name.trim(),
            phone: phone.trim() || undefined,
        });

        setSaving(false);

        if (error) {
            Alert.alert(t('common.error'), t('editProfile.error'));
        } else {
            Alert.alert(t('editProfile.success'), '', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('editProfile.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Email (Read-only) */}
                    <View style={[styles.inputGroup, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Email
                        </Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                            <Text style={[styles.emailText, { color: colors.textSecondary }]}>
                                {profile?.email || ''}
                            </Text>
                        </View>
                    </View>

                    {/* Name Input */}
                    <View style={[styles.inputGroup, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('editProfile.name')}
                        </Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MdPerson size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('editProfile.namePlaceholder')}
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Phone Input */}
                    <View style={[styles.inputGroup, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            {t('editProfile.phone')}
                        </Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <MdPhone size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder={t('editProfile.phonePlaceholder')}
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MdCheck size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>{t('editProfile.save')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    emailText: {
        fontSize: 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
