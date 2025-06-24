/**
 * Sistema de permisos de características por plan
 * Define qué características están disponibles para cada plan según el documento
 */

export interface PlanLimitations {
  // Conversaciones
  conversationsPerMonth: number;
  
  // Formularios
  maxForms: number;
  availableTemplates: number;
  
  // Widgets
  bubbleWidget: boolean;
  fullscreenWidget: boolean;
  
  // Integraciones
  maxWebsites: number;
  
  // Procesamiento de documentos
  basicDocumentProcessing: boolean;
  advancedDocumentProcessing: boolean;
  
  // Base de conocimiento
  customKnowledgeBase: boolean;
  
  // Leads
  basicLeadCapture: boolean;
  advancedLeadTracking: boolean;
  
  // Análisis
  basicAnalytics: boolean;
  advancedAnalytics: boolean;
  customReports: boolean;
  
  // Branding
  limitedBranding: boolean;
  completeBranding: boolean;
  
  // Soporte
  emailSupport: boolean;
  chatSupport: boolean;
  phoneSupport: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  
  // Exportación
  basicDataExport: boolean;
  multiFormatExport: boolean;
  unlimitedExport: boolean;
  
  // Automatizaciones
  basicAutomations: boolean;
  advancedAutomations: boolean;
  aiAutomations: boolean;
  
  // Integraciones CRM
  crmIntegrations: boolean;
  allCrmIntegrations: boolean;
  
  // API
  apiAccess: boolean;
  fullApiAccess: boolean;
  
  // Equipos
  teamManagement: boolean;
  maxTeamMembers: number;
  
  // Respaldos
  automaticBackups: boolean;
  dailyBackups: boolean;
  
  // Otros
  onboarding: boolean;
  accountManager: boolean;
  slaGuarantee: boolean;
}

// Definir las limitaciones por plan según el documento
export const PLAN_LIMITATIONS: Record<string, PlanLimitations> = {
  basic: {
    conversationsPerMonth: 500,
    maxForms: 1,
    availableTemplates: 2,
    bubbleWidget: true,
    fullscreenWidget: false,
    maxWebsites: 1,
    basicDocumentProcessing: true,
    advancedDocumentProcessing: false,
    customKnowledgeBase: false,
    basicLeadCapture: true,
    advancedLeadTracking: false,
    basicAnalytics: true,
    advancedAnalytics: false,
    customReports: false,
    limitedBranding: true,
    completeBranding: false,
    emailSupport: true,
    chatSupport: false,
    phoneSupport: false,
    prioritySupport: false,
    dedicatedSupport: false,
    basicDataExport: false,
    multiFormatExport: false,
    unlimitedExport: false,
    basicAutomations: false,
    advancedAutomations: false,
    aiAutomations: false,
    crmIntegrations: false,
    allCrmIntegrations: false,
    apiAccess: false,
    fullApiAccess: false,
    teamManagement: false,
    maxTeamMembers: 1,
    automaticBackups: false,
    dailyBackups: false,
    onboarding: false,
    accountManager: false,
    slaGuarantee: false
  },
  
  startup: {
    conversationsPerMonth: 2000,
    maxForms: 5,
    availableTemplates: 999, // Todas las plantillas
    bubbleWidget: true,
    fullscreenWidget: true,
    maxWebsites: 3,
    basicDocumentProcessing: true,
    advancedDocumentProcessing: true,
    customKnowledgeBase: true,
    basicLeadCapture: true,
    advancedLeadTracking: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: false,
    limitedBranding: false,
    completeBranding: true,
    emailSupport: true,
    chatSupport: true,
    phoneSupport: false,
    prioritySupport: true,
    dedicatedSupport: false,
    basicDataExport: true,
    multiFormatExport: false,
    unlimitedExport: false,
    basicAutomations: false,
    advancedAutomations: false,
    aiAutomations: false,
    crmIntegrations: false,
    allCrmIntegrations: false,
    apiAccess: false,
    fullApiAccess: false,
    teamManagement: false,
    maxTeamMembers: 1,
    automaticBackups: false,
    dailyBackups: false,
    onboarding: false,
    accountManager: false,
    slaGuarantee: false
  },
  
  professional: {
    conversationsPerMonth: 10000,
    maxForms: 999999, // Ilimitados
    availableTemplates: 999, // Todas las plantillas
    bubbleWidget: true,
    fullscreenWidget: true,
    maxWebsites: 999999, // Ilimitados
    basicDocumentProcessing: true,
    advancedDocumentProcessing: true,
    customKnowledgeBase: true,
    basicLeadCapture: true,
    advancedLeadTracking: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: true,
    limitedBranding: false,
    completeBranding: true,
    emailSupport: true,
    chatSupport: true,
    phoneSupport: true,
    prioritySupport: true,
    dedicatedSupport: false,
    basicDataExport: true,
    multiFormatExport: true,
    unlimitedExport: false,
    basicAutomations: true,
    advancedAutomations: false,
    aiAutomations: false,
    crmIntegrations: true,
    allCrmIntegrations: false,
    apiAccess: true,
    fullApiAccess: false,
    teamManagement: true,
    maxTeamMembers: 5,
    automaticBackups: true,
    dailyBackups: false,
    onboarding: true,
    accountManager: false,
    slaGuarantee: false
  },
  
  enterprise: {
    conversationsPerMonth: 999999, // Ilimitado
    maxForms: 999999, // Ilimitados
    availableTemplates: 999, // Todas las plantillas
    bubbleWidget: true,
    fullscreenWidget: true,
    maxWebsites: 999999, // Ilimitados
    basicDocumentProcessing: true,
    advancedDocumentProcessing: true,
    customKnowledgeBase: true,
    basicLeadCapture: true,
    advancedLeadTracking: true,
    basicAnalytics: true,
    advancedAnalytics: true,
    customReports: true,
    limitedBranding: false,
    completeBranding: true,
    emailSupport: true,
    chatSupport: true,
    phoneSupport: true,
    prioritySupport: true,
    dedicatedSupport: true,
    basicDataExport: true,
    multiFormatExport: true,
    unlimitedExport: true,
    basicAutomations: true,
    advancedAutomations: true,
    aiAutomations: true,
    crmIntegrations: true,
    allCrmIntegrations: true,
    apiAccess: true,
    fullApiAccess: true,
    teamManagement: true,
    maxTeamMembers: 999999, // Ilimitado
    automaticBackups: true,
    dailyBackups: true,
    onboarding: true,
    accountManager: true,
    slaGuarantee: true
  }
};

