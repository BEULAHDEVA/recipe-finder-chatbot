
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationES from './locales/es/translation.json';
import translationKN from './locales/kn/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    hi: {
        translation: translationHI,
    },
    es: {
        translation: translationES,
    },
    kn: {
        translation: translationKN,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['queryString', 'cookie'],
            cache: ['cookie'],
        },
    });

export default i18n;
