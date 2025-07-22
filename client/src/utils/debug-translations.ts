// Debug utility to test translations
import i18n from '@/i18n/i18n';

export function debugTranslations() {
  const currentLang = i18n.language;
  
  console.log('🔍 TRANSLATION DEBUG UTILITY:', {
    currentLanguage: currentLang,
    localStorage: localStorage.getItem('i18nextLng'),
    navigator: navigator.language,
    isReady: i18n.isInitialized,
    resources: i18n.hasResourceBundle(currentLang, 'translation'),
    testKeys: {
      'hours_ago_plural': i18n.t('hours_ago_plural', { count: 3 }),
      'weeks_ago_plural': i18n.t('weeks_ago_plural', { count: 4 }),
      'new': i18n.t('new'),
      'conversations_for': i18n.t('conversations_for')
    }
  });
  
  return {
    language: currentLang,
    isReady: i18n.isInitialized,
    hasResources: i18n.hasResourceBundle(currentLang, 'translation')
  };
}