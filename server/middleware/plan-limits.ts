import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { 
  getPlanLimits, 
  hasFeatureAccess, 
  canCreateResource, 
  getUpgradeMessage, 
  PLAN_NAMES 
} from "../../shared/feature-permissions";
import { getUserSubscription } from "./subscription";

// Tipos de recursos que pueden tener límites
export type LimitableResource = 'integrations' | 'forms' | 'conversations';
export type LimitableFeature = 'customBranding' | 'advancedAnalytics' | 'apiAccess' | 'basicAutomations' | 
  'advancedAutomations' | 'webhooks' | 'basicExport' | 'advancedExport' | 'dataBackups' | 
  'crmIntegrations' | 'calendarIntegrations' | 'emailIntegrations' | 'multiUserAccess' | 
  'teamManagement' | 'whiteLabel';

// Resultado de verificación de límites
export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
  planTier?: string;
  planName?: string;
  nextPlan?: string;
}

/**
 * Verifica si un usuario puede crear un nuevo recurso basado en su plan actual
 */
export async function checkResourceLimit(
  userId: number, 
  resourceType: LimitableResource
): Promise<LimitCheckResult> {
  try {
    // Obtener suscripción del usuario
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return {
        allowed: false,
        reason: "No se encontró suscripción activa",
        planTier: "free"
      };
    }

    const planTier = subscription.tier || "free";
    const planLimits = getPlanLimits(planTier);
    const planName = PLAN_NAMES[planTier] || "Plan actual";

    // Obtener límite del plan
    const limit = planLimits[resourceType as keyof Pick<typeof planLimits, 'integrations' | 'forms' | 'conversations'>];
    
    // Si es ilimitado (-1), permitir
    if (limit === -1) {
      return {
        allowed: true,
        planTier,
        planName
      };
    }

    // Obtener el conteo actual del usuario
    let currentCount = 0;
    switch (resourceType) {
      case 'integrations':
        const integrations = await storage.getIntegrations(userId);
        currentCount = integrations.length;
        break;
      case 'forms':
        const forms = await storage.getForms(userId);
        currentCount = forms.length;
        break;
      case 'conversations':
        // Para conversaciones usar el límite de interacciones de la suscripción
        return {
          allowed: subscription.interactionsUsed < subscription.interactionsLimit,
          currentCount: subscription.interactionsUsed,
          limit: subscription.interactionsLimit,
          planTier,
          planName,
          reason: subscription.interactionsUsed >= subscription.interactionsLimit 
            ? getUpgradeMessage(planTier, 'conversations')
            : undefined
        };
      default:
        currentCount = 0;
    }

    // Verificar si puede crear más recursos
    const canCreate = currentCount < limit;
    
    return {
      allowed: canCreate,
      currentCount,
      limit,
      planTier,
      planName,
      reason: !canCreate ? getUpgradeMessage(planTier, `create${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}` as any) : undefined
    };

  } catch (error) {
    console.error(`Error verificando límite de ${resourceType}:`, error);
    return {
      allowed: false,
      reason: "Error al verificar límites del plan"
    };
  }
}

/**
 * Verifica si un usuario tiene acceso a una funcionalidad específica
 */
export async function checkFeatureAccess(
  userId: number, 
  feature: LimitableFeature
): Promise<LimitCheckResult> {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return {
        allowed: false,
        reason: "No se encontró suscripción activa",
        planTier: "free"
      };
    }

    const planTier = subscription.tier || "free";
    const planName = PLAN_NAMES[planTier] || "Plan actual";
    const hasAccess = hasFeatureAccess(planTier, feature);

    return {
      allowed: hasAccess,
      planTier,
      planName,
      reason: !hasAccess ? getUpgradeMessage(planTier, feature) : undefined
    };

  } catch (error) {
    console.error(`Error verificando acceso a funcionalidad ${feature}:`, error);
    return {
      allowed: false,
      reason: "Error al verificar acceso a la funcionalidad"
    };
  }
}

/**
 * Middleware para verificar límites de recursos antes de crear
 */
export function requireResourceLimit(resourceType: LimitableResource) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ 
          message: "No autorizado. Inicia sesión para continuar.",
          code: "UNAUTHORIZED"
        });
      }

      const limitCheck = await checkResourceLimit(req.userId, resourceType);
      
      if (!limitCheck.allowed) {
        return res.status(403).json({
          message: limitCheck.reason || `Has alcanzado el límite de ${resourceType}`,
          code: "PLAN_LIMIT_REACHED",
          limitType: resourceType,
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          planTier: limitCheck.planTier,
          planName: limitCheck.planName
        });
      }

      // Adjuntar información del límite a la request para uso posterior
      req.limitCheck = limitCheck;
      next();

    } catch (error) {
      console.error(`Error en middleware de límite ${resourceType}:`, error);
      return res.status(500).json({
        message: "Error al verificar límites del plan",
        code: "LIMIT_CHECK_ERROR"
      });
    }
  };
}

/**
 * Middleware para verificar acceso a funcionalidades
 */
export function requireFeatureAccess(feature: LimitableFeature) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ 
          message: "No autorizado. Inicia sesión para continuar.",
          code: "UNAUTHORIZED"
        });
      }

      const accessCheck = await checkFeatureAccess(req.userId, feature);
      
      if (!accessCheck.allowed) {
        return res.status(403).json({
          message: accessCheck.reason || `Esta funcionalidad no está disponible en tu plan actual`,
          code: "FEATURE_ACCESS_DENIED",
          feature,
          planTier: accessCheck.planTier,
          planName: accessCheck.planName
        });
      }

      next();

    } catch (error) {
      console.error(`Error en middleware de funcionalidad ${feature}:`, error);
      return res.status(500).json({
        message: "Error al verificar acceso a la funcionalidad",
        code: "FEATURE_CHECK_ERROR"
      });
    }
  };
}

/**
 * Obtiene un resumen completo de los límites y uso actual de un usuario
 */
export async function getUserLimitsSummary(userId: number) {
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      return null;
    }

    const planTier = subscription.tier || "free";
    const planLimits = getPlanLimits(planTier);
    const planName = PLAN_NAMES[planTier];

    // Obtener conteos actuales
    const integrations = await storage.getIntegrations(userId);
    
    return {
      planTier,
      planName,
      subscription: {
        status: subscription.status,
        interactionsUsed: subscription.interactionsUsed,
        interactionsLimit: subscription.interactionsLimit
      },
      limits: {
        integrations: {
          limit: planLimits.integrations,
          used: integrations.length,
          remaining: planLimits.integrations === -1 ? -1 : Math.max(0, planLimits.integrations - integrations.length)
        },
        forms: {
          limit: planLimits.forms,
          used: (await storage.getForms(userId)).length,
          remaining: planLimits.forms === -1 ? -1 : Math.max(0, planLimits.forms - (await storage.getForms(userId)).length)
        },
        conversations: {
          limit: subscription.interactionsLimit,
          used: subscription.interactionsUsed,
          remaining: Math.max(0, subscription.interactionsLimit - subscription.interactionsUsed)
        }
      },
      features: planLimits.features
    };

  } catch (error) {
    console.error("Error obteniendo resumen de límites:", error);
    return null;
  }
}

// Extender el tipo Request para incluir la verificación de límites
declare global {
  namespace Express {
    interface Request {
      limitCheck?: LimitCheckResult;
      userId: number;
    }
  }
}