// Funciones helper para verificar permisos
export function hasFeatureAccess(userPlan: string, feature: keyof PlanLimitations): boolean {
  const plan = PLAN_LIMITATIONS[userPlan?.toLowerCase()];
  if (!plan) {
    // Si no hay plan, usar limitaciones del plan básico
    return PLAN_LIMITATIONS.basic[feature] as boolean;
  }
  return plan[feature] as boolean;
}

export function getFeatureLimit(userPlan: string, feature: keyof PlanLimitations): number {
  const plan = PLAN_LIMITATIONS[userPlan?.toLowerCase()];
  if (!plan) {
    // Si no hay plan, usar limitaciones del plan básico
    return PLAN_LIMITATIONS.basic[feature] as number;
  }
  return plan[feature] as number;
}

export function getRequiredPlanForFeature(feature: keyof PlanLimitations): string {
  // Encontrar el plan más básico que incluye esta característica
  for (const [planName, limitations] of Object.entries(PLAN_LIMITATIONS)) {
    if (limitations[feature] === true || (typeof limitations[feature] === 'number' && limitations[feature] > 0)) {
      return planName;
    }
  }
  return 'enterprise'; // Por defecto, si no se encuentra en ninguno
}

// Mapeo de características a nombres amigables para el usuario
export const FEATURE_NAMES: Record<string, string> = {
  fullscreenWidget: 'Modo pantalla completa tipo ChatGPT',
  advancedDocumentProcessing: 'Procesamiento avanzado de documentos',
  customKnowledgeBase: 'Base de conocimiento personalizada',
  advancedLeadTracking: 'Seguimiento avanzado de leads',
  advancedAnalytics: 'Análisis avanzados con métricas',
  customReports: 'Reportes personalizados',
  completeBranding: 'Personalización completa de branding',
  chatSupport: 'Soporte por chat',
  phoneSupport: 'Soporte telefónico',
  prioritySupport: 'Soporte prioritario',
  dedicatedSupport: 'Soporte dedicado 24/7',
  multiFormatExport: 'Exportación en múltiples formatos',
  unlimitedExport: 'Exportación ilimitada',
  basicAutomations: 'Automatizaciones básicas',
  advancedAutomations: 'Automatizaciones avanzadas',
  aiAutomations: 'Automatizaciones con IA',
  crmIntegrations: 'Integración con CRM',
  allCrmIntegrations: 'Integración con todos los CRM',
  apiAccess: 'Acceso a API',
  fullApiAccess: 'API completa para desarrolladores',
  teamManagement: 'Gestión de equipos',
  automaticBackups: 'Respaldos automáticos',
  dailyBackups: 'Respaldos diarios',
  onboarding: 'Onboarding personalizado',
  accountManager: 'Gerente de cuenta dedicado',
  slaGuarantee: 'SLA garantizado'
};

// Mapeo de nombres de plan a nombres amigables
export const PLAN_NAMES: Record<string, string> = {
  basic: 'Básico ($7 USD/mes)',
  startup: 'Startup ($29 USD/mes)',
  professional: 'Profesional ($89 USD/mes)',
  enterprise: 'Empresarial ($299 USD/mes)'
};