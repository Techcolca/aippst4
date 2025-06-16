import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from '../locales/fr/translation.json';
import translationES from '../locales/es/translation.json';
import translationEN from '../locales/en/translation.json';

// Ressources de traduction
const resources = {
  fr: {
    translation: translationFR
  },
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Détecter la langue du navigateur
  .use(LanguageDetector)
  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialisation de i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut (français)
    debug: true, // Debug mode pour le développement
    returnObjects: false, // Mantener false para evitar errores de renderizado

    interpolation: {
      escapeValue: false, // Non nécessaire pour React
    },

    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;