import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface FeatureAccessResponse {
  hasAccess: boolean;
  currentPlan: string;
  requiredPlan?: string;
  requiredPlanName?: string;
  upgradeMessage?: string;
  feature: string;
}

interface FeatureAccessRequest {
  feature: string;
}

/**
 * Hook para verificar el acceso a una característica específica
 */
export function useFeatureAccess(feature: string) {
  return useQuery({
    queryKey: ['feature-access', feature],
    queryFn: async () => {
      const response = await apiRequest('/api/features/check-access', {
        method: 'POST',
        body: { feature }
      });
      return response as FeatureAccessResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!feature
  });
}

/**
 * Hook para verificar múltiples características
 */
export function useMultipleFeatureAccess(features: string[]) {
  return useQuery({
    queryKey: ['multiple-feature-access', features],
    queryFn: async () => {
      const results = await Promise.all(
        features.map(async (feature) => {
          try {
            const response = await apiRequest('/api/features/check-access', {
              method: 'POST',
              body: { feature }
            });
            return { feature, ...response };
          } catch (error) {
            console.error(`Error checking access for feature ${feature}:`, error);
            return { 
              feature, 
              hasAccess: false, 
              currentPlan: 'basic',
              error: true 
            };
          }
        })
      );
      
      return results.reduce((acc, result) => {
        acc[result.feature] = result;
        return acc;
      }, {} as Record<string, FeatureAccessResponse & { error?: boolean }>);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: features.length > 0
  });
}

/**
 * Mutation para verificar acceso a características bajo demanda
 */
export function useCheckFeatureAccess() {
  return useMutation({
    mutationFn: async (request: FeatureAccessRequest) => {
      const response = await apiRequest('/api/features/check-access', {
        method: 'POST',
        body: request
      });
      return response as FeatureAccessResponse;
    }
  });
}

/**
 * Hook que combina la verificación de acceso con funciones helper
 */
export function useFeatureCheck(feature: string) {
  const { data, isLoading, error } = useFeatureAccess(feature);
  
  const hasAccess = data?.hasAccess ?? false;
  const needsUpgrade = !hasAccess && !isLoading && !error;
  
  return {
    hasAccess,
    needsUpgrade,
    currentPlan: data?.currentPlan,
    requiredPlan: data?.requiredPlan,
    requiredPlanName: data?.requiredPlanName,
    upgradeMessage: data?.upgradeMessage,
    featureName: data?.feature,
    isLoading,
    error
  };
}