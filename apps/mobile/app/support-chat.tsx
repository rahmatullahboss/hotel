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

// Quick reply actions - text will be pulled from translations
const QUICK_REPLY_ACTIONS = [
    { id: '1', action: 'booking' },
    { id: '2', action: 'cancel' },
    { id: '3', action: 'payment' },
    { id: '4', action: 'checkin' },
    { id: '5', action: 'refund' },
    { id: '6', action: 'wallet' },
    { id: '7', action: 'contact' },
    { id: '8', action: 'points' },
];

export default function SupportChatScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const scrollViewRef = useRef<ScrollView>(null);

    // Create quick replies with translated text
    const getQuickReplies = (): QuickReply[] => {
        return QUICK_REPLY_ACTIONS.map(item => ({
            ...item,
            text: t(`chat.quickReplies.${item.action}`)
        }));
    };

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            text: t('chat.welcome'),
            isBot: true,
            timestamp: new Date(),
            options: getQuickReplies(),
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
        const quickReplies = getQuickReplies();
        const reply = quickReplies.find(r => r.action === action);
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

        // Check for keywords and get translated answers
        if (query.includes('book') || query === 'booking') {
            responseText = t('chat.answers.booking');
        } else if (query.includes('cancel')) {
            responseText = t('chat.answers.cancel');
        } else if (query.includes('pay') || query === 'payment') {
            responseText = t('chat.answers.payment');
        } else if (query.includes('check') || query === 'checkin') {
            responseText = t('chat.answers.checkin');
        } else if (query.includes('refund')) {
            responseText = t('chat.answers.refund');
        } else if (query.includes('wallet') || query.includes('cashback')) {
            responseText = t('chat.answers.wallet');
        } else if (query.includes('contact') || query.includes('support') || query.includes('help')) {
            responseText = t('chat.answers.contact');
        } else if (query.includes('point') || query.includes('loyalty')) {
            responseText = t('chat.answers.points');
        } else {
            responseText = t('chat.notUnderstood');
            showOptions = true;
        }

        return {
            id: Date.now().toString(),
            text: responseText,
            isBot: true,
            timestamp: new Date(),
            options: showOptions ? getQuickReplies() : undefined,
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
