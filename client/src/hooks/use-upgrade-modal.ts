import { useState, useCallback } from 'react';

interface UpgradeModalState {
  isOpen: boolean;
  limitType: 'integrations' | 'forms' | 'conversations' | 'general';
  currentLimit?: number;
  planName?: string;
}

export function useUpgradeModal() {
  const [modalState, setModalState] = useState<UpgradeModalState>({
    isOpen: false,
    limitType: 'general'
  });

  const showUpgradeModal = useCallback((
    limitType: UpgradeModalState['limitType'],
    currentLimit?: number,
    planName?: string
  ) => {
    setModalState({
      isOpen: true,
      limitType,
      currentLimit,
      planName
    });
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Helper function to parse 403 error messages and show appropriate modal
  const handlePlanLimitError = useCallback((errorMessage: string) => {
    console.log('Processing plan limit error:', errorMessage);
    
    // Extract plan information from error message - look for full plan names
    const planMatch = errorMessage.match(/Tu (Plan [\w\s]+) ha alcanzado/i) || 
                      errorMessage.match(/(Plan [\w\s]+) ha alcanzado/i) ||
                      errorMessage.match(/Tu Plan\s+(\w+)/i) || 
                      errorMessage.match(/Plan\s+(\w+)/i);
    let planName = planMatch ? planMatch[1] : 'Plan Básico';
    
    // If we only got a partial name like "Básico", convert to full name
    if (planName === 'Básico') planName = 'Plan Básico';
    if (planName === 'Startup') planName = 'Plan Startup';
    if (planName === 'Profesional') planName = 'Plan Profesional';
    if (planName === 'Empresarial') planName = 'Plan Empresarial';

    // More specific patterns for different types of limits
    if (errorMessage.includes('integración') || errorMessage.includes('integrations')) {
      // Pattern: "Tu Plan Básico ha alcanzado el límite de 1 integración"
      const limitMatch = errorMessage.match(/límite de (\d+) integración/i) || 
                         errorMessage.match(/máximo de (\d+) integración/i) ||
                         errorMessage.match(/(\d+) integración/i);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 1;
      console.log('Detected integration limit:', currentLimit, 'for plan:', planName);
      showUpgradeModal('integrations', currentLimit, planName);
    } else if (errorMessage.includes('formulario') || errorMessage.includes('forms')) {
      // Pattern: "Tu Plan Básico ha alcanzado el límite de 3 formularios"
      const limitMatch = errorMessage.match(/límite de (\d+) formulario/i) || 
                         errorMessage.match(/máximo de (\d+) formulario/i) ||
                         errorMessage.match(/(\d+) formulario/i);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 1;
      console.log('Detected form limit:', currentLimit, 'for plan:', planName);
      showUpgradeModal('forms', currentLimit, planName);
    } else if (errorMessage.includes('conversación') || errorMessage.includes('conversations')) {
      // Pattern: "Tu Plan Básico ha alcanzado el límite de 20 conversaciones por mes"
      const limitMatch = errorMessage.match(/límite de (\d+) conversación/i) || 
                         errorMessage.match(/máximo de (\d+) conversación/i) ||
                         errorMessage.match(/(\d+) conversación/i);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 20;
      console.log('Detected conversation limit:', currentLimit, 'for plan:', planName);
      showUpgradeModal('conversations', currentLimit, planName);
    } else {
      console.log('Generic plan limit detected for plan:', planName);
      showUpgradeModal('general', undefined, planName);
    }
  }, [showUpgradeModal]);

  return {
    ...modalState,
    showUpgradeModal,
    hideUpgradeModal,
    handlePlanLimitError
  };
}