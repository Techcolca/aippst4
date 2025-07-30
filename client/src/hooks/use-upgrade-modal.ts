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
    
    // Extract plan information from error message - first try to get full plan name
    let planName = 'Plan Básico'; // default
    
    // Try different patterns to extract the plan name
    const fullPlanMatch = errorMessage.match(/Tu (Plan [\wáéíóú\s]+) ha alcanzado/i);
    if (fullPlanMatch) {
      planName = fullPlanMatch[1].trim();
    } else {
      // Try to extract just the plan type and convert to full name
      const planTypeMatch = errorMessage.match(/Tu Plan\s+([\wáéíóú]+)/i);
      if (planTypeMatch) {
        const planType = planTypeMatch[1];
        switch (planType.toLowerCase()) {
          case 'básico':
            planName = 'Plan Básico';
            break;
          case 'startup':
            planName = 'Plan Startup';
            break;
          case 'profesional':
            planName = 'Plan Profesional';
            break;
          case 'empresarial':
            planName = 'Plan Empresarial';
            break;
          default:
            planName = `Plan ${planType}`;
        }
      }
    }
    
    console.log('Extracted plan name:', planName, 'from message:', errorMessage);

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