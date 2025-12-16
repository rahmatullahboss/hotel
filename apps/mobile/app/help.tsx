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
                <Text className="text-base font-semibold text-gray-900 dark:text-white mt-5 mb-3">
                    {t('help.contactTitle')}
                </Text>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-xl mb-3 bg-white dark:bg-gray-800"
                    onPress={handleEmail}
                >
                    <View className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center mr-3.5">
                        <FontAwesome name="envelope" size={20} color="#E63946" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('help.emailSupport')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {SUPPORT_EMAIL}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-xl mb-3 bg-white dark:bg-gray-800"
                    onPress={handlePhone}
                >
                    <View className="w-11 h-11 rounded-full bg-primary/15 items-center justify-center mr-3.5">
                        <FontAwesome name="phone" size={20} color="#E63946" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('help.phoneSupport')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {SUPPORT_PHONE_DISPLAY}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>

                {/* AI Chat Support */}
                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-xl mb-3 bg-primary"
                    onPress={() => router.push('/support-chat' as any)}
                >
                    <View className="w-11 h-11 rounded-full bg-white/20 items-center justify-center mr-3.5">
                        <FontAwesome name="comments" size={20} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-white">
                            {t('help.chatBot', 'Chat with Vibe AI')}
                        </Text>
                        <Text className="text-sm text-white/80 mt-0.5">
                            {t('help.instantHelp', 'Get instant help 24/7')}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center p-4 rounded-xl mb-3 bg-white dark:bg-gray-800"
                    onPress={handleWhatsApp}
                >
                    <View className="w-11 h-11 rounded-full bg-green-500 items-center justify-center mr-3.5">
                        <FontAwesome name="whatsapp" size={20} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                            {t('help.whatsapp')}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('help.chatInstant')}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>

                {/* FAQ Section */}
                <Text className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    {t('help.faqTitle')}
                </Text>

                {faqItems.map((item, index) => (
                    <View key={index} className="p-4 rounded-xl mb-3 bg-white dark:bg-gray-800">
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            {item.question}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5">
                            {item.answer}
                        </Text>
                    </View>
                ))}

                {/* Legal Links */}
                <Text className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    {t('help.legalTitle')}
                </Text>

                <View className="rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700"
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/terms')}
                    >
                        <Text className="text-base text-gray-900 dark:text-white">
                            {t('help.terms')}
                        </Text>
                        <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-row items-center justify-between p-4"
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/privacy')}
                    >
                        <Text className="text-base text-gray-900 dark:text-white">
                            {t('help.privacy')}
                        </Text>
                        <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
