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
    // Extract plan information from error message
    const planMatch = errorMessage.match(/Plan\s+(\w+)/i);
    const planName = planMatch ? planMatch[1] : 'Básico';

    // Determine limit type and extract numbers
    if (errorMessage.includes('integración')) {
      const limitMatch = errorMessage.match(/(\d+)/);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 1;
      showUpgradeModal('integrations', currentLimit, planName);
    } else if (errorMessage.includes('formulario')) {
      const limitMatch = errorMessage.match(/(\d+)/);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 1;
      showUpgradeModal('forms', currentLimit, planName);
    } else if (errorMessage.includes('conversación')) {
      const limitMatch = errorMessage.match(/(\d+)/);
      const currentLimit = limitMatch ? parseInt(limitMatch[1]) : 20;
      showUpgradeModal('conversations', currentLimit, planName);
    } else {
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