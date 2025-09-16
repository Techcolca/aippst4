import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { PRODUCTS } from "../lib/stripe";

// Tipos de interacción que cuentan para el límite
export enum InteractionType {
  CHAT = "chat",          // Mensajes de chat
  DOCUMENT = "document",  // Procesamiento de documentos
  ANALYSIS = "analysis",  // Análisis de sentimiento, etc.
}

/**
 * Middleware para verificar si el usuario tiene un plan activo y
 * puede realizar la acción solicitada según su nivel de suscripción
 */
export async function verifySubscription(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Verificar que el usuario está autenticado
    if (!req.userId) {
      return res.status(401).json({ 
        message: "No autorizado. Inicia sesión para continuar.",
        code: "UNAUTHORIZED"
      });
    }

    // Obtener información de suscripción del usuario
    const userId = req.userId;
    const subscription = await getUserSubscription(userId);

    // Si no hay una suscripción, crear una gratuita automáticamente
    if (!subscription) {
      // Crear suscripción gratuita para el usuario
      await storage.createSubscription({
        userId,
        tier: "free",
        status: "active",
        interactionsLimit: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      });

      // Continuar con la ejecución normal
      return next();
    }
    
    // Verificar que la suscripción esté activa
    if (subscription.status !== "active") {
      return res.status(403).json({ 
        message: "Tu suscripción no está activa. Actualiza tu plan para continuar.",
        code: "SUBSCRIPTION_INACTIVE"
      });
    }

    // Verificar que no ha excedido el límite de interacciones
    // Solo si está solicitando una funcionalidad que cuenta como interacción
    const isInteraction = isCountableInteraction(req.path, req.method);
    
    if (isInteraction && subscription.interactionsUsed >= subscription.interactionsLimit) {
      return res.status(403).json({ 
        message: "Has alcanzado el límite de interacciones de tu plan actual. Actualiza tu plan para continuar.",
        code: "INTERACTION_LIMIT_REACHED"
      });
    }

    // Adjuntar la información de suscripción a la solicitud para uso posterior
    req.subscription = subscription;
    
    // Continuar con la solicitud
    next();
  } catch (error) {
    console.error("Error verificando suscripción:", error);
    res.status(500).json({ 
      message: "Error al verificar tu suscripción. Inténtalo nuevamente.",
      code: "SUBSCRIPTION_ERROR"
    });
  }
}

/**
 * Determina si una solicitud cuenta como una interacción que debe ser limitada
 */
function isCountableInteraction(path: string, method: string): boolean {
  // Comprobar si la ruta corresponde a una interacción que debe contabilizarse
  const interactionPaths = [
    // Interacciones de chat
    { path: '/api/widget/', method: 'POST' },
    { path: '/api/openai/completion', method: 'POST' },
    { path: '/api/openai/sentiment', method: 'POST' },
    { path: '/api/openai/summarize', method: 'POST' },
    
    // Procesamiento de documentos
    { path: '/api/documents/upload', method: 'POST' },
    { path: '/api/documents/process', method: 'POST' },
    
    // Análisis
    { path: '/api/analyze/', method: 'POST' },
  ];

  return interactionPaths.some(item => 
    path.includes(item.path) && method === item.method
  );
}

/**
 * Incrementa el contador de interacciones para un usuario
 */
export async function incrementInteractionCount(
  req: Request, 
  interactionType: InteractionType = InteractionType.CHAT
): Promise<boolean> {
  try {
    if (!req.userId || !req.subscription) {
      return false;
    }

    // Incrementar el contador en la base de datos
    await storage.incrementSubscriptionUsage(req.subscription.id);
    
    return true;
  } catch (error) {
    console.error(`Error incrementando contador de interacciones (${interactionType}):`, error);
    return false;
  }
}

/**
 * Obtiene la información de suscripción actual de un usuario
 */
export async function getUserSubscription(userId: number) {
  try {
    // Buscar la suscripción activa del usuario
    const subscriptions = await storage.getUserSubscriptions(userId);
    
    if (!subscriptions || subscriptions.length === 0) {
      return null;
    }
    
    // Encontrar la suscripción activa más reciente
    return subscriptions
      .filter(sub => sub.status === 'active')
      .sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt || new Date(0);
        const dateB = b.updatedAt || b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })[0] || null;
  } catch (error) {
    console.error('Error obteniendo la suscripción del usuario:', error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene acceso a una característica específica basado en su nivel de suscripción
 */
export function hasFeatureAccess(subscription: any, feature: string): boolean {
  // Lista de características por nivel
  const featuresByTier: Record<string, string[]> = {
    free: [
      "widget_bubble",
      "basic_analytics",
    ],
    basic: [
      "widget_bubble",
      "document_upload",
      "basic_analytics",
      "lead_capture",
    ],
    professional: [
      "widget_bubble",
      "widget_fullscreen",
      "document_upload",
      "detailed_analytics",
      "lead_capture",
      "task_automation",
    ],
    enterprise: [
      "widget_bubble",
      "widget_fullscreen",
      "document_upload",
      "detailed_analytics",
      "lead_capture",
      "task_automation",
      "custom_branding",
      "crm_integration",
    ],
  };

  // Si no hay suscripción o no está activa, solo tiene acceso a características gratuitas
  if (!subscription || subscription.status !== "active") {
    return featuresByTier.free.includes(feature);
  }

  // Obtener nivel y verificar acceso
  const tier = subscription.tier || "free";
  
  // Características del nivel actual
  const allowedFeatures = featuresByTier[tier] || [];
  
  // Si es nivel enterprise, conceder acceso a todo
  if (tier === "enterprise") {
    return true;
  }
  
  return allowedFeatures.includes(feature);
}

/**
 * Convierte un nivel a su límite de interacciones
 */
export function getInteractionLimitByTier(tier: string): number {
  const limits: Record<string, number> = {
    free: 20,
    basic: 500,
    professional: 2000,
    enterprise: 99999, // "ilimitado"
  };
  
  return limits[tier.toLowerCase()] || limits.free;
}

// Request interface extension is now in server/middleware/auth.ts