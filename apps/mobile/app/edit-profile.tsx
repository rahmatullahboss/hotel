import { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
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
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const fetchProfile = useCallback(async () => {
        const { data, error } = await api.getProfile();
        if (data) {
            setProfile(data);
            setName(data.name || '');
            setPhone(data.phone || '');
            setImage(data.image || null);
        }
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [fetchProfile])
    );

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('editProfile.permissionRequired', 'Permission Required'),
                t('editProfile.galleryPermission', 'Please allow access to your photo library to change your profile picture.')
            );
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5, // Compress for smaller file size
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                // Create data URL
                const mimeType = asset.mimeType || 'image/jpeg';
                const dataUrl = `data:${mimeType};base64,${asset.base64}`;
                setImage(dataUrl);
            }
        }
    };

    const takePhoto = async () => {
        // Request permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                t('editProfile.permissionRequired', 'Permission Required'),
                t('editProfile.cameraPermission', 'Please allow access to your camera to take a profile picture.')
            );
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                const mimeType = asset.mimeType || 'image/jpeg';
                const dataUrl = `data:${mimeType};base64,${asset.base64}`;
                setImage(dataUrl);
            }
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            t('editProfile.changePhoto', 'Change Photo'),
            t('editProfile.chooseOption', 'Choose an option'),
            [
                {
                    text: t('editProfile.takePhoto', 'Take Photo'),
                    onPress: takePhoto,
                },
                {
                    text: t('editProfile.chooseFromGallery', 'Choose from Gallery'),
                    onPress: pickImage,
                },
                ...(image ? [{
                    text: t('editProfile.removePhoto', 'Remove Photo'),
                    style: 'destructive' as const,
                    onPress: () => setImage(null),
                }] : []),
                {
                    text: t('common.cancel', 'Cancel'),
                    style: 'cancel' as const,
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('editProfile.namePlaceholder'));
            return;
        }

        setSaving(true);
        const { data, error } = await api.updateProfile({
            name: name.trim(),
            phone: phone.trim() || undefined,
            image: image, // Can be null to remove, or base64 data URL
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
            <View className="flex-1 bg-white dark:bg-gray-900">
                <Stack.Screen
                    options={{
                        headerShown: true,
                        title: t('editProfile.title'),
                        headerStyle: { backgroundColor: '#E63946' },
                        headerTintColor: '#fff',
                    }}
                />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#E63946" />
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('editProfile.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 20 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profile Picture Section */}
                    <View className="items-center mb-8">
                        <TouchableOpacity
                            onPress={showImageOptions}
                            activeOpacity={0.8}
                            className="relative"
                        >
                            <View className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
                                {image ? (
                                    <Image
                                        source={{ uri: image }}
                                        className="w-full h-full"
                                        style={{ width: 112, height: 112 }}
                                    />
                                ) : (
                                    <FontAwesome name="user" size={48} color="#9CA3AF" />
                                )}
                            </View>
                            {/* Camera badge */}
                            <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary items-center justify-center shadow-md border-2 border-white dark:border-gray-800">
                                <FontAwesome name="camera" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                            {t('editProfile.tapToChange', 'Tap to change photo')}
                        </Text>
                    </View>

                    {/* Email (Read-only) */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Email
                        </Text>
                        <View className="flex-row items-center border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3.5 gap-3 bg-gray-100 dark:bg-gray-800">
                            <Text className="text-base text-gray-500 dark:text-gray-400">
                                {profile?.email || ''}
                            </Text>
                        </View>
                    </View>

                    {/* Name Input */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {t('editProfile.name')}
                        </Text>
                        <View className="flex-row items-center border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3.5 gap-3 bg-white dark:bg-gray-800">
                            <FontAwesome name="user-o" size={18} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 text-base text-gray-900 dark:text-white"
                                value={name}
                                onChangeText={setName}
                                placeholder={t('editProfile.namePlaceholder')}
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>

                    {/* Phone Input */}
                    <View className="mb-5">
                        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {t('editProfile.phone')}
                        </Text>
                        <View className="flex-row items-center border border-gray-200 dark:border-gray-600 rounded-xl px-3.5 py-3.5 gap-3 bg-white dark:bg-gray-800">
                            <FontAwesome name="phone" size={18} color="#9CA3AF" />
                            <TextInput
                                className="flex-1 text-base text-gray-900 dark:text-white"
                                value={phone}
                                onChangeText={setPhone}
                                placeholder={t('editProfile.phonePlaceholder')}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        className={`flex-row items-center justify-center bg-primary py-4 rounded-xl mt-5 gap-2 ${saving ? 'opacity-70' : ''}`}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <FontAwesome name="check" size={18} color="#fff" />
                                <Text className="text-white text-base font-semibold">
                                    {t('editProfile.save')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
