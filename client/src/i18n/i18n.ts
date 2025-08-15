import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  fr: {
    translation: {
      // Navegación básica
      documentation: "Documentation",
      pricing: "Tarification", 
      get_started: "Commencer",
      visitor: "Visiteur",
      anonymous: "Anonyme",
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
      just_now: "À l'instant",
      
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
      
      // Analytics
      analytics_description: "Analyse détaillée des performances et métriques",
      integration_performance: "Performance d'intégration",
      advanced_analysis: "Analyse avancée",
      advanced_metrics: "Métriques avancées",
      avg_messages: "Messages moyens",
      messages_per_conversation: "Messages par conversation",
      total_conversations: "Total des conversations",
      resolution_rate: "Taux de résolution",
      avg_response_time: "Temps de réponse moyen",
      
      // PDF Report
      pdf_report_title: "Rapport d'Analytics AIPI",
      pdf_generated: "Généré le",
      pdf_summary: "Résumé des Statistiques",
      pdf_metric: "Métrique",
      pdf_value: "Valeur",
      pdf_products_demanded: "Produits les Plus Demandés",
      pdf_products_description: "Analyse des produits mentionnés dans les conversations",
      pdf_products_description2: "Identifie les intérêts des clients et opportunités",
      pdf_product: "Produit",
      pdf_mentions: "Mentions",
      pdf_no_products_data: "Aucune donnée de produits disponible",
      pdf_topics_discussed: "Sujets les Plus Discutés",
      pdf_topics_description: "Analyse du sentiment des conversations",
      pdf_topics_description2: "Comprend les préoccupations et satisfaction client",
      pdf_topic: "Sujet",
      pdf_sentiment: "Sentiment",
      pdf_no_topics_data: "Aucune donnée de sujets disponible",
      pdf_conversation_trend: "Tendance des Conversations",
      pdf_trend_description: "Évolution du volume des conversations dans le temps",
      
      // Analytics Charts
      products_services_most_demanded: "Produits/Services les Plus Demandés",
      products_analysis_description: "Analyse des produits mentionnés",
      what_does_it_mean_products_bars_explanation: "Que signifient les barres de produits ?",
      topics_and_sentiment: "Sujets et Sentiment",
      topics_analysis_description: "Analyse des sujets et sentiments",
      what_does_it_mean_topics_bars_explanation: "Que signifient les barres de sujets ?",
      conversation_trend: "Tendance des Conversations",
      conversation_trend_description: "Tendance des conversations dans le temps",
      what_does_it_mean_conversation_trend_explanation: "Que signifie la tendance des conversations ?",
      keywords: "Mots-clés",
      keywords_description: "Description des mots-clés",
      what_does_it_mean_keywords_explanation: "Que signifient les mots-clés ?",
      
      // Additional Analytics Terms
      avg_duration: "Durée moyenne",
      time_per_conversation: "Temps par conversation",
      peak_hours: "Heures de pointe",
      highest_activity: "Activité la plus élevée",
      devices: "Appareils",
      mobile_desktop: "Mobile/Bureau",
      export_pdf: "Exporter PDF",
      back_to_dashboard: "Retour au tableau de bord",
      
      // Dashboard and Navigation
      dashboard_title: "Titre du tableau de bord",
      manage_assistant: "Gérer l'assistant",
      task_automation: "Automatisation des tâches",
      
      // Footer
      footer: {
        company_description: "Description de l'entreprise",
        product: "Produit",
        company: "Entreprise", 
        support: "Support",
        features: "Fonctionnalités",
        pricing: "Tarification",
        documentation: "Documentation",
        get_started: "Commencer",
        about_us: "À propos de nous",
        contact: "Contact",
        privacy_policy: "Politique de confidentialité",
        terms_of_service: "Conditions d'utilisation",
        help_center: "Centre d'aide",
        all_rights_reserved: "Tous droits réservés"
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
      just_now: "Ahora mismo",
      
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
      
      // Analytics
      analytics_description: "Análisis detallado de rendimiento y métricas",
      integration_performance: "Rendimiento de integración",
      advanced_analysis: "Análisis avanzado",
      advanced_metrics: "Métricas avanzadas",
      avg_messages: "Mensajes promedio",
      messages_per_conversation: "Mensajes por conversación",
      total_conversations: "Total de conversaciones",
      resolution_rate: "Tasa de resolución",
      avg_response_time: "Tiempo de respuesta promedio",
      
      // PDF Report
      pdf_report_title: "Reporte de Analytics AIPI",
      pdf_generated: "Generado el",
      pdf_summary: "Resumen de Estadísticas",
      pdf_metric: "Métrica",
      pdf_value: "Valor",
      pdf_products_demanded: "Productos Más Demandados",
      pdf_products_description: "Análisis de productos mencionados en conversaciones",
      pdf_products_description2: "Identifica intereses de clientes y oportunidades",
      pdf_product: "Producto",
      pdf_mentions: "Menciones",
      pdf_no_products_data: "No hay datos de productos disponibles",
      pdf_topics_discussed: "Temas Más Discutidos",
      pdf_topics_description: "Análisis del sentimiento de las conversaciones",
      pdf_topics_description2: "Comprende preocupaciones y satisfacción del cliente",
      pdf_topic: "Tema",
      pdf_sentiment: "Sentimiento",
      pdf_no_topics_data: "No hay datos de temas disponibles",
      pdf_conversation_trend: "Tendencia de Conversaciones",
      pdf_trend_description: "Evolución del volumen de conversaciones en el tiempo",
      
      // Analytics Charts
      products_services_most_demanded: "Productos/Servicios Más Demandados",
      products_analysis_description: "Análisis de productos mencionados",
      what_does_it_mean_products_bars_explanation: "¿Qué significan las barras de productos?",
      topics_and_sentiment: "Temas y Sentimiento",
      topics_analysis_description: "Análisis de temas y sentimientos",
      what_does_it_mean_topics_bars_explanation: "¿Qué significan las barras de temas?",
      conversation_trend: "Tendencia de Conversaciones",
      conversation_trend_description: "Tendencia de conversaciones en el tiempo",
      what_does_it_mean_conversation_trend_explanation: "¿Qué significa la tendencia de conversaciones?",
      keywords: "Palabras clave",
      keywords_description: "Descripción de palabras clave",
      what_does_it_mean_keywords_explanation: "¿Qué significan las palabras clave?",
      
      // Additional Analytics Terms
      avg_duration: "Duración promedio",
      time_per_conversation: "Tiempo por conversación",
      peak_hours: "Horas pico",
      highest_activity: "Mayor actividad",
      devices: "Dispositivos",
      mobile_desktop: "Móvil/Escritorio",
      export_pdf: "Exportar PDF",
      back_to_dashboard: "Volver al panel",
      
      // Dashboard and Navigation
      dashboard_title: "Título del panel",
      manage_assistant: "Gestionar asistente",
      task_automation: "Automatización de tareas",
      
      // Footer
      footer: {
        company_description: "Descripción de la empresa",
        product: "Producto",
        company: "Empresa",
        support: "Soporte", 
        features: "Características",
        pricing: "Precios",
        documentation: "Documentación",
        get_started: "Comenzar",
        about_us: "Acerca de nosotros",
        contact: "Contacto",
        privacy_policy: "Política de privacidad",
        terms_of_service: "Términos de servicio",
        help_center: "Centro de ayuda",
        all_rights_reserved: "Todos los derechos reservados"
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
      just_now: "Just now",
      
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
      
      // Analytics
      analytics_description: "Detailed performance and metrics analysis",
      integration_performance: "Integration performance",
      advanced_analysis: "Advanced analysis",
      advanced_metrics: "Advanced metrics",
      avg_messages: "Average messages",
      messages_per_conversation: "Messages per conversation",
      total_conversations: "Total conversations",
      resolution_rate: "Resolution rate",
      avg_response_time: "Average response time",
      
      // PDF Report
      pdf_report_title: "AIPI Analytics Report",
      pdf_generated: "Generated on",
      pdf_summary: "Statistics Summary",
      pdf_metric: "Metric",
      pdf_value: "Value",
      pdf_products_demanded: "Most Demanded Products",
      pdf_products_description: "Analysis of products mentioned in conversations",
      pdf_products_description2: "Identifies customer interests and opportunities",
      pdf_product: "Product",
      pdf_mentions: "Mentions",
      pdf_no_products_data: "No product data available",
      pdf_topics_discussed: "Most Discussed Topics",
      pdf_topics_description: "Conversation sentiment analysis",
      pdf_topics_description2: "Understand customer concerns and satisfaction",
      pdf_topic: "Topic",
      pdf_sentiment: "Sentiment",
      pdf_no_topics_data: "No topic data available",
      pdf_conversation_trend: "Conversation Trend",
      pdf_trend_description: "Evolution of conversation volume over time",
      
      // Analytics Charts
      products_services_most_demanded: "Most Demanded Products/Services",
      products_analysis_description: "Analysis of mentioned products",
      what_does_it_mean_products_bars_explanation: "What do the product bars mean?",
      topics_and_sentiment: "Topics and Sentiment",
      topics_analysis_description: "Analysis of topics and sentiments",
      what_does_it_mean_topics_bars_explanation: "What do the topic bars mean?",
      conversation_trend: "Conversation Trend",
      conversation_trend_description: "Conversation trend over time",
      what_does_it_mean_conversation_trend_explanation: "What does the conversation trend mean?",
      keywords: "Keywords",
      keywords_description: "Keywords description",
      what_does_it_mean_keywords_explanation: "What do the keywords mean?",
      
      // Additional Analytics Terms
      avg_duration: "Average duration",
      time_per_conversation: "Time per conversation",
      peak_hours: "Peak hours",
      highest_activity: "Highest activity",
      devices: "Devices",
      mobile_desktop: "Mobile/Desktop",
      export_pdf: "Export PDF",
      back_to_dashboard: "Back to dashboard",
      
      // Dashboard and Navigation
      dashboard_title: "Dashboard title",
      manage_assistant: "Manage assistant",
      task_automation: "Task automation",
      
      // Footer
      footer: {
        company_description: "Company description",
        product: "Product", 
        company: "Company",
        support: "Support",
        features: "Features",
        pricing: "Pricing",
        documentation: "Documentation",
        get_started: "Get started",
        about_us: "About us",
        contact: "Contact",
        privacy_policy: "Privacy policy",
        terms_of_service: "Terms of service",
        help_center: "Help center",
        all_rights_reserved: "All rights reserved"
      }
    }
  }
};

console.log('🔍 I18N DEBUG - Manual resources loaded:', {
  fr: {
    pricing: typeof resources.fr.translation.pricing,
    documentation: typeof resources.fr.translation.documentation,
    get_started: typeof resources.fr.translation.get_started
  },
  es: {
    pricing: typeof resources.es.translation.pricing,
    documentation: typeof resources.es.translation.documentation, 
    get_started: typeof resources.es.translation.get_started
  },
  en: {
    pricing: typeof resources.en.translation.pricing,
    documentation: typeof resources.en.translation.documentation,
    get_started: typeof resources.en.translation.get_started
  }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;