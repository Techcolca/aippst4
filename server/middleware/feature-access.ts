import { Request, Response, NextFunction } from 'express';
import { hasFeatureAccess, getRequiredPlanForFeature, FEATURE_NAMES, PLAN_NAMES } from '../../shared/feature-permissions';
import { getUserSubscription } from './subscription';

/**
 * Middleware para verificar acceso a características específicas
 * No bloquea el acceso, solo añade información al request
 */
export function checkFeatureAccess(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Obtener suscripción del usuario
      const subscription = await getUserSubscription(req.userId);
      const userPlan = subscription?.tier || 'basic';

      // Verificar si tiene acceso a la característica
      const hasAccess = hasFeatureAccess(userPlan, feature as any);

      // Añadir información al request
      req.featureAccess = {
        hasAccess,
        userPlan,
        requestedFeature: feature,
        requiredPlan: hasAccess ? userPlan : getRequiredPlanForFeature(feature as any)
      };

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Middleware que bloquea el acceso si no tiene la característica
 * Devuelve un error con información del plan requerido
 */
export function requireFeatureAccess(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Obtener suscripción del usuario
      const subscription = await getUserSubscription(req.userId);
      const userPlan = subscription?.tier || 'basic';

      // Verificar si tiene acceso a la característica
      const hasAccess = hasFeatureAccess(userPlan, feature as any);

      if (!hasAccess) {
        const requiredPlan = getRequiredPlanForFeature(feature as any);
        const featureName = FEATURE_NAMES[feature] || feature;
        const planName = PLAN_NAMES[requiredPlan] || requiredPlan;

        return res.status(403).json({
          message: 'Feature not available in your current plan',
          code: 'FEATURE_NOT_AVAILABLE',
          data: {
            feature: featureName,
            currentPlan: userPlan,
            requiredPlan: requiredPlan,
            requiredPlanName: planName,
            upgradeMessage: `Para acceder a ${featureName}, necesitas actualizar a ${planName}`
          }
        });
      }

      // Añadir información al request
      req.featureAccess = {
        hasAccess: true,
        userPlan,
        requestedFeature: feature,
        requiredPlan: userPlan
      };

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Middleware que permite el acceso pero marca si necesita upgrade
 * Útil para funciones que queremos mostrar pero con popup de upgrade
 */
export function softFeatureCheck(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Obtener suscripción del usuario
      const subscription = await getUserSubscription(req.userId);
      const userPlan = subscription?.tier || 'basic';

      // Verificar si tiene acceso a la característica
      const hasAccess = hasFeatureAccess(userPlan, feature as any);

      // Añadir información al request
      req.featureAccess = {
        hasAccess,
        userPlan,
        requestedFeature: feature,
        requiredPlan: hasAccess ? userPlan : getRequiredPlanForFeature(feature as any),
        needsUpgrade: !hasAccess
      };

      // Siempre continuar, pero con información de upgrade si es necesario
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

// Extender el tipo Request para incluir información de acceso a características
declare global {
  namespace Express {
    interface Request {
      featureAccess?: {
        hasAccess: boolean;
        userPlan: string;
        requestedFeature: string;
        requiredPlan: string;
        needsUpgrade?: boolean;
      };
    }
  }
}