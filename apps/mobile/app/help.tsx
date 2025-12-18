import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

const SUPPORT_EMAIL = 'rahmatullahzisan@gmail.com';
const SUPPORT_PHONE = '+8801570260118';
const SUPPORT_PHONE_DISPLAY = '01570-260118';
const WHATSAPP_URL = 'https://wa.me/8801570260118?text=Hello%2C%20I%20need%20help%20with%20Vibe%20Hotels';

export default function HelpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const faqItems = [
        { question: t('help.faq1_q'), answer: t('help.faq1_a') },
        { question: t('help.faq2_q'), answer: t('help.faq2_a') },
        { question: t('help.faq3_q'), answer: t('help.faq3_a') },
        { question: t('help.faq4_q'), answer: t('help.faq4_a') },
    ];

    const handleEmail = () => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Help%20Request%20-%20Vibe%20Hotels`);
    };

    const handlePhone = () => {
        Linking.openURL(`tel:${SUPPORT_PHONE}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(WHATSAPP_URL);
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('help.title'),
                    headerStyle: { backgroundColor: '#E63946' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                {/* Contact Options */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-5 mb-3">
                    {t('help.contactTitle')}
                </Text>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-2xl mb-3 bg-white dark:bg-gray-800"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                    onPress={handleEmail}
                >
                    <View className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 items-center justify-center mr-4">
                        <Text className="text-2xl">📧</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {t('help.emailSupport')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {SUPPORT_EMAIL}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-2xl mb-3 bg-white dark:bg-gray-800"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                    onPress={handlePhone}
                >
                    <View className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                        <Text className="text-2xl">📞</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {t('help.phoneSupport')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {SUPPORT_PHONE_DISPLAY}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                </TouchableOpacity>

                {/* AI Chat Support - Premium Card */}
                <TouchableOpacity
                    className="flex-row items-center p-5 rounded-2xl mb-3 bg-primary overflow-hidden"
                    style={{
                        shadowColor: '#E63946',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 6,
                    }}
                    onPress={() => router.push('/support-chat' as any)}
                >
                    <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mr-4">
                        <Text className="text-2xl">🤖</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-white">
                            {t('help.chatBot', 'Chat with Zinu AI')}
                        </Text>
                        <Text className="text-sm text-white/80 mt-0.5">
                            {t('help.instantHelp', 'Get instant help 24/7')}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-2xl mb-3 bg-white dark:bg-gray-800"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                    onPress={handleWhatsApp}
                >
                    <View className="w-12 h-12 rounded-xl bg-green-500 items-center justify-center mr-4">
                        <FontAwesome name="whatsapp" size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">
                            {t('help.whatsapp')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('help.chatInstant')}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                </TouchableOpacity>

                {/* FAQ Section */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">
                    {t('help.faqTitle')}
                </Text>

                {faqItems.map((item, index) => (
                    <View
                        key={index}
                        className="p-5 rounded-2xl mb-3 bg-white dark:bg-gray-800"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.06,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <View className="flex-row items-start gap-3 mb-2">
                            <Text className="text-lg">❓</Text>
                            <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">
                                {item.question}
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-6 ml-8">
                            {item.answer}
                        </Text>
                    </View>
                ))}

                {/* Legal Links */}
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3">
                    {t('help.legalTitle')}
                </Text>

                <View
                    className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700"
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/terms')}
                    >
                        <View className="flex-row items-center gap-3">
                            <Text className="text-lg">📄</Text>
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                                {t('help.terms')}
                            </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4"
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/privacy')}
                    >
                        <View className="flex-row items-center gap-3">
                            <Text className="text-lg">🔒</Text>
                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                                {t('help.privacy')}
                            </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={14} color="#CBD5E1" />
                    </TouchableOpacity>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
