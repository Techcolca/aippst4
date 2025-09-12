// Traducciones simplificadas sin duplicados
export const translations = {
  fr: {
    translation: {
      // Navegación básica
      documentation: "Documentation",
      pricing: "Tarification", 
      get_started: "Commencer",
      visitor: "Visiteur",
      anonymous: "Anonyme",
      registered_user: "Utilisateur enregistré",
      visitors_helped: "Visiteurs aidés",

      // Tiempo
      weeks_ago_plural: "il y a {{count}} semaines",
      weeks_ago: "il y a {{count}} semaine", 
      months_ago_plural: "il y a {{count}} mois",
      months_ago: "il y a {{count}} mois",
      days_ago_plural: "il y a {{count}} jours",
      days_ago: "il y a {{count}} jour",
      hours_ago_plural: "il y a {{count}} heures", 
      hours_ago: "il y a {{count}} heure",
      minutes_ago_plural: "il y a {{count}} minutes",
      minutes_ago: "il y a {{count}} minute",

      // Dashboard básico
      dashboard: "Tableau de bord",
      conversations: "Conversations",
      integrations: "Intégrations",
      analytics: "Analytiques",
      settings: "Paramètres",
      logout: "Déconnexion",

      // Estados
      active: "Actif",
      resolved: "Résolu",
      loading: "Chargement...",
      back: "Retour",
      edit_integration: "Modifier l'intégration",
      view_analytics: "Voir les analytiques",
      new: "Nouveau",
      messages: "messages",

      // Conversaciones
      conversations_for: "Conversations pour",
      view_all_conversations_for_integration: "Voir toutes les conversations pour cette intégration",
      search_conversations: "Rechercher des conversations",

      // Sistema de límites por plan
      upgrade: {
        modal: {
          title: "Vous avez atteint votre limite de plan"
        },
        progress: {
          title: "Utilisation actuelle :",
          unlimited: "{{used}} utilisés",
          usage: "{{used}} de {{limit}} utilisés",
          integrations: "Vous avez atteint la limite maximale d'intégrations",
          forms: "Vous avez atteint la limite maximale de formulaires",
          conversations: "Vous avez atteint la limite maximale de conversations"
        },
        integrations: {
          message: "Votre {{planName}} a atteint la limite d'intégrations.",
          description: "Pour connecter plus de services et automatiser votre entreprise, vous devez mettre à jour votre plan."
        },
        forms: {
          message: "Votre {{planName}} a atteint la limite de formulaires.",
          description: "Pour créer plus de formulaires personnalisés et capturer plus de prospects, mettez à jour votre plan."
        },
        conversations: {
          message: "Votre {{planName}} a atteint la limite de conversations.",
          description: "Pour gérer plus de conversations avec vos clients, vous devez mettre à jour votre plan."
        },
        general: {
          message: "Votre {{planName}} a atteint ses limites.",
          description: "Pour accéder à plus de fonctionnalités et développer votre entreprise, mettez à jour votre plan."
        },
        benefits: {
          title: "Avantages de la mise à jour :",
          startup: {
            conversations: "2 000 conversations/mois",
            forms: "5 formulaires personnalisables",
            widgets: "Widgets bulle + plein écran",
            sites: "Jusqu'à 3 sites web",
            analytics: "Analyses avancées"
          },
          professional: {
            conversations: "10 000 conversations/mois",
            forms: "Formulaires illimités",
            sites: "Sites web illimités",
            automation: "Automatisations de base",
            crm: "Intégration CRM"
          },
          enterprise: {
            conversations: "Conversations illimitées",
            all: "Tout inclus",
            ai: "Automatisations IA",
            support: "Support dédié 24/7",
            manager: "Gestionnaire de compte"
          },
          general: {
            integrations: "Plus d'intégrations et de formulaires",
            analytics: "Analyses et rapports avancés",
            support: "Support prioritaire",
            customization: "Personnalisation complète"
          }
        },
        button: {
          primary: "Voir les plans",
          secondary: "Plus tard"
        }
      }
    }
  },
  es: {
    translation: {
      // Navegación básica
      documentation: "Documentación",
      pricing: "Precios",
      get_started: "Comenzar", 
      visitor: "Visitante",
      anonymous: "Anónimo",
      registered_user: "Usuario Registrado",
      visitors_helped: "Visitantes atendidos",

      // Tiempo
      weeks_ago_plural: "hace {{count}} semanas",
      weeks_ago: "hace {{count}} semana",
      months_ago_plural: "hace {{count}} meses", 
      months_ago: "hace {{count}} mes",
      days_ago_plural: "hace {{count}} días",
      days_ago: "hace {{count}} día",
      hours_ago_plural: "hace {{count}} horas",
      hours_ago: "hace {{count}} hora",
      minutes_ago_plural: "hace {{count}} minutos",
      minutes_ago: "hace {{count}} minuto",

      // Dashboard básico
      dashboard: "Panel de control",
      conversations: "Conversaciones", 
      integrations: "Integraciones",
      analytics: "Analíticas",
      settings: "Configuración",
      logout: "Cerrar sesión",

      // Estados
      active: "Activo",
      resolved: "Resuelto",
      loading: "Cargando...",
      back: "Atrás",
      edit_integration: "Editar integración",
      view_analytics: "Ver analíticas", 
      new: "Nuevo",
      messages: "mensajes",

      // Conversaciones
      conversations_for: "Conversaciones para",
      view_all_conversations_for_integration: "Ver todas las conversaciones para esta integración",
      search_conversations: "Buscar conversaciones",

      // Sistema de límites por plan
      upgrade: {
        modal: {
          title: "Has alcanzado el límite de tu plan"
        },
        progress: {
          title: "Uso actual:",
          unlimited: "{{used}} utilizados",
          usage: "{{used}} de {{limit}} utilizados",
          integrations: "Has alcanzado el límite máximo de integraciones",
          forms: "Has alcanzado el límite máximo de formularios",
          conversations: "Has alcanzado el límite máximo de conversaciones"
        },
        integrations: {
          message: "Tu {{planName}} ha alcanzado el límite de integraciones.",
          description: "Para conectar más servicios y automatizar tu negocio, necesitas actualizar tu plan."
        },
        forms: {
          message: "Tu {{planName}} ha alcanzado el límite de formularios.",
          description: "Para crear más formularios personalizados y capturar más leads, actualiza tu plan."
        },
        conversations: {
          message: "Tu {{planName}} ha alcanzado el límite de conversaciones.",
          description: "Para manejar más conversaciones con tus clientes, necesitas actualizar tu plan."
        },
        general: {
          message: "Tu {{planName}} ha alcanzado sus límites.",
          description: "Para acceder a más funcionalidades y expandir tu negocio, actualiza tu plan."
        },
        benefits: {
          title: "Beneficios de actualizar:",
          startup: {
            conversations: "2,000 conversaciones/mes",
            forms: "5 formularios personalizables",
            widgets: "Widgets burbuja + pantalla completa",
            sites: "Hasta 3 sitios web",
            analytics: "Analíticas avanzadas"
          },
          professional: {
            conversations: "10,000 conversaciones/mes",
            forms: "Formularios ilimitados",
            sites: "Sitios web ilimitados",
            automation: "Automatizaciones básicas",
            crm: "Integración CRM"
          },
          enterprise: {
            conversations: "Conversaciones ilimitadas",
            all: "Todo incluido",
            ai: "Automatizaciones IA",
            support: "Soporte dedicado 24/7",
            manager: "Gerente de cuenta"
          },
          general: {
            integrations: "Más integraciones y formularios",
            analytics: "Analíticas y reportes avanzados",
            support: "Soporte prioritario",
            customization: "Personalización completa"
          }
        },
        button: {
          primary: "Ver planes",
          secondary: "Más tarde"
        }
      }
    }
  },
  en: {
    translation: {
      // Navegación básica
      documentation: "Documentation",
      pricing: "Pricing",
      get_started: "Get Started",
      visitor: "Visitor", 
      anonymous: "Anonymous",
      registered_user: "Registered User",
      visitors_helped: "Visitors helped",

      // Tiempo
      weeks_ago_plural: "{{count}} weeks ago",
      weeks_ago: "{{count}} week ago",
      months_ago_plural: "{{count}} months ago",
      months_ago: "{{count}} month ago", 
      days_ago_plural: "{{count}} days ago",
      days_ago: "{{count}} day ago",
      hours_ago_plural: "{{count}} hours ago",
      hours_ago: "{{count}} hour ago",
      minutes_ago_plural: "{{count}} minutes ago",
      minutes_ago: "{{count}} minute ago",

      // Dashboard básico
      dashboard: "Dashboard",
      conversations: "Conversations",
      integrations: "Integrations", 
      analytics: "Analytics",
      settings: "Settings",
      logout: "Logout",

      // Estados
      active: "Active",
      resolved: "Resolved",
      loading: "Loading...",
      back: "Back",
      edit_integration: "Edit integration",
      view_analytics: "View analytics",
      new: "New", 
      messages: "messages",

      // Conversaciones
      conversations_for: "Conversations for",
      view_all_conversations_for_integration: "View all conversations for this integration",
      search_conversations: "Search conversations",

      // Sistema de límites por plan
      upgrade: {
        modal: {
          title: "You have reached your plan limit"
        },
        progress: {
          title: "Current usage:",
          unlimited: "{{used}} used",
          usage: "{{used}} of {{limit}} used",
          integrations: "You have reached the maximum integration limit",
          forms: "You have reached the maximum form limit", 
          conversations: "You have reached the maximum conversation limit"
        },
        integrations: {
          message: "Your {{planName}} has reached the integration limit.",
          description: "To connect more services and automate your business, you need to upgrade your plan."
        },
        forms: {
          message: "Your {{planName}} has reached the form limit.",
          description: "To create more custom forms and capture more leads, upgrade your plan."
        },
        conversations: {
          message: "Your {{planName}} has reached the conversation limit.",
          description: "To handle more conversations with your customers, you need to upgrade your plan."
        },
        general: {
          message: "Your {{planName}} has reached its limits.",
          description: "To access more features and grow your business, upgrade your plan."
        },
        benefits: {
          title: "Benefits of upgrading:",
          startup: {
            conversations: "2,000 conversations/month",
            forms: "5 customizable forms",
            widgets: "Bubble + fullscreen widgets",
            sites: "Up to 3 websites",
            analytics: "Advanced analytics"
          },
          professional: {
            conversations: "10,000 conversations/month",
            forms: "Unlimited forms",
            sites: "Unlimited websites",
            automation: "Basic automations",
            crm: "CRM integration"
          },
          enterprise: {
            conversations: "Unlimited conversations",
            all: "Everything included",
            ai: "AI automations",
            support: "24/7 dedicated support",
            manager: "Account manager"
          },
          general: {
            integrations: "More integrations and forms",
            analytics: "Advanced analytics and reports",
            support: "Priority support",
            customization: "Complete customization"
          }
        },
        button: {
          primary: "View plans",
          secondary: "Later"
        }
      }
    }
  }
};
