// Sistema de permisos y limitaciones por plan de suscripción

export interface PlanLimits {
  // Límites básicos
  integrations: number;
  forms: number;
  conversations: number;
  
  // Funcionalidades disponibles
  features: {
    // Integraciones y chatbots
    createIntegrations: boolean;
    createForms: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    
    // Automatizaciones
    basicAutomations: boolean;
    advancedAutomations: boolean;
    webhooks: boolean;
    
    // Soporte
    emailSupport: boolean;
    prioritySupport: boolean;
    phoneSupport: boolean;
    
    // Exportación y datos
    basicExport: boolean;
    advancedExport: boolean;
    dataBackups: boolean;
    
    // Integraciones externas
    crmIntegrations: boolean;
    calendarIntegrations: boolean;
    emailIntegrations: boolean;
    
    // Características avanzadas
    multiUserAccess: boolean;
    teamManagement: boolean;
    whiteLabel: boolean;
  };
}

export const PLAN_PERMISSIONS: Record<string, PlanLimits> = {
  free: {
    integrations: 1,
    forms: 1,
    conversations: 20,
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: false,
      basicAutomations: false,
      advancedAutomations: false,
      webhooks: false,
      emailSupport: true,
      prioritySupport: false,
      phoneSupport: false,
      basicExport: false,
      advancedExport: false,
      dataBackups: false,
      crmIntegrations: false,
      calendarIntegrations: false,
      emailIntegrations: false,
      multiUserAccess: false,
      teamManagement: false,
      whiteLabel: false,
    }
  },
  
  basic: {
    integrations: 1,
    forms: 3,
    conversations: 500,
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: true,
      advancedAnalytics: false,
      apiAccess: false,
      basicAutomations: true,
      advancedAutomations: false,
      webhooks: false,
      emailSupport: true,
      prioritySupport: false,
      phoneSupport: false,
      basicExport: true,
      advancedExport: false,
      dataBackups: false,
      crmIntegrations: false,
      calendarIntegrations: false,
      emailIntegrations: false,
      multiUserAccess: false,
      teamManagement: false,
      whiteLabel: false,
    }
  },
  
  startup: {
    integrations: 3,
    forms: 10,
    conversations: 2000,
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: false,
      basicAutomations: true,
      advancedAutomations: true,
      webhooks: false,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: false,
      basicExport: true,
      advancedExport: true,
      dataBackups: true,
      crmIntegrations: false,
      calendarIntegrations: true,
      emailIntegrations: true,
      multiUserAccess: false,
      teamManagement: false,
      whiteLabel: false,
    }
  },
  
  professional: {
    integrations: 10,
    forms: -1, // -1 = ilimitado
    conversations: 10000,
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      basicAutomations: true,
      advancedAutomations: true,
      webhooks: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      basicExport: true,
      advancedExport: true,
      dataBackups: true,
      crmIntegrations: true,
      calendarIntegrations: true,
      emailIntegrations: true,
      multiUserAccess: true,
      teamManagement: true,
      whiteLabel: false,
    }
  },
  
  enterprise: {
    integrations: -1, // ilimitado
    forms: -1, // ilimitado
    conversations: -1, // ilimitado
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      basicAutomations: true,
      advancedAutomations: true,
      webhooks: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      basicExport: true,
      advancedExport: true,
      dataBackups: true,
      crmIntegrations: true,
      calendarIntegrations: true,
      emailIntegrations: true,
      multiUserAccess: true,
      teamManagement: true,
      whiteLabel: true,
    }
  },
  
  admin: {
    integrations: -1, // ilimitado
    forms: -1, // ilimitado
    conversations: -1, // ilimitado
    features: {
      createIntegrations: true,
      createForms: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      basicAutomations: true,
      advancedAutomations: true,
      webhooks: true,
      emailSupport: true,
      prioritySupport: true,
      phoneSupport: true,
      basicExport: true,
      advancedExport: true,
      dataBackups: true,
      crmIntegrations: true,
      calendarIntegrations: true,
      emailIntegrations: true,
      multiUserAccess: true,
      teamManagement: true,
      whiteLabel: true,
    }
  }
};

export const PLAN_NAMES: Record<string, string> = {
  free: 'Plan Gratuito',
  basic: 'Plan Básico',
  startup: 'Plan Startup', 
  professional: 'Plan Profesional',
  enterprise: 'Plan Empresarial',
  admin: 'Administrador'
};

export function getPlanLimits(planTier: string): PlanLimits {
  return PLAN_PERMISSIONS[planTier] || PLAN_PERMISSIONS.free;
}

export function hasFeatureAccess(planTier: string, feature: keyof PlanLimits['features']): boolean {
  const limits = getPlanLimits(planTier);
  return limits.features[feature];
}

export function getResourceLimit(planTier: string, resource: keyof Pick<PlanLimits, 'integrations' | 'forms' | 'conversations'>): number {
  const limits = getPlanLimits(planTier);
  return limits[resource];
}

export function canCreateResource(planTier: string, resource: keyof Pick<PlanLimits, 'integrations' | 'forms'>, currentCount: number): boolean {
  const limit = getResourceLimit(planTier, resource);
  if (limit === -1) return true; // ilimitado
  return currentCount < limit;
}

export function getUpgradeMessage(currentPlan: string, requiredFeature: string): string {
  const planName = PLAN_NAMES[currentPlan] || 'Plan actual';
  
  switch (requiredFeature) {
    case 'createIntegrations':
      return `Tu ${planName} ha alcanzado el límite de integraciones. Actualiza para crear más.`;
    case 'createForms':
      return `Tu ${planName} ha alcanzado el límite de formularios. Actualiza para crear más.`;
    case 'advancedAnalytics':
      return `Las analíticas avanzadas requieren un plan superior al ${planName}.`;
    case 'apiAccess':
      return `El acceso a la API requiere un plan superior al ${planName}.`;
    case 'crmIntegrations':
      return `Las integraciones con CRM requieren un plan superior al ${planName}.`;
    default:
      return `Esta funcionalidad requiere un plan superior al ${planName}.`;
  }
}

export function getNextPlanForFeature(currentPlan: string, feature: keyof PlanLimits['features']): string | null {
  const plans = ['free', 'basic', 'startup', 'professional', 'enterprise'];
  const currentIndex = plans.indexOf(currentPlan);
  
  for (let i = currentIndex + 1; i < plans.length; i++) {
    const plan = plans[i];
    if (hasFeatureAccess(plan, feature)) {
      return plan;
    }
  }
  
  return null;
}