import { StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

const SUPPORT_EMAIL = 'rahmatullahzisan@gmail.com';
const SUPPORT_PHONE = '+8801570260118';
const SUPPORT_PHONE_DISPLAY = '01570-260118';
const WHATSAPP_URL = 'https://wa.me/8801570260118?text=Hello%2C%20I%20need%20help%20with%20Vibe%20Hotels';

export default function HelpScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const colors = Colors[theme];
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('help.title'),
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Contact Options */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {t('help.contactTitle')}
                </Text>

                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: colors.card }]}
                    onPress={handleEmail}
                >
                    <View style={[styles.contactIcon, { backgroundColor: `${Colors.primary}15` }]}>
                        <FontAwesome name="envelope" size={20} color={Colors.primary} />
                    </View>
                    <View style={[styles.contactDetails, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.contactTitle, { color: colors.text }]}>
                            {t('help.emailSupport')}
                        </Text>
                        <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                            {SUPPORT_EMAIL}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: colors.card }]}
                    onPress={handlePhone}
                >
                    <View style={[styles.contactIcon, { backgroundColor: `${Colors.primary}15` }]}>
                        <FontAwesome name="phone" size={20} color={Colors.primary} />
                    </View>
                    <View style={[styles.contactDetails, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.contactTitle, { color: colors.text }]}>
                            {t('help.phoneSupport')}
                        </Text>
                        <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                            {SUPPORT_PHONE_DISPLAY}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: colors.card }]}
                    onPress={handleWhatsApp}
                >
                    <View style={[styles.contactIcon, { backgroundColor: '#25D366' }]}>
                        <FontAwesome name="whatsapp" size={20} color="#fff" />
                    </View>
                    <View style={[styles.contactDetails, { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.contactTitle, { color: colors.text }]}>
                            {t('help.whatsapp')}
                        </Text>
                        <Text style={[styles.contactValue, { color: colors.textSecondary }]}>
                            {t('help.chatInstant')}
                        </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* FAQ Section */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                    {t('help.faqTitle')}
                </Text>

                {faqItems.map((item, index) => (
                    <View key={index} style={[styles.faqItem, { backgroundColor: colors.card }]}>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>
                            {item.question}
                        </Text>
                        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                            {item.answer}
                        </Text>
                    </View>
                ))}

                {/* Legal Links */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                    {t('help.legalTitle')}
                </Text>

                <View style={[styles.legalSection, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[styles.legalItem, { borderBottomColor: colors.border }]}
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/terms')}
                    >
                        <Text style={[styles.legalText, { color: colors.text }]}>
                            {t('help.terms')}
                        </Text>
                        <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.legalItem}
                        onPress={() => Linking.openURL('https://vibe-hotels.vercel.app/privacy')}
                    >
                        <Text style={[styles.legalText, { color: colors.text }]}>
                            {t('help.privacy')}
                        </Text>
                        <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 12,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    contactIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    contactDetails: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    contactValue: {
        fontSize: 13,
        marginTop: 2,
    },
    faqItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    faqAnswer: {
        fontSize: 13,
        lineHeight: 20,
    },
    legalSection: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    legalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    legalText: {
        fontSize: 15,
    },
});
