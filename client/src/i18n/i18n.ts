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

// Debug logging to check loaded resources
console.log('🔍 I18N DEBUG - Loaded resources:', {
  fr: translationFR.pricing,
  es: translationES.pricing, 
  en: translationEN.pricing,
  frType: typeof translationFR.pricing,
  esType: typeof translationES.pricing,
  enType: typeof translationEN.pricing
});

i18n
  // Détecter la langue du navigateur
  .use(LanguageDetector)
  // Passer l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialisation de i18next
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'fr', // Initial language from localStorage
    fallbackLng: 'en', // Langue par défaut (english - mejor fallback)
    debug: true, // Debug mode pour le développement
    returnObjects: false, // Mantener false para evitar errores de renderizado
    saveMissing: true, // Guardar claves faltantes para debug
    missingKeyHandler: function(lng, ns, key, fallbackValue) {
      console.log(`Missing translation: ${lng}.${ns}.${key}`);
    },

    interpolation: {
      escapeValue: false, // Non nécessaire pour React
    },

    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n;