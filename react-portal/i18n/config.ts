import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import zh from './locales/zh.json';

// Date formatting configurations for each locale
export const dateFormats = {
  en: {
    shortDate: 'MMM d, yyyy',
    shortDateNoYear: 'MMM d',
    shortTime: 'HH:mm',
    shortDateTime: 'MMM d, yyyy HH:mm',
    shortDateTimeNoYear: 'MMM d, HH:mm',
    longDate: 'MMMM d, yyyy',
    monthYear: 'MMMM yyyy',
    monthDay: 'MMMM d',
    weekday: 'EEEE',
    weekdayShort: 'EEE',
  },
  zh: {
    shortDate: 'yyyy年M月d日',
    shortDateNoYear: 'M月d日',
    shortTime: 'HH:mm',
    shortDateTime: 'yyyy年M月d日 HH:mm',
    shortDateTimeNoYear: 'M月d日 HH:mm',
    longDate: 'yyyy年M月d日',
    monthYear: 'yyyy年M月',
    monthDay: 'M月d日',
    weekday: 'EEEE',
    weekdayShort: 'EEE',
  },
};

// Get date format for current language
export function getDateFormat(formatKey: keyof typeof dateFormats.en): string {
  const lng = i18n.language as 'en' | 'zh';
  return dateFormats[lng]?.[formatKey] || dateFormats.en[formatKey];
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    debug: false,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
