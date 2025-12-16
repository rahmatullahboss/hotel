import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    options?: QuickReply[];
}

interface QuickReply {
    id: string;
    text: string;
    action: string;
}

// FAQ data for chatbot
const FAQ_DATA: { [key: string]: string } = {
    booking: 'To book a hotel: Search → Select Hotel → Choose Room → Enter Dates → Confirm Booking. You can pay online or choose "Pay at Hotel".',
    cancel: 'Go to My Trips, select your booking, and tap "Cancel Booking". Refunds depend on cancellation policy - usually full refund if cancelled 24+ hours before check-in.',
    payment: 'We accept bKash, Nagad, Credit/Debit cards, and Pay at Hotel option. Your payment is 100% secure with encrypted transactions.',
    checkin: 'Use our Self Check-in feature! Scan the QR code at the hotel reception to instantly check in without waiting in queue.',
    refund: 'Refunds are credited to your Vibe Wallet within 24 hours of cancellation. You can use wallet balance for future bookings.',
    wallet: 'Vibe Wallet stores your cashback rewards and refunds. You earn 5% cashback on every booking! Use wallet balance at checkout.',
    contact: 'Email: support@vibehotels.com\nPhone: +880 1234-567890\nWhatsApp available 24/7',
    points: 'Earn loyalty points with every booking. 1 point = ৳1. Redeem points for discounts on future stays!',
};

const QUICK_REPLIES: QuickReply[] = [
    { id: '1', text: '🏨 How to book?', action: 'booking' },
    { id: '2', text: '❌ Cancel booking', action: 'cancel' },
    { id: '3', text: '💳 Payment options', action: 'payment' },
    { id: '4', text: '🔑 Self check-in', action: 'checkin' },
    { id: '5', text: '💰 Refund policy', action: 'refund' },
    { id: '6', text: '👛 Wallet & cashback', action: 'wallet' },
    { id: '7', text: '📞 Contact support', action: 'contact' },
    { id: '8', text: '⭐ Loyalty points', action: 'points' },
];

export default function SupportChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            text: t('chat.welcome', 'Hi! 👋 I\'m Vibe Assistant. How can I help you today?'),
            isBot: true,
            timestamp: new Date(),
            options: QUICK_REPLIES,
        },
    ]);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        // Scroll to bottom when messages change
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isBot: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        // Generate bot response
        setTimeout(() => {
            const response = generateBotResponse(inputText.trim().toLowerCase());
            setMessages(prev => [...prev, response]);
        }, 500);
    };

    const handleQuickReply = (action: string) => {
        const reply = QUICK_REPLIES.find(r => r.action === action);
        if (!reply) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: reply.text,
            isBot: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const response = generateBotResponse(action);
            setMessages(prev => [...prev, response]);
        }, 500);
    };

    const generateBotResponse = (query: string): Message => {
        let responseText = '';
        let showOptions = false;

        // Check for keywords
        if (query.includes('book') || query === 'booking') {
            responseText = FAQ_DATA.booking;
        } else if (query.includes('cancel')) {
            responseText = FAQ_DATA.cancel;
        } else if (query.includes('pay') || query === 'payment') {
            responseText = FAQ_DATA.payment;
        } else if (query.includes('check') || query === 'checkin') {
            responseText = FAQ_DATA.checkin;
        } else if (query.includes('refund')) {
            responseText = FAQ_DATA.refund;
        } else if (query.includes('wallet') || query.includes('cashback')) {
            responseText = FAQ_DATA.wallet;
        } else if (query.includes('contact') || query.includes('support') || query.includes('help')) {
            responseText = FAQ_DATA.contact;
        } else if (query.includes('point') || query.includes('loyalty')) {
            responseText = FAQ_DATA.points;
        } else {
            responseText = t('chat.notUnderstood', "I'm not sure I understand. Here are some topics I can help with:");
            showOptions = true;
        }

        return {
            id: Date.now().toString(),
            text: responseText,
            isBot: true,
            timestamp: new Date(),
            options: showOptions ? QUICK_REPLIES : undefined,
        };
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('chat.title', 'Support Chat'),
                    headerStyle: { backgroundColor: isDark ? '#1f2937' : '#fff' },
                    headerTintColor: isDark ? '#fff' : '#111',
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
                keyboardVerticalOffset={90}
            >
                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
                >
                    {messages.map((message) => (
                        <View key={message.id} className="mb-4">
                            <View
                                className={`max-w-[85%] ${message.isBot
                                    ? 'self-start'
                                    : 'self-end'
                                    }`}
                            >
                                <View
                                    className={`px-4 py-3 rounded-2xl ${message.isBot
                                        ? isDark ? 'bg-gray-800' : 'bg-white'
                                        : 'bg-primary'
                                        }`}
                                    style={message.isBot ? {
                                        borderBottomLeftRadius: 4,
                                    } : {
                                        borderBottomRightRadius: 4,
                                    }}
                                >
                                    <Text className={`text-base ${message.isBot
                                        ? isDark ? 'text-white' : 'text-gray-900'
                                        : 'text-white'
                                        }`}>
                                        {message.text}
                                    </Text>
                                </View>
                                <Text className={`text-xs mt-1 ${message.isBot ? 'text-left' : 'text-right'} text-gray-400`}>
                                    {formatTime(message.timestamp)}
                                </Text>
                            </View>

                            {/* Quick Reply Options */}
                            {message.options && (
                                <View className="flex-row flex-wrap gap-2 mt-3">
                                    {message.options.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            onPress={() => handleQuickReply(option.action)}
                                            className={`px-3 py-2 rounded-full border ${isDark
                                                ? 'border-gray-600 bg-gray-800'
                                                : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                {option.text}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Input Area */}
                <View
                    className={`px-4 py-3 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                    style={{ paddingBottom: insets.bottom + 12 }}
                >
                    <View className="flex-row items-center gap-3">
                        <View className={`flex-1 flex-row items-center px-4 py-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            <TextInput
                                className={`flex-1 text-base ${isDark ? 'text-white' : 'text-gray-900'}`}
                                placeholder={t('chat.placeholder', 'Type your message...')}
                                placeholderTextColor="#9CA3AF"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSend}
                            className="w-12 h-12 rounded-full bg-primary items-center justify-center"
                            disabled={!inputText.trim()}
                            style={{ opacity: inputText.trim() ? 1 : 0.5 }}
                        >
                            <FontAwesome name="send" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}
