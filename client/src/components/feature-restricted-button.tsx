import React from 'react';
import { Button, ButtonProps } from './ui/button';
import { useFeatureCheck } from '@/hooks/use-feature-access';
import { useUpgradePopup } from './upgrade-popup';
import { Lock } from 'lucide-react';

interface FeatureRestrictedButtonProps extends ButtonProps {
  feature: string;
  onAccessGranted: () => void;
  children: React.ReactNode;
  showLockIcon?: boolean;
}

/**
 * Botón que verifica el acceso a características antes de ejecutar la acción
 * Muestra popup de upgrade si no tiene acceso
 */
export function FeatureRestrictedButton({ 
  feature, 
  onAccessGranted, 
  children, 
  showLockIcon = false,
  disabled,
  ...buttonProps 
}: FeatureRestrictedButtonProps) {
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
      <Button
        {...buttonProps}
        onClick={handleClick}
        disabled={disabled}
      >
        {!hasAccess && showLockIcon && (
          <Lock className="h-4 w-4 mr-2" />
        )}
        {children}
      </Button>
      {UpgradePopupComponent}
    </>
  );
}

interface FeatureRestrictedLinkProps {
  feature: string;
  onAccessGranted: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Link que verifica el acceso a características antes de navegar
 */
export function FeatureRestrictedLink({ 
  feature, 
  onAccessGranted, 
  children, 
  className = '' 
}: FeatureRestrictedLinkProps) {
  const { hasAccess, needsUpgrade, upgradeMessage, requiredPlanName, currentPlan, requiredPlan, featureName } = useFeatureCheck(feature);
  const { showUpgradePopup, UpgradePopupComponent } = useUpgradePopup();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
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
      <a 
        href="#" 
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
      {UpgradePopupComponent}
    </>
  );
}