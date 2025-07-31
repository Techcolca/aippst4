import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Definir recursos manualmente para solucionar problemas de importación de Vite

// Crear recursos manualmente para evitar problemas de Vite
const resources = {
  fr: {
    translation: {
      menu: "Menu",
      common: {
        error: "Erreur",
        yes: "Oui", 
        no: "Non",
        cancel: "Annuler",
        spanish: "Espagnol",
        english: "Anglais",
        french: "Français"
      },
      language: {
        select: "Sélectionner la langue",
        fr: "Français",
        es: "Espagnol", 
        en: "Anglais"
      },
      refresh: "Actualiser",
      edit: "Modifier",
      conversations: "Conversations",
      analytics: "Analyses",
      delete: "Supprimer",
      active: "Actif",
      inactive: "Inactif",
      testing: "Test",
      visitors_helped: "Visiteurs aidés",
      installed: "Installé",
      confirm_delete_title: "Êtes-vous sûr?",
      confirm_delete_description: "Cette action supprimera définitivement l'intégration \"{{name}}\" et ne peut pas être annulée. Le widget cessera de fonctionner sur votre site web.",
      pricing: {
        plans: "Plans",
        title: "Choisissez Votre Plan Parfait",
        subtitle: "Sélectionnez le plan qui correspond le mieux à vos besoins et développez votre entreprise avec l'IA conversationnelle.",
        monthly_billing: "Facturation Mensuelle",
        annual_billing: "Facturation Annuelle",
        toggle_billing: "Basculer le type de facturation",
        save_percentage: "Économisez 20%",
        recommended: "Recommandé",
        free: "Gratuit",
        from: "À partir de",
        month: "mois",
        year: "année",
        contact_us: "Nous Contacter",
        take_offer: "Profiter de l'Offre",
        take_annual_offer: "Profiter de l'Offre Annuelle",
        start_free: "Commencer Gratuitement",
        subscribe: "S'abonner",
        processing: "Traitement...",
        spots_remaining: "Il ne reste que {{remaining}} places sur {{total}}",
        discount_duration: "{{discount}}% de réduction pendant {{months}} mois",
        promotional_price_duration: "Prix promotionnel pendant {{months}} mois",
        limited_launch_offer: "Offre de Lancement Limitée",
        spots_left_of_total: "Il ne reste que {{remaining}} places sur {{total}} dans cette promotion spéciale.",
        take_advantage_unique_prices: "Profitez de ces prix uniques avant qu'ils ne reviennent aux prix réguliers.",
        pricing_note: "Tous les plans incluent un support complet et des mises à jour gratuites."
      }
    }
  },
  es: {
    translation: {
      menu: "Menú",
      common: {
        error: "Error",
        yes: "Sí",
        no: "No", 
        cancel: "Cancelar",
        spanish: "Español",
        english: "Inglés",
        french: "Francés"
      },
      language: {
        select: "Seleccionar idioma",
        fr: "Francés",
        es: "Español",
        en: "Inglés"
      },
      refresh: "Actualizar",
      edit: "Editar",
      conversations: "Conversaciones",
      analytics: "Análisis",
      delete: "Eliminar",
      active: "Activo",
      inactive: "Inactivo",
      testing: "Pruebas",
      visitors_helped: "Visitantes ayudados",
      installed: "Instalado",
      confirm_delete_title: "¿Estás seguro?",
      confirm_delete_description: "Esta acción eliminará permanentemente la integración \"{{name}}\" y no se puede deshacer. El widget dejará de funcionar en tu sitio web.",
      pricing: {
        plans: "Planes",
        title: "Elige tu Plan Perfecto",
        subtitle: "Selecciona el plan que mejor se adapte a tus necesidades y escala tu negocio con IA conversacional.",
        monthly_billing: "Facturación Mensual",
        annual_billing: "Facturación Anual",
        toggle_billing: "Alternar tipo de facturación",
        save_percentage: "Ahorra 20%",
        recommended: "Recomendado",
        free: "Gratis",
        from: "Desde",
        month: "mes",
        year: "año",
        contact_us: "Habla con Nosotros",
        take_offer: "Aprovechar Oferta",
        take_annual_offer: "Aprovechar Oferta Anual",
        start_free: "Comenzar Gratis",
        subscribe: "Suscribirse",
        processing: "Procesando...",
        spots_remaining: "Solo quedan {{remaining}} lugares de {{total}}",
        discount_duration: "{{discount}}% de descuento por {{months}} meses",
        promotional_price_duration: "Precio promocional por {{months}} meses",
        limited_launch_offer: "Oferta de Lanzamiento Limitada",
        spots_left_of_total: "Solo quedan {{remaining}} lugares de {{total}} en esta promoción especial.",
        take_advantage_unique_prices: "Aprovecha estos precios únicos antes de que vuelvan a los precios regulares.",
        pricing_note: "Todos los planes incluyen soporte completo y actualizaciones gratuitas."
      }
    }
  },
  en: {
    translation: {
      menu: "Menu",
      common: {
        error: "Error",
        yes: "Yes",
        no: "No",
        cancel: "Cancel",
        spanish: "Spanish",
        english: "English", 
        french: "French"
      },
      language: {
        select: "Select language",
        fr: "French",
        es: "Spanish",
        en: "English"
      },
      refresh: "Refresh",
      edit: "Edit",
      conversations: "Conversations",
      analytics: "Analytics",
      delete: "Delete",
      active: "Active",
      inactive: "Inactive",
      testing: "Testing",
      visitors_helped: "Visitors helped",
      installed: "Installed",
      confirm_delete_title: "Are you sure?",
      confirm_delete_description: "This action will permanently delete the integration \"{{name}}\" and cannot be undone. The widget will stop working on your website.",
      pricing: {
        plans: "Plans",
        title: "Choose Your Perfect Plan",
        subtitle: "Select the plan that best fits your needs and scale your business with conversational AI.",
        monthly_billing: "Monthly Billing",
        annual_billing: "Annual Billing",
        toggle_billing: "Toggle billing type",
        save_percentage: "Save 20%",
        recommended: "Recommended",
        free: "Free",
        from: "From",
        month: "month",
        year: "year",
        contact_us: "Contact Us",
        take_offer: "Take Offer",
        take_annual_offer: "Take Annual Offer",
        start_free: "Start Free",
        subscribe: "Subscribe",
        processing: "Processing...",
        spots_remaining: "Only {{remaining}} spots left out of {{total}}",
        discount_duration: "{{discount}}% discount for {{months}} months",
        promotional_price_duration: "Promotional price for {{months}} months",
        limited_launch_offer: "Limited Launch Offer",
        spots_left_of_total: "Only {{remaining}} spots left out of {{total}} in this special promotion.",
        take_advantage_unique_prices: "Take advantage of these unique prices before they return to regular prices.",
        pricing_note: "All plans include full support and free updates."
      }
    }
  }
};

// Debug de los recursos cargados
console.log('🔍 I18N DEBUG - Manual resources loaded:', {
  fr: {
    pricing: Object.keys(resources.fr.translation.pricing),
    language: Object.keys(resources.fr.translation.language)
  },
  es: {
    pricing: Object.keys(resources.es.translation.pricing),
    language: Object.keys(resources.es.translation.language)
  },
  en: {
    pricing: Object.keys(resources.en.translation.pricing),
    language: Object.keys(resources.en.translation.language)
  }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'es',
    fallbackLng: 'en',
    debug: false, // Reducir debug para limpiar consola
    returnObjects: false,
    
    interpolation: {
      escapeValue: false,
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