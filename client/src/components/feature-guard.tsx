import React from 'react';
import { useFeatureCheck } from '@/hooks/use-feature-access';
import { useUpgradePopup } from './upgrade-popup';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  feature: string;
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
  children: React.ReactNode;
}

/**
 * Componente que envuelve funcionalidades que requieren verificación de plan
 * Muestra el contenido si el usuario tiene acceso, o un fallback si no
 */
export function FeatureGuard({ 
  feature, 
  fallback, 
  showUpgradeButton = true, 
  children 
}: FeatureGuardProps) {
  const { hasAccess, needsUpgrade, isLoading, upgradeMessage, requiredPlanName, currentPlan, requiredPlan, featureName } = useFeatureCheck(feature);
  const { showUpgradePopup, UpgradePopupComponent } = useUpgradePopup();

  const handleUpgradeClick = () => {
    if (needsUpgrade && upgradeMessage && requiredPlanName) {
      showUpgradePopup({
        feature: featureName || feature,
        currentPlan,
        requiredPlan: requiredPlan || 'startup',
        requiredPlanName,
        upgradeMessage
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Si no tiene acceso, mostrar fallback o botón de upgrade
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradeButton && needsUpgrade) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-muted-foreground/25 rounded-lg bg-muted/30">
        <Lock className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground text-center mb-4">
          {upgradeMessage || `Esta función requiere actualizar tu plan`}
        </p>
        <Button onClick={handleUpgradeClick} size="sm">
          Ver planes disponibles
        </Button>
        {UpgradePopupComponent}
      </div>
    );
  }

  return null;
}

interface ClickableFeatureGuardProps {
  feature: string;
  onAccessGranted: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Componente que permite hacer clic pero verifica el acceso antes de ejecutar la acción
 * Útil para botones que deben estar visibles pero mostrar popup de upgrade
 */
export function ClickableFeatureGuard({ 
  feature, 
  onAccessGranted, 
  children, 
  disabled = false 
}: ClickableFeatureGuardProps) {
  const { hasAccess, needsUpgrade, upgradeMessage, requiredPlanName, currentPlan, requiredPlan, featureName } = useFeatureCheck(feature);
  const { showUpgradePopup, UpgradePopupComponent } = useUpgradePopup();

  const handleClick = () => {
    if (disabled) return;
    
    if (hasAccess) {
      onAccessGranted();
    } else if (needsUpgrade && upgradeMessage && requiredPlanName) {
      showUpgradePopup({
        feature: featureName || feature,
        currentPlan,
        requiredPlan: requiredPlan || 'startup',
        requiredPlanName,
        upgradeMessage
      });
    }
  };

  return (
    <>
      <div onClick={handleClick} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {children}
      </div>
      {UpgradePopupComponent}
    </>
  );
}

interface ConditionalFeatureGuardProps {
  feature: string;
  children: (hasAccess: boolean, showUpgrade: () => void) => React.ReactNode;
}

/**
 * Componente render prop que proporciona información de acceso a características
 */
export function ConditionalFeatureGuard({ feature, children }: ConditionalFeatureGuardProps) {
  const { hasAccess, needsUpgrade, upgradeMessage, requiredPlanName, currentPlan, requiredPlan, featureName } = useFeatureCheck(feature);
  const { showUpgradePopup, UpgradePopupComponent } = useUpgradePopup();

  const showUpgrade = () => {
    if (needsUpgrade && upgradeMessage && requiredPlanName) {
      showUpgradePopup({
        feature: featureName || feature,
        currentPlan,
        requiredPlan: requiredPlan || 'startup',
        requiredPlanName,
        upgradeMessage
      });
    }
  };

  return (
    <>
      {children(hasAccess, showUpgrade)}
      {UpgradePopupComponent}
    </>
  );
}