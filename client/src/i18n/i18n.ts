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
      },
      getStartedPage: {
        title: "Commencer",
        subtitle: "Intégrez AIPPS dans votre site web en quelques minutes",
        tabs: {
          widget: "Widget",
          fullscreen: "Plein écran",
          form: "Formulaire"
        },
        widget: {
          step2: {
            dashboard_steps: {
              "0": "Accédez à la section \"Intégrations\" du panneau",
              "1": "Sélectionnez l'intégration que vous souhaitez configurer",
              "2": "Personnalisez les couleurs, position et messages",
              "3": "Les changements seront appliqués automatiquement"
            }
          }
        },
        form: {
          step3: {
            title: "Étape 3: Entraînez votre assistant (optionnel)",
            description: "Pour que votre assistant fournisse des réponses utiles et pertinentes, vous pouvez l'entraîner avec:",
            dashboard_steps: [
              "Documents PDF avec des informations sur vos produits ou services",
              "Fichiers DOCX avec des questions fréquemment posées et leurs réponses", 
              "Fichiers Excel avec des données structurées",
              "Instructions spécifiques sur le ton et le style des réponses"
            ]
          }
        },
        buttons: {
          go_to_forms: "Aller aux formulaires",
          login_to_manage_forms: "Se connecter pour gérer les formulaires"
        },
        cta: {
          forms_title: "Prêt à créer vos formulaires ?",
          forms_description: "Commencez à capturer des leads avec nos formulaires personnalisés dès aujourd'hui."
        }
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
      },
      getStartedPage: {
        title: "Comienza Ahora",
        subtitle: "Integra AIPPS en tu sitio web en minutos",
        tabs: {
          widget: "Widget",
          fullscreen: "Pantalla",
          form: "Formulario"
        },
        widget: {
          step2: {
            dashboard_steps: {
              "0": "Accede a la sección \"Integraciones\" del panel",
              "1": "Selecciona la integración que deseas configurar",
              "2": "Personaliza colores, posición y mensajes",
              "3": "Los cambios se aplicarán automáticamente"
            }
          }
        },
        form: {
          step3: {
            title: "Paso 3: Entrena tu asistente (opcional)",
            description: "Para que tu asistente proporcione respuestas útiles y relevantes, puedes entrenarlo con:",
            dashboard_steps: [
              "Documentos PDF con información sobre tus productos o servicios",
              "Archivos DOCX con preguntas frecuentes y sus respuestas",
              "Archivos Excel con datos estructurados",
              "Instrucciones específicas sobre el tono y estilo de las respuestas"
            ]
          }
        },
        buttons: {
          go_to_forms: "Ir a formularios",
          login_to_manage_forms: "Iniciar sesión para gestionar formularios"
        },
        cta: {
          forms_title: "¿Listo para crear tus formularios?",
          forms_description: "Comienza a capturar leads con nuestros formularios personalizados hoy mismo."
        }
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
      },
      getStartedPage: {
        title: "Get Started",
        subtitle: "Integrate AIPPS into your website in minutes",
        tabs: {
          widget: "Widget",
          fullscreen: "Fullscreen",
          form: "Form"
        },
        widget: {
          step2: {
            dashboard_steps: {
              "0": "Access the \"Integrations\" section of the panel",
              "1": "Select the integration you want to configure",
              "2": "Customize colors, position and messages",
              "3": "Changes will be applied automatically"
            }
          }
        },
        form: {
          step3: {
            title: "Step 3: Train your assistant (optional)",
            description: "For your assistant to provide useful and relevant responses, you can train it with:",
            dashboard_steps: [
              "PDF documents with information about your products or services",
              "DOCX files with frequently asked questions and their answers",
              "Excel files with structured data",
              "Specific instructions about response tone and style"
            ]
          }
        },
        buttons: {
          go_to_forms: "Go to forms",
          login_to_manage_forms: "Log in to manage forms"
        },
        cta: {
          forms_title: "Ready to create your forms?",
          forms_description: "Start capturing leads with our custom forms today."
        }
      }
    }
  }
};

// Debug de los recursos cargados
console.log('🔍 I18N DEBUG - Manual resources loaded:', {
  fr: {
    pricing: Object.keys(resources.fr.translation.pricing),
    language: Object.keys(resources.fr.translation.language),
    getStartedPage: Object.keys(resources.fr.translation.getStartedPage)
  },
  es: {
    pricing: Object.keys(resources.es.translation.pricing),
    language: Object.keys(resources.es.translation.language),
    getStartedPage: Object.keys(resources.es.translation.getStartedPage)
  },
  en: {
    pricing: Object.keys(resources.en.translation.pricing),
    language: Object.keys(resources.en.translation.language),
    getStartedPage: Object.keys(resources.en.translation.getStartedPage)
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