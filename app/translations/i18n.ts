import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ShopLocaleDetector from './shopLocaleDetector';

import translationEN from './en.json';
import translationFR from './fr.json';

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n
  .use(ShopLocaleDetector) // detects shop locale first
  .use(LanguageDetector) // falls back to browser language detection
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;
