import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { devWarn } from '@/lib/logger';

import en from './locales/en.json';
import bn from './locales/bn.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
    en: { translation: en },
    bn: { translation: bn },
};

// Get saved language or detect from device
const getInitialLanguage = async (): Promise<string> => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
            return savedLanguage;
        }
    } catch (error) {
        devWarn('Error reading language preference:', error);
    }

    // Detect device language
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    return deviceLocale === 'bn' ? 'bn' : 'en';
};

// Initialize i18n
export const initI18n = async () => {
    const initialLanguage = await getInitialLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: initialLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            react: {
                useSuspense: false,
            },
        });

    return i18n;
};

// Change language and persist
export const changeLanguage = async (lang: 'en' | 'bn') => {
    try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        await i18n.changeLanguage(lang);
    } catch (error) {
        devWarn('Error saving language preference:', error);
    }
};

export default i18n;
