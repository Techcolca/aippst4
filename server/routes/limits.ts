import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { 
  checkResourceLimit, 
  checkFeatureAccess, 
  getUserLimitsSummary,
  LimitableResource,
  LimitableFeature 
} from '../middleware/plan-limits';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateJWT);

/**
 * GET /api/limits/summary
 * Obtiene un resumen completo de los límites y uso actual del usuario
 */
router.get('/summary', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    const summary = await getUserLimitsSummary(req.userId);
    
    if (!summary) {
      return res.status(404).json({ 
        message: 'No se encontró información de suscripción' 
      });
    }

    res.json(summary);

  } catch (error) {
    console.error('Error obteniendo resumen de límites:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

/**
 * GET /api/limits/check-resource/:resourceType
 * Verifica si el usuario puede crear un nuevo recurso
 */
router.get('/check-resource/:resourceType', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    const resourceType = req.params.resourceType as LimitableResource;
    
    // Validar tipo de recurso
    const validResources: LimitableResource[] = ['integrations', 'forms', 'conversations'];
    if (!validResources.includes(resourceType)) {
      return res.status(400).json({ 
        message: `Tipo de recurso no válido: ${resourceType}` 
      });
    }

    const result = await checkResourceLimit(req.userId, resourceType);
    res.json(result);

  } catch (error) {
    console.error(`Error verificando límite de recurso:`, error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

/**
 * GET /api/limits/check-feature/:feature
 * Verifica si el usuario tiene acceso a una funcionalidad específica
 */
router.get('/check-feature/:feature', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado' 
      });
    }

    const feature = req.params.feature as LimitableFeature;
    
    // Validar funcionalidad
    const validFeatures: LimitableFeature[] = [
      'customBranding', 'advancedAnalytics', 'apiAccess', 'basicAutomations',
      'advancedAutomations', 'webhooks', 'basicExport', 'advancedExport', 
      'dataBackups', 'crmIntegrations', 'calendarIntegrations', 'emailIntegrations',
      'multiUserAccess', 'teamManagement', 'whiteLabel'
    ];
    
    if (!validFeatures.includes(feature)) {
      return res.status(400).json({ 
        message: `Funcionalidad no válida: ${feature}` 
      });
    }

    const result = await checkFeatureAccess(req.userId, feature);
    res.json(result);

  } catch (error) {
    console.error(`Error verificando acceso a funcionalidad:`, error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

export default router;