import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/auth-context';
import { useUpgradeModal } from './use-upgrade-modal';

// Tipos para los límites del plan
export interface PlanLimits {
  planTier: string;
  planName: string;
  subscription: {
    status: string;
    interactionsUsed: number;
    interactionsLimit: number;
  };
  limits: {
    integrations: {
      limit: number;
      used: number;
      remaining: number;
    };
    forms: {
      limit: number;
      used: number;
      remaining: number;
    };
    conversations: {
      limit: number;
      used: number;
      remaining: number;
    };
  };
  features: {
    [key: string]: boolean;
  };
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  limit?: number;
  planTier?: string;
  planName?: string;
}

export type LimitableResource = 'integrations' | 'forms' | 'conversations';
export type LimitableFeature = 'customBranding' | 'advancedAnalytics' | 'apiAccess' | 'basicAutomations' | 
  'advancedAutomations' | 'webhooks' | 'basicExport' | 'advancedExport' | 'dataBackups' | 
  'crmIntegrations' | 'calendarIntegrations' | 'emailIntegrations' | 'multiUserAccess' | 
  'teamManagement' | 'whiteLabel';

export function usePlanLimits() {
  const { user, isAuthenticated } = useAuth();
  const upgradeModal = useUpgradeModal();
  const queryClient = useQueryClient();

  // Query para obtener el resumen completo de límites
  const {
    data: limitsData,
    isLoading,
    error,
    refetch
  } = useQuery<PlanLimits>({
    queryKey: ['plan-limits', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Usuario no autenticado');
      }
      
      const response = await apiRequest('GET', '/api/limits/summary');
      if (!response.ok) {
        throw new Error('Error al obtener límites del plan');
      }
      
      return response.json();
    },
    enabled: isAuthenticated && !!user,
    staleTime: 30000, // 30 segundos de cache
    gcTime: 5 * 60 * 1000 // 5 minutos en cache
  });

  // Mutation para verificar si se puede crear un recurso específico
  const checkResourceLimitMutation = useMutation<LimitCheckResult, Error, { resourceType: LimitableResource }>({
    mutationFn: async ({ resourceType }) => {
      const response = await apiRequest('GET', `/api/limits/check-resource/${resourceType}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al verificar límite');
      }
      return await response.json() as LimitCheckResult;
    }
  });

  // Mutation para verificar acceso a funcionalidades
  const checkFeatureAccessMutation = useMutation<LimitCheckResult, Error, { feature: LimitableFeature }>({
    mutationFn: async ({ feature }) => {
      const response = await apiRequest('GET', `/api/limits/check-feature/${feature}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al verificar acceso');
      }
      return await response.json() as LimitCheckResult;
    }
  });

  // Función para verificar si se puede crear un recurso
  const canCreateResource = useCallback(async (resourceType: LimitableResource): Promise<boolean> => {
    try {
      const result = await checkResourceLimitMutation.mutateAsync({ resourceType });
      
      if (!result.allowed && result.reason) {
        // Mostrar modal de upgrade automáticamente
        upgradeModal.handlePlanLimitError(result.reason);
      }
      
      return result.allowed;
    } catch (error) {
      console.error(`Error verificando límite de ${resourceType}:`, error);
      return false;
    }
  }, [checkResourceLimitMutation, upgradeModal]);

  // Función para verificar acceso a funcionalidades
  const hasFeatureAccess = useCallback(async (feature: LimitableFeature): Promise<boolean> => {
    try {
      const result = await checkFeatureAccessMutation.mutateAsync({ feature });
      
      if (!result.allowed && result.reason) {
        // Mostrar modal de upgrade automáticamente
        upgradeModal.handlePlanLimitError(result.reason);
      }
      
      return result.allowed;
    } catch (error) {
      console.error(`Error verificando acceso a ${feature}:`, error);
      return false;
    }
  }, [checkFeatureAccessMutation, upgradeModal]);

  // Función para verificar límite sin mostrar modal (para UI)
  const checkResourceLimitSilent = useCallback((resourceType: LimitableResource): LimitCheckResult | null => {
    if (!limitsData) return null;

    const resourceLimits = limitsData.limits[resourceType as keyof typeof limitsData.limits];
    if (!resourceLimits) return null;

    const allowed = resourceLimits.limit === -1 || resourceLimits.used < resourceLimits.limit;
    
    return {
      allowed,
      currentCount: resourceLimits.used,
      limit: resourceLimits.limit,
      planTier: limitsData.planTier,
      planName: limitsData.planName,
      reason: !allowed ? `Has alcanzado el límite de ${resourceType} (${resourceLimits.used}/${resourceLimits.limit})` : undefined
    };
  }, [limitsData]);

  // Función para verificar acceso a funcionalidad sin mostrar modal (para UI)
  const checkFeatureAccessSilent = useCallback((feature: LimitableFeature): boolean => {
    if (!limitsData) return false;
    return limitsData.features[feature] || false;
  }, [limitsData]);

  // Función para obtener el porcentaje de uso de un recurso
  const getUsagePercentage = useCallback((resourceType: LimitableResource): number => {
    if (!limitsData) return 0;
    
    const resourceLimits = limitsData.limits[resourceType as keyof typeof limitsData.limits];
    if (!resourceLimits || resourceLimits.limit === -1) return 0;
    
    return Math.min(100, (resourceLimits.used / resourceLimits.limit) * 100);
  }, [limitsData]);

  // Función para invalidar cache y refrescar límites
  const refreshLimits = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['plan-limits'] });
    refetch();
  }, [queryClient, refetch]);

  // Función para mostrar advertencia cuando esté cerca del límite
  const showLimitWarning = useCallback((resourceType: LimitableResource, threshold: number = 80) => {
    const percentage = getUsagePercentage(resourceType);
    
    if (percentage >= threshold && limitsData) {
      const resourceLimits = limitsData.limits[resourceType as keyof typeof limitsData.limits];
      console.warn(`Advertencia: ${resourceType} al ${percentage.toFixed(1)}% de uso (${resourceLimits.used}/${resourceLimits.limit})`);
      
      // Mostrar notificación visual si está cerca del límite
      if (percentage >= 90) {
        upgradeModal.showUpgradeModal(
          resourceType as any,
          resourceLimits.limit,
          limitsData.planName
        );
      }
    }
  }, [getUsagePercentage, limitsData, upgradeModal]);

  return {
    // Datos
    limits: limitsData,
    isLoading,
    error,
    
    // Funciones de verificación (con modal)
    canCreateResource,
    hasFeatureAccess,
    
    // Funciones de verificación silenciosa (para UI)
    checkResourceLimitSilent,
    checkFeatureAccessSilent,
    
    // Utilidades
    getUsagePercentage,
    showLimitWarning,
    refreshLimits,
    
    // Estados de mutations
    isCheckingResource: checkResourceLimitMutation.isPending,
    isCheckingFeature: checkFeatureAccessMutation.isPending,
    
    // Modal de upgrade
    upgradeModal
  };
}