// Global error interceptor for plan limit errors
import { useEffect } from 'react';
import { useUpgradeModal } from '@/hooks/use-upgrade-modal';

let globalUpgradeHandler: ((error: Error) => void) | null = null;

export const setGlobalUpgradeHandler = (handler: (error: Error) => void) => {
  globalUpgradeHandler = handler;
};

export const handleGlobalPlanLimitError = (error: Error) => {
  if (error.message && error.message.includes("límite") && globalUpgradeHandler) {
    globalUpgradeHandler(error);
  }
};

// Hook to initialize global error handling
export const useGlobalUpgradeInterceptor = () => {
  const upgradeModal = useUpgradeModal();
  
  useEffect(() => {
    setGlobalUpgradeHandler((error: Error) => {
      upgradeModal.handlePlanLimitError(error.message);
    });
    
    return () => {
      setGlobalUpgradeHandler(() => {});
    };
  }, [upgradeModal]);
